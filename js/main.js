// ============================================================
// CATPLANET — общий скрипт (шапка, тема, звёзды, копирование)
// Примечание: localStorage намеренно не используется, чтобы
// сайт корректно работал в любом окружении предпросмотра.
// Для боевого сайта можно добавить сохранение темы в cookie.
// ============================================================
(function () {
  "use strict";

  /* --- Звёздное поле ------------------------------------------------ */
  function buildStarfield() {
    const field = document.querySelector(".starfield");
    if (!field) return;
    const count = window.innerWidth < 700 ? 40 : 80;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.className = "starfield__star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.setProperty("--s", (Math.random() * 1.6 + 0.6).toFixed(2) + "px");
      star.style.setProperty("--o", (Math.random() * 0.5 + 0.25).toFixed(2));
      star.style.setProperty("--d", (Math.random() * 4 + 3).toFixed(2) + "s");
      star.style.setProperty("--delay", (Math.random() * 5).toFixed(2) + "s");
      frag.appendChild(star);
    }
    field.appendChild(frag);
  }

  /* --- Переключатель темы -------------------------------------------- */
  function initThemeToggle() {
    const root = document.documentElement;
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      toggle.setAttribute("aria-pressed", String(next === "light"));
    });
  }

  /* --- Мобильное меню -------------------------------------------------- */
  function initBurger() {
    const burger = document.querySelector("[data-burger]");
    const panel = document.querySelector("[data-mobile-nav]");
    if (!burger || !panel) return;
    burger.addEventListener("click", function () {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
      });
    });
  }

  /* --- Копирование в буфер обмена -------------------------------------- */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "readonly");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }

  function initCopyButtons() {
    const feedback = document.getElementById("copyFeedback");
    let timer = null;

    function showFeedback(message) {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.classList.add("is-visible");
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        feedback.classList.remove("is-visible");
      }, 2200);
    }

    document.querySelectorAll("[data-copy-text]").forEach(function (button) {
      const original = button.textContent;
      button.addEventListener("click", async function () {
        const text = button.dataset.copyText || "";
        try {
          await copyText(text);
          if (button.id === "copyDomainButton") {
            showFeedback("IP скопирован: " + text);
          } else {
            button.textContent = "Скопировано";
            window.setTimeout(function () { button.textContent = original; }, 1400);
          }
        } catch (err) {
          showFeedback("Не удалось скопировать");
        }
      });
    });
  }

  /* --- Слайдер команды (использует data-direction) ----------------------- */
  function initSlider() {
    const slider = document.getElementById("teamSlider");
    if (!slider) return;
    const track = slider.querySelector(".team-track");
    const arrows = slider.querySelectorAll(".team-arrow");
    const step = 236;
    arrows.forEach(function (button) {
      button.addEventListener("click", function () {
        const dir = button.dataset.direction === "next" ? 1 : -1;
        track.scrollBy({ left: step * dir, behavior: "smooth" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildStarfield();
    initThemeToggle();
    initBurger();
    initCopyButtons();
    initSlider();
  });
})();
