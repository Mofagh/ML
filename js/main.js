// ============================================================
// CATPLANET — общий скрипт (загрузчик, шапка, копирование, виджеты)
// Примечание: localStorage намеренно не используется, чтобы
// сайт корректно работал в любом окружении предпросмотра.
// Для боевого сайта можно добавить сохранение темы в cookie.
// ============================================================
(function () {
  "use strict";

  /* --- Прелоадер ------------------------------------------------------
     Скрывается, когда DOM полностью построен. Небольшая минимальная
     задержка (.is-loading держится не меньше ~350мс) — чтобы анимация
     читалась как осознанный момент, а не моргала на быстром интернете. */
  function initPageLoader() {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;
    document.body.classList.add("is-loading");
    const shownAt = performance.now();
    const MIN_VISIBLE_MS = 350;

    function hide() {
      loader.classList.add("is-hidden");
      document.body.classList.remove("is-loading");
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 450);
    }

    const elapsed = performance.now() - shownAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    window.setTimeout(hide, wait);
  }

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

  /* --- Плавающий тост -------------------------------------------------- */
  function spawnToast(message) {
    let toast = document.getElementById("floatingToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "floatingToast";
      toast.className = "floating-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove("is-visible");
    // форсируем reflow, чтобы перезапустить transition при повторном вызове подряд
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    window.clearTimeout(spawnToast._timer);
    spawnToast._timer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
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
    document.querySelectorAll("[data-copy-text]").forEach(function (button) {
      const original = button.textContent;
      const hasMorphState = !!button.querySelector(".copy-trigger__state--success");

      button.addEventListener("click", async function () {
        const text = button.dataset.copyText || "";
        try {
          await copyText(text);

          if (button.id === "copyDomainButton") {
            // Премиальная кнопка IP: морф текста кнопки + плавающий тост одновременно.
            button.classList.add("is-copied");
            spawnToast("IP скопирован — " + text);
            window.clearTimeout(button._resetTimer);
            button._resetTimer = window.setTimeout(function () {
              button.classList.remove("is-copied");
            }, 1800);
          } else if (hasMorphState) {
            button.classList.add("is-copied");
            window.clearTimeout(button._resetTimer);
            button._resetTimer = window.setTimeout(function () {
              button.classList.remove("is-copied");
            }, 1400);
          } else {
            // Простые command-кнопки в вики — лёгкий swap текста, без тоста на каждый клик.
            button.textContent = "Скопировано";
            window.setTimeout(function () {
              button.textContent = original;
            }, 1400);
          }
        } catch (err) {
          spawnToast("Не удалось скопировать");
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

  /* --- Discord online-виджет --------------------------------------------
     Реальный, не фейковый счётчик. Чтобы включить:
     1. В настройках Discord-сервера → Widget → включить "Server Widget".
     2. Подставить ID сервера вместо YOUR_GUILD_ID в data-discord-online
        у элемента .stat-chip в index.html.
     Пока ID не подставлен — функция тихо завершает работу и в чипе
     остаётся плейсхолдер «—». */
  function initDiscordWidget() {
    const el = document.querySelector("[data-discord-online]");
    if (!el) return;
    const guildId = el.getAttribute("data-discord-online");
    if (!guildId || guildId === "YOUR_GUILD_ID") return;

    fetch("https://discord.com/api/guilds/" + guildId + "/widget.json")
      .then(function (res) {
        return res.ok ? res.json() : Promise.reject(res.status);
      })
      .then(function (data) {
        if (typeof data.presence_count === "number") {
          el.textContent = data.presence_count;
        }
      })
      .catch(function () {
        // виджет выключен на сервере, неверный ID или сеть недоступна —
        // молча остаёмся на плейсхолдере, без ошибок в интерфейсе.
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPageLoader();
    buildStarfield();
    initThemeToggle();
    initBurger();
    initCopyButtons();
    initSlider();
    initDiscordWidget();
  });
})();
