/* Шапка: пока под ней фото героя — стекло прозрачное,
   дальше — светлое, чтобы чёрный текст читался на белом. */
(() => {
  const header = document.querySelector("[data-header]");
  if (!header || header.classList.contains("site-header--solid")) return;

  const hero = document.querySelector(".hero");
  let frame = 0;

  const threshold = () =>
    hero ? hero.offsetHeight - header.offsetHeight - 8 : 24;

  const sync = () => {
    frame = 0;
    header.classList.toggle("is-stuck", window.scrollY > threshold());
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  };

  sync();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
})();
