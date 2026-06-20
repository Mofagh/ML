// ============================================================
// CATPLANET — скрипт вики (активная ссылка в сайдбаре, мобильный селект)
// ============================================================
(function () {
  "use strict";

  function initScrollspy() {
    const links = Array.from(document.querySelectorAll(".wiki-nav-link"));
    const articles = Array.from(document.querySelectorAll(".wiki-article"));
    if (!links.length || !articles.length) return;

    const byId = {};
    links.forEach(function (link) {
      byId[link.getAttribute("href").slice(1)] = link;
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const link = byId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) { l.classList.remove("is-active"); });
            link.classList.add("is-active");
            const select = document.getElementById("wikiMobileSelect");
            if (select) select.value = entry.target.id;
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    articles.forEach(function (article) { observer.observe(article); });
  }

  function initMobileSelect() {
    const select = document.getElementById("wikiMobileSelect");
    if (!select) return;
    select.addEventListener("change", function () {
      const target = document.getElementById(select.value);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initScrollspy();
    initMobileSelect();
  });
})();
