/* Прайс: длительность переключает цены в строках, тренажёрские форматы
   показывают, что инвентарь уже входит. Само бронирование — в Yclients. */
(() => {
  const root = document.querySelector("[data-calc]");
  if (!root) return;

  const durationInputs = [...root.querySelectorAll('input[name="duration"]')];
  const formatInputs = [...root.querySelectorAll('input[name="format"]')];
  const extras = root.querySelector("[data-extras]");
  const extrasNote = root.querySelector("[data-extras-note]");
  const extraInputs = [...root.querySelectorAll("input[data-extra]")];
  const stepperButtons = [...root.querySelectorAll("[data-step]")];

  if (!durationInputs.length || !formatInputs.length) return;

  const pricesOf = (el) => el.dataset.prices.split(",").map(Number);

  const durationIndex = () => {
    const checked = durationInputs.find((input) => input.checked) || durationInputs[0];
    return Number(checked.dataset.index) || 0;
  };

  const perPerson = (format, price) => {
    if (Number(format.dataset.players) === 1) return "за одного";
    const each = price / Number(format.dataset.players);
    return `${Number.isInteger(each) ? "" : "≈ "}${Math.round(each)} BYN с человека`;
  };

  function syncPrices() {
    const index = durationIndex();

    formatInputs.forEach((format) => {
      const row = format.closest(".format");
      const price = pricesOf(format)[index];
      row.querySelector("[data-price]").textContent = price;
      row.querySelector("[data-per]").textContent = perPerson(format, price);
    });

    extraInputs.forEach((input) => {
      const price = pricesOf(input)[index];
      const node = root.querySelector(`[data-extra-price="${input.dataset.extra}"]`);
      if (node) node.textContent = price;
    });
  }

  function syncExtras() {
    const chosen = formatInputs.find((input) => input.checked) || formatInputs[0];
    const included = chosen.dataset.training === "true";

    extras.classList.toggle("is-included", included);
    extraInputs.forEach((input) => {
      input.disabled = included;
    });
    if (extrasNote) {
      extrasNote.textContent = included
        ? "входит в тренировку"
        : "нужен, если играете без своего";
    }
  }

  durationInputs.forEach((input) => input.addEventListener("change", syncPrices));
  formatInputs.forEach((input) => input.addEventListener("change", syncExtras));

  stepperButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.closest(".stepper").querySelector("input");
      if (!input || input.disabled) return;
      const step = Number(button.dataset.step);
      const min = Number(input.min) || 0;
      const max = Number(input.max) || 99;
      input.value = Math.min(max, Math.max(min, (Number(input.value) || 0) + step));
    });
  });

  syncPrices();
  syncExtras();
})();
