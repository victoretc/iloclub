/* Шапка: пока под ней фото героя и чёрный блок тренеров — стекло прозрачное,
   дальше (с третьего блока) — светлое, чтобы чёрный текст читался на белом.
   На мобильных разделы живут в панели под пилюлей. */
(() => {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const toggle = header.querySelector("[data-header-toggle]");
  const panel = header.querySelector("[data-header-panel]");
  const menuQuery = window.matchMedia("(max-width: 720px)");

  if (toggle && panel) {
    const isOpen = () => header.classList.contains("is-menu-open");

    const setMenu = (open) => {
      header.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setMenu(!isOpen()));

    panel.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("pointerdown", (event) => {
      if (isOpen() && !header.contains(event.target)) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });

    // на десктопе панели нет: не оставляем открытое состояние при повороте экрана
    menuQuery.addEventListener("change", (event) => {
      if (!event.matches) setMenu(false);
    });
  }

  if (header.classList.contains("site-header--solid")) return;

  const switchBlock = document.querySelectorAll("main > section")[2] || null;
  let frame = 0;

  const sync = () => {
    frame = 0;
    const reached = switchBlock
      ? switchBlock.getBoundingClientRect().top <= header.offsetHeight - 8
      : window.scrollY > 24;
    header.classList.toggle("is-stuck", reached);
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  };

  sync();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
})();
