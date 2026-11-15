/* Просмотр фотографий: открываем снимок целиком в модальном окне. */
(() => {
  const dialog = document.querySelector(".lightbox");
  if (!dialog) return;

  const image = dialog.querySelector(".lightbox-img");
  const closeButton = dialog.querySelector(".lightbox-close");
  const triggers = [...document.querySelectorAll("[data-photo-open]")];
  const root = document.documentElement;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const source = trigger.querySelector("img");
      if (!source || !image) return;

      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      root.classList.add("no-scroll");
      if (!dialog.open) dialog.showModal();
    });
  });

  if (closeButton) closeButton.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    root.classList.remove("no-scroll");
  });
})();
