(() => {
  const form = document.querySelector(".paper-filters");
  const groups = [...document.querySelectorAll(".paper-year")].map((section) => ({
    section,
    papers: [...section.querySelectorAll("[data-paper]")].map((element) => ({
      element,
      text: element.textContent.normalize("NFKC").toLowerCase(),
    })),
  }));
  const count = document.querySelector(".paper-count");
  const empty = document.querySelector(".paper-empty");
  const query = form.elements.query;
  const kind = form.elements.kind;

  function filterPapers() {
    const terms = query.value.normalize("NFKC").toLowerCase().trim().split(/\s+/);
    let total = 0;
    for (const { section, papers } of groups) {
      let visible = 0;
      for (const { element, text } of papers) {
        const matchesType = !kind.value || element.dataset.kind === kind.value;
        element.hidden = !(matchesType && terms.every((term) => text.includes(term)));
        if (!element.hidden) visible += 1;
      }
      section.hidden = visible === 0;
      total += visible;
    }
    count.textContent = total === 1 ? "1 publication" : `${total} publications`;
    empty.hidden = total > 0;
  }

  form.addEventListener("input", filterPapers);
  form.addEventListener("change", filterPapers);
  form.addEventListener("submit", (event) => event.preventDefault());
  filterPapers();
  form.hidden = false;
})();
