/* Ракетка в футере: её можно взять мышью и возить по сетке.
   Двигаешь ракетку — головка бьёт мячи, попавшие под неё: скорость и
   направление удара берём от движения курсора. Мячи живут в footer-balls.js. */
(() => {
  const net = document.querySelector(".footer-net");
  const racket = net && net.querySelector(".footer-net-racket");
  const face = racket && racket.querySelector(".footer-net-racket-face");
  if (!net || !racket || !face) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const MIN_SPEED = 220; // медленное перетаскивание мяч не толкает
  const EDGE = 6; // ракетка не липнет к столбам
  const BOTTOM_SLACK = 60; // повёрнутая рамка выходит за сцену прозрачными углами

  let offX = 0;
  let offY = 0;
  let drag = null;

  const paint = () => {
    racket.style.setProperty("--rx", `${offX.toFixed(1)}px`);
    racket.style.setProperty("--ry", `${offY.toFixed(1)}px`);
  };

  /* держим ракетку в пределах сцены: считаем от базового положения */
  const clamp = (x, y) => {
    const box = net.getBoundingClientRect();
    const rect = racket.getBoundingClientRect();
    const base = { left: rect.left - offX, right: rect.right - offX, top: rect.top - offY, bottom: rect.bottom - offY };

    return {
      x: Math.min(box.right - EDGE - base.right, Math.max(box.left + EDGE - base.left, x)),
      y: Math.min(box.bottom + BOTTOM_SLACK - base.bottom, Math.max(box.top - base.top, y)),
    };
  };

  const strike = (vx, vy) => {
    const speed = Math.hypot(vx, vy);
    if (speed < MIN_SPEED || typeof window.footerBallsHit !== "function") return;

    const box = face.getBoundingClientRect();
    window.footerBallsHit({
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
      radius: box.width * 0.8,
      power: Math.min(1100, speed * 0.5),
      dirX: vx,
      dirY: vy,
    });
  };

  racket.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();

    racket.classList.add("is-dragging");

    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      ox: offX,
      oy: offY,
      lx: event.clientX,
      ly: event.clientY,
      lt: performance.now(),
    };

    try {
      racket.setPointerCapture(event.pointerId);
    } catch (error) {
      /* синтетическое событие без активного указателя — просто тянем мышью */
    }
  });

  racket.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    event.preventDefault();

    const next = clamp(drag.ox + (event.clientX - drag.x), drag.oy + (event.clientY - drag.y));
    offX = next.x;
    offY = next.y;
    paint();

    const now = performance.now();
    const dt = Math.max(8, now - drag.lt) / 1000;
    const vx = (event.clientX - drag.lx) / dt;
    const vy = (event.clientY - drag.ly) / dt;

    strike(vx, vy);

    drag.lx = event.clientX;
    drag.ly = event.clientY;
    drag.lt = now;
  });

  const release = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    drag = null;
    racket.classList.remove("is-dragging");
  };

  racket.addEventListener("pointerup", release);
  racket.addEventListener("pointercancel", release);
})();
