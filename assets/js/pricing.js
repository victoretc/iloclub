/* Прайс: категории и длительность. Цены — информация,
   бронирование живёт в Yclients. */
(() => {
  const root = document.querySelector("[data-prices-root]");
  if (!root) return;

  const catInputs = [...root.querySelectorAll('input[name="price-cat"]')];
  const durationInputs = [...root.querySelectorAll('input[name="price-duration"]')];
  const lists = [...root.querySelectorAll(".price-list")];
  const listWrap = root.querySelector(".price-lists");
  const rows = [...root.querySelectorAll(".price-list li")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const durationIndex = () => {
    const checked = durationInputs.find((input) => input.checked) || durationInputs[0];
    return Number(checked.dataset.index) || 0;
  };

  // смена длительности: цифра меняется с коротким подъёмом, чтобы
  // внимание осталось на цене, а не уезжало вместе с табом
  function fadeValue(el) {
    if (!el || reduceMotion.matches) return;
    el.animate(
      [
        { opacity: 0, transform: "translateY(5px)" },
        { opacity: 1, transform: "none" }
      ],
      { duration: 150, easing: "cubic-bezier(0.2, 0, 0, 1)" }
    );
  }

  function syncPrices({ animate = false } = {}) {
    const index = durationIndex();

    rows.forEach((row) => {
      const price = Number(row.dataset.prices.split(",")[index]);
      const value = row.querySelector("[data-price]");
      value.textContent = price;
      if (animate) fadeValue(value);

      const per = row.querySelector("[data-per]");
      if (!per) return;

      const each = price / Number(row.dataset.players);
      per.textContent = `${Number.isInteger(each) ? "" : "≈ "}${Math.round(each)} BYN с человека`;
      if (animate) fadeValue(per);
    });
  }

  function syncCategory({ animate = false } = {}) {
    const value = (catInputs.find((input) => input.checked) || catInputs[0]).value;
    const from = listWrap && animate && !reduceMotion.matches
      ? listWrap.getBoundingClientRect().height
      : null;

    lists.forEach((list) => {
      list.hidden = list.dataset.cat !== value;
    });

    if (from === null || !listWrap) return;

    const to = listWrap.getBoundingClientRect().height;
    if (Math.abs(to - from) < 1) return;

    listWrap.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" }
    );
  }

  catInputs.forEach((input) => input.addEventListener("change", () => syncCategory({ animate: true })));
  durationInputs.forEach((input) => input.addEventListener("change", () => syncPrices({ animate: true })));

  syncCategory();
  syncPrices();
})();
