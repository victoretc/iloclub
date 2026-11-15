const loader = document.querySelector("[data-loader]");

if (loader) {
  const hide = () => {
    loader.classList.add("is-done");
    try {
      sessionStorage.setItem("ilo-loader", "1");
    } catch (e) {}
  };
  const started = performance.now();

  // Держим экран минимум 220 мс: иначе на быстром кэше он мигает.
  const finish = () => {
    const rest = Math.max(0, 220 - (performance.now() - started));
    window.setTimeout(hide, rest);
  };

  if (document.readyState === "complete") {
    finish();
  } else {
    window.addEventListener("load", finish, { once: true });
  }

  // Страховка: если какая-то картинка висит, экран всё равно уходит.
  window.setTimeout(hide, 6000);
}
