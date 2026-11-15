/* Мячи в футере: падают на пол, когда сцена доезжает до экрана.
   Мяч можно взять мышью — он летит за курсором, а на отпускании падает
   обратно и катится по полу. При prefers-reduced-motion ничего не делаем:
   мячи просто лежат на полу, как в вёрстке. */
(() => {
  const floor = document.querySelector("[data-ball-floor]");
  if (!floor) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const balls = [...floor.querySelectorAll(".footer-net-ball")];
  if (!balls.length) return;

  const GRAVITY = 2600; // px/с² — мяч долетает до пола за 0.2–0.3 с
  const BOUNCE = 0.42;
  const WALL_BOUNCE = 0.5;
  const PAD = 24; // отступ от столбов сетки
  const STAGGER = 70; // мс между падениями
  const KICK = [40, -30, 30]; // горизонтальный толчок в момент падения
  const MAX_VX = 1600;
  const MAX_UP = 1100; // выше потолка сцены мяч не улетает
  const MAX_DOWN = 1800;

  const items = balls.map((el, i) => ({
    el,
    x: 0, // смещение от места в вёрстке, px
    y: 0, // 0 — пол, минус — вверх
    vx: 0,
    vy: 0,
    r: 0,
    cx: 0,
    cy: 0,
    xMin: 0,
    xMax: 0,
    hold: 0,
    drag: null,
    touched: false,
    kick: KICK[i] || 0,
  }));

  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;
  let started = false;

  const measure = () => {
    width = floor.clientWidth;
    height = floor.clientHeight;

    items.forEach((b) => {
      b.r = b.el.offsetWidth / 2;
      b.cx = b.el.offsetLeft + b.r;
      b.cy = b.el.offsetTop + b.r;
      b.xMin = PAD + b.r - b.cx;
      b.xMax = width - PAD - b.r - b.cx;
    });
  };

  const render = (b) => {
    const lift = Math.min(1, Math.max(0, -b.y / Math.max(160, height)));
    b.el.style.setProperty("--bx", `${b.x.toFixed(2)}px`);
    b.el.style.setProperty("--by", `${b.y.toFixed(2)}px`);
    b.el.style.setProperty("--lift", lift.toFixed(3));
  };

  const clampBall = (b) => {
    b.x = Math.min(b.xMax, Math.max(b.xMin, b.x));
    b.y = Math.min(0, Math.max(-b.cy - b.r - 6, b.y));
  };

  /* мячи не проходят друг сквозь друга: разводим по нормали и гасим сближение */
  const collide = () => {
    for (let i = 0; i < items.length; i += 1) {
      const a = items[i];

      for (let j = i + 1; j < items.length; j += 1) {
        const b = items[j];
        const dx = b.cx + b.x - (a.cx + a.x);
        const dy = b.cy + b.y - (a.cy + a.y);
        const min = a.r + b.r;
        const dist2 = dx * dx + dy * dy;

        if (dist2 >= min * min || dist2 === 0) continue;

        const dist = Math.sqrt(dist2);
        const nx = dx / dist;
        const ny = dy / dist;
        const push = (min - dist) / 2;

        if (!a.drag) {
          a.x -= nx * push;
          a.y -= ny * push;
          a.touched = true;
        }
        if (!b.drag) {
          b.x += nx * push;
          b.y += ny * push;
          b.touched = true;
        }

        const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (closing >= 0) continue;

        const impulse = -closing * 0.7;
        if (!a.drag) {
          a.vx -= impulse * nx;
          a.vy -= impulse * ny;
        }
        if (!b.drag) {
          b.vx += impulse * nx;
          b.vy += impulse * ny;
        }
      }
    }
  };

  const tick = (now) => {
    frame = 0;
    const dt = Math.min(0.032, Math.max(0.001, (now - (last || now)) / 1000));
    last = now;

    let awake = false;

    for (const b of items) {
      if (b.drag || b.hold > now) {
        awake = true;
        continue;
      }

      if (b.y === 0 && b.vy === 0 && Math.abs(b.vx) < 5) {
        b.vx = 0;
        continue;
      }

      awake = true;
      b.vy += GRAVITY * dt;
      b.y += b.vy * dt;
      b.x += b.vx * dt;

      if (b.y >= 0) {
        b.y = 0;
        if (b.vy > 90) {
          b.vy = -b.vy * BOUNCE;
          b.vx *= 0.9;
        } else {
          b.vy = 0;
        }
        b.vx *= Math.exp(-2.6 * dt);
      }

      if (b.x < b.xMin) {
        b.x = b.xMin;
        b.vx = Math.abs(b.vx) * WALL_BOUNCE;
      } else if (b.x > b.xMax) {
        b.x = b.xMax;
        b.vx = -Math.abs(b.vx) * WALL_BOUNCE;
      }

      b.touched = true;
    }

    if (awake) {
      collide();
      items.forEach((b) => {
        if (b.y > 0) {
          b.y = 0;
          b.touched = true;
        }
      });
    }

    items.forEach((b) => {
      if (!b.touched) return;
      render(b);
      b.touched = false;
    });

    if (awake) frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const onDown = (event, b) => {
    if (event.button !== 0 || event.pointerType === "touch") return;
    event.preventDefault();

    b.el.setPointerCapture(event.pointerId);
    b.el.classList.add("is-dragging");
    b.hold = 0;
    b.vx = 0;
    b.vy = 0;
    b.drag = {
      id: event.pointerId,
      px: event.clientX,
      py: event.clientY,
      x: b.x,
      y: b.y,
      lx: event.clientX,
      ly: event.clientY,
      lt: performance.now(),
    };

    wake();
  };

  const onMove = (event, b) => {
    const drag = b.drag;
    if (!drag || drag.id !== event.pointerId) return;
    event.preventDefault();

    const now = performance.now();
    const dt = Math.max(8, now - drag.lt) / 1000;

    b.x = drag.x + (event.clientX - drag.px);
    b.y = Math.min(0, drag.y + (event.clientY - drag.py));
    clampBall(b);

    /* скорость курсора сглаживаем — её мяч получит при отпускании */
    b.vx = b.vx * 0.35 + ((event.clientX - drag.lx) / dt) * 0.65;
    b.vy = b.vy * 0.35 + ((event.clientY - drag.ly) / dt) * 0.65;

    drag.lx = event.clientX;
    drag.ly = event.clientY;
    drag.lt = now;

    render(b);
    wake();
  };

  const onUp = (event, b) => {
    if (!b.drag || b.drag.id !== event.pointerId) return;

    /* если курсор перед отпусканием замер, бросок не должен наследовать старую скорость */
    if (performance.now() - b.drag.lt > 90) {
      b.vx = 0;
      b.vy = 0;
    }

    b.drag = null;
    b.el.classList.remove("is-dragging");
    b.vx = Math.max(-MAX_VX, Math.min(MAX_VX, b.vx));
    b.vy = Math.max(-MAX_UP, Math.min(MAX_DOWN, b.vy));

    wake();
  };

  const drop = () => {
    if (started) return;
    started = true;

    measure();
    const now = performance.now();

    items.forEach((b, i) => {
      b.hold = now + i * STAGGER;
      b.y = -(b.cy + b.r + 30); // за верхним краем сцены
      b.vy = 0;
      b.vx = b.kick;
      b.touched = true;
      render(b);
    });

    wake();
  };

  /* удар ракеткой: толкаем мячи, попавшие в радиус головки */
  window.footerBallsHit = (hit) => {
    if (!hit) return;
    const box = floor.getBoundingClientRect();
    const hx = hit.x - box.left;
    const hy = hit.y - box.top;

    const now = performance.now();

    items.forEach((b) => {
      if (b.drag) return;
      // один удар за проход: иначе мяч разгоняется на каждом кадре
      if (now - (b.hitAt || 0) < 120) return;

      const dx = b.cx + b.x - hx;
      const dy = b.cy + b.y - hy;
      const dist = Math.hypot(dx, dy);
      const reach = hit.radius + b.r;
      if (dist > reach) return;

      let nx = dist > 0.5 ? dx / dist : 0.8;
      let ny = dist > 0.5 ? dy / dist : -0.6;

      // если задано направление удара — бьём им, иначе расталкиваем от центра
      const dirLen = Math.hypot(hit.dirX || 0, hit.dirY || 0);
      if (dirLen > 1) {
        nx = hit.dirX / dirLen;
        ny = hit.dirY / dirLen;
      }

      const force = hit.power * (1 - dist / reach);

      b.hitAt = now;
      b.hold = 0;
      b.vx += nx * force;
      b.vy += ny * force * 0.5 - force * 0.34;
      b.touched = true;
    });

    wake();
  };

  items.forEach((b) => {
    b.el.addEventListener("pointerdown", (event) => onDown(event, b));
    b.el.addEventListener("pointermove", (event) => onMove(event, b));
    b.el.addEventListener("pointerup", (event) => onUp(event, b));
    b.el.addEventListener("pointercancel", (event) => onUp(event, b));
  });

  window.addEventListener(
    "resize",
    () => {
      measure();
      items.forEach((b) => {
        b.y = started ? b.y : -(b.cy + b.r + 30);
        clampBall(b);
        render(b);
      });
    },
    { passive: true }
  );

  measure();

  /* до первого показа мячи ждут за кадром */
  items.forEach((b) => {
    b.y = -(b.cy + b.r + 30);
    render(b);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      drop();
    },
    { threshold: 0.4 }
  );

  observer.observe(floor);
})();
