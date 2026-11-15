/* Частые вопросы: раскрытие по высоте.
   Аккордеон — один из немногих случаев, где анимация height оправдана. */
(() => {
  const items = [...document.querySelectorAll(".faq-item")];
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
      const isOpen = item.classList.contains("is-open");

      if (reduceMotion.matches) {
        item.classList.toggle("is-open", !isOpen);
        button.setAttribute("aria-expanded", String(!isOpen));
        body.style.height = isOpen ? "0px" : "auto";
        return;
      }

      if (isOpen) {
        body.style.height = `${body.getBoundingClientRect().height}px`;
        void body.offsetHeight;
        item.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
        body.style.height = "0px";
        return;
      }

      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      body.style.height = `${body.scrollHeight}px`;
    });
  });
})();
