"""Import published works from the public ORCID record into the Jekyll collection."""

import argparse
import hashlib
import json
import re
import time
from datetime import date
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
KINDS = {"journal-article", "conference-paper", "book-chapter"}
DOI = re.compile(r"10\.\d{4,9}/\S+", re.I)


def get_json(url, allow_missing=False):
    request = Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "Yu-Zhao-Academic-Pages/1.0 (+https://zhaoyuchinese.github.io/)",
    })
    for attempt in range(3):
        try:
            with urlopen(request, timeout=20) as response:
                return json.load(response)
        except HTTPError as error:
            if allow_missing and error.code == 404:
                return None
            if error.code not in {429, 500, 502, 503, 504} or attempt == 2:
                raise
        except (TimeoutError, URLError):
            if attempt == 2:
                raise
        time.sleep(2 ** attempt)
    raise RuntimeError(f"No response from {url}")


def clean(text):
    return " ".join(unescape(re.sub(r"<[^>]+>", "", text or "")).split())


def title_key(title):
    return "".join(char for char in clean(title).casefold() if char.isalnum())


def publication_date(parts):
    if not parts:
        return None
    year, month, day = (list(parts) + [1, 1])[:3]
    return date(int(year), int(month), int(day))


def format_paper(summary, doi, kind):
    encoded = quote(doi, safe="/")
    title = summary["title"]["title"]["value"]
    venue = (summary.get("journal-title") or {}).get("value")
    dates = summary.get("publication-date") or {}
    parts = [(dates.get(field) or {}).get("value") for field in ("year", "month", "day")]
    published = publication_date([part or 1 for part in parts]) if parts[0] else None
    authors = []

    crossref = get_json(f"https://api.crossref.org/works/{encoded}", allow_missing=True)
    if crossref:
        work = crossref["message"]
        title = next(iter(work.get("title", [])), title)
        venues = work.get("container-title", [])
        if venues:
            venue = venues[-1]
        parts = (work.get("published") or {}).get("date-parts", [[]])[0]
        published = publication_date(parts) or published
        authors = [
            author.get("name") or " ".join(filter(None, (author.get("given"), author.get("family"))))
            for author in work.get("author", [])
        ]
    else:
        datacite = get_json(f"https://api.datacite.org/dois/{encoded}", allow_missing=True)
        if datacite:
            work = datacite["data"]["attributes"]
            title = next(iter(work.get("titles", [])), {}).get("title") or title
            venue = (work.get("container") or {}).get("title") or venue or work.get("publisher")
            if not published and work.get("publicationYear"):
                published = date(int(work["publicationYear"]), 1, 1)
            authors = [
                " ".join(filter(None, (author.get("givenName"), author.get("familyName"))))
                or author.get("name", "")
                for author in work.get("creators", [])
            ]

    if not published or published > date.today():
        return None

    slug = hashlib.sha256(doi.encode()).hexdigest()[:16]
    return {
        "title": clean(title),
        "date": published.isoformat(),
        "permalink": f"/publication/orcid-{slug}/",
        "collection": "publications",
        "kind": kind,
        "venue": clean(venue),
        "authors": [clean(author) for author in authors if clean(author)],
        "doi": doi,
        "source": "orcid",
    }


def manual_keys(folder):
    dois = set()
    titles = set()
    for path in folder.glob("*.md"):
        front_matter = path.read_text(encoding="utf-8").split("---", 2)[1]
        doi = re.search(r"^doi:\s*[\x22\x27]?(10\.\S+?)[\x22\x27]?\s*$", front_matter, re.M | re.I)
        title = re.search(r"^title:[ \t]*(.+)$", front_matter, re.M)
        if doi:
            dois.add(doi[1].casefold())
        if title:
            titles.add(title_key(title[1].strip("\"'")))
    return dois, titles


def sync(orcid, folder):
    payload = get_json(f"https://pub.orcid.org/v3.0/{orcid}/works")
    groups = payload["group"]
    if not isinstance(groups, list) or not groups:
        raise RuntimeError(f"No public works returned for ORCID {orcid}")

    existing_dois, existing_titles = manual_keys(folder)
    papers = []
    for group in groups:
        for summary in group["work-summary"]:
            kind = summary["type"]
            if kind not in KINDS:
                continue
            ids = (summary.get("external-ids") or {}).get("external-id", [])
            doi = next((
                entry["external-id-value"].strip().casefold() for entry in ids
                if entry["external-id-type"].lower() == "doi"
                and entry.get("external-id-relationship") == "self"
                and DOI.fullmatch(entry["external-id-value"].strip())
            ), None)
            title = title_key(summary["title"]["title"]["value"])
            if not doi or doi in existing_dois or title in existing_titles:
                continue

            paper = format_paper(summary, doi, kind)
            if paper and title_key(paper["title"]) not in existing_titles:
                existing_dois.add(doi)
                existing_titles.update((title, title_key(paper["title"])))
                papers.append(paper)

    output = folder / "orcid"
    output.mkdir(exist_ok=True)
    written = set()
    for paper in papers:
        name = paper["permalink"].strip("/").split("/")[-1]
        target = output / f"{name}.md"
        lines = [f"{key}: {json.dumps(value, ensure_ascii=False)}" for key, value in paper.items()]
        temporary = target.with_suffix(".tmp")
        temporary.write_text("---\n" + "\n".join(lines) + "\n---\n", encoding="utf-8")
        temporary.replace(target)
        written.add(target)
    for stale in set(output.glob("orcid-*.md")) - written:
        stale.unlink()
    print(f"ORCID sync complete. {len(papers)} additional publications.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--orcid", required=True)
    args = parser.parse_args()
    if not re.fullmatch(r"(\d{4}-){3}\d{3}[0-9X]", args.orcid):
        parser.error("Use an ORCID iD in 0000-0000-0000-0000 format.")
    sync(args.orcid, ROOT / "_publications")
