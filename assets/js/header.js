/* Шапка: пока под ней фото героя и чёрный блок тренеров — стекло прозрачное,
   дальше (с третьего блока) — светлое, чтобы чёрный текст читался на белом. */
(() => {
  const header = document.querySelector("[data-header]");
  if (!header || header.classList.contains("site-header--solid")) return;

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
