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

  function syncPrices() {
    const index = durationIndex();

    rows.forEach((row) => {
      const price = Number(row.dataset.prices.split(",")[index]);
      row.querySelector("[data-price]").textContent = price;

      const per = row.querySelector("[data-per]");
      if (!per) return;

      const each = price / Number(row.dataset.players);
      per.textContent = `${Number.isInteger(each) ? "" : "≈ "}${Math.round(each)} BYN с человека`;
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
  durationInputs.forEach((input) => input.addEventListener("change", syncPrices));

  syncCategory();
  syncPrices();
})();
