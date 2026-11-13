"""Validate the publish form and save one Jekyll news entry."""

import json
import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit


def save_news():
    title = os.environ["NEWS_TITLE"].strip()
    text = os.environ["NEWS_TEXT"].strip()
    category = os.environ["NEWS_CATEGORY"]
    date_input = os.environ["NEWS_DATE"].strip()
    url = os.environ["NEWS_URL"].strip()
    if not title or not text:
        raise ValueError("Enter both a headline and news text.")
    if category not in {
        "journal", "conference", "funding", "preprint", "talk", "award", "service",
        "collaboration", "release", "team", "teaching", "general", "acceptance", "publication",
    }:
        raise ValueError("Choose a valid news category.")

    if date_input:
        day = date.fromisoformat(date_input)
        if day.isoformat() != date_input:
            raise ValueError("Enter the date as YYYY-MM-DD.")
    else:
        day = datetime.now(timezone(timedelta(hours=8))).date()

    item = {"date": day.isoformat(), "type": category, "title": title, "text": text}
    if url:
        link = urlsplit(url)
        if link.scheme != "https" or not link.hostname or link.username is not None:
            raise ValueError("Enter an HTTPS link without embedded credentials.")
        item["url"] = url

    folder = Path("_data/news_entries")
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f'{int(os.environ["GITHUB_RUN_ID"])}.json'
    if not target.exists():
        target.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        save_news()
    except ValueError as error:
        raise SystemExit(str(error)) from None
