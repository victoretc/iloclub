/* Частые вопросы: раскрытие по высоте.
   Аккордеон — один из немногих случаев, где анимация height оправдана. */
(() => {
  const items = [...document.querySelectorAll(".faq-item")];
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const close = (item) => {
    const body = item.querySelector(".faq-body");
    const button = item.querySelector(".faq-q");
    if (!body || !button || !item.classList.contains("is-open")) return;

    if (!reduceMotion.matches) {
      body.style.height = `${body.getBoundingClientRect().height}px`;
      void body.offsetHeight;
    }

    item.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    body.style.height = "0px";
  };

  items.forEach((item) => {
    const button = item.querySelector(".faq-q");
    const body = item.querySelector(".faq-body");
    if (!button || !body) return;

    body.addEventListener("transitionend", (event) => {
      if (event.target !== body || event.propertyName !== "height") return;
      // после раскрытия отдаём высоту содержимому, иначе она не переживёт перенос строк
      if (item.classList.contains("is-open")) body.style.height = "auto";
    });

    button.addEventListener("click", () => {
      if (item.classList.contains("is-open")) {
        close(item);
        return;
      }

      // открыт всегда один вопрос: остальные закрываем
      items.forEach((other) => {
        if (other !== item) close(other);
      });

      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      body.style.height = reduceMotion.matches ? "auto" : `${body.scrollHeight}px`;
    });
  });
})();
