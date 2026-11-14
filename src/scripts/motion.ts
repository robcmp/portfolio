/**
 * Motion layer: rotating ASCII torus, scramble headings, self-typing terminal,
 * glyph rain, cursor spotlights and clocks.
 *
 * Every loop is gated behind a user-controllable switch (WCAG 2.2.2) that
 * defaults to off when the OS asks for reduced motion, and the switch state is
 * persisted per browser. Text that animates is always paired with a static
 * screen-reader copy in the markup, so nothing here rewrites real content.
 */

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const STORE_KEY = 'rmendoza:motion';
const SMALL_SCREEN = 768;

/** Motion runs unless the OS asks for reduced motion or the user switched it off. */
let motion = !reduceQuery.matches;
try {
  const stored = localStorage.getItem(STORE_KEY);
  if (stored === 'on') motion = true;
  else if (stored === 'off') motion = false;
} catch {
  /* storage blocked: keep the media-query default */
}

/** Side effects that must follow the switch (cancel rAF loops, paint static states). */
const followers = new Set<() => void>();

function revealAll() {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
}

function paintSwitch() {
  const root = document.documentElement;
  root.classList.toggle('motion-off', !motion);
  root.dataset.motion = motion ? 'on' : 'off';
  followers.forEach((fn) => fn());
  document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(motion));
    const label = btn.querySelector<HTMLElement>('[data-motion-label]');
    const text = motion ? btn.dataset.labelOn : btn.dataset.labelOff;
    if (label && text) label.textContent = text;
  });
}

function setMotion(next: boolean) {
  motion = next;
  try {
    localStorage.setItem(STORE_KEY, next ? 'on' : 'off');
  } catch {
    /* ignore quota / private mode */
  }
  paintSwitch();
  if (!next) revealAll();
}

/** Run `frame` on rAF only while `el` is on screen, the tab is visible and motion is on. */
function whileVisible(el: Element, frame: (t: number) => void) {
  let visible = false;
  let raf = 0;
  const loop = (t: number) => {
    frame(t);
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    const run = visible && !document.hidden && motion;
    if (run && !raf) raf = requestAnimationFrame(loop);
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(el);
  document.addEventListener('visibilitychange', sync);
  followers.add(sync);
}

/* ── rotating ASCII torus (z-buffered donut projection) ── */
function torus() {
  const el = document.querySelector<HTMLElement>('[data-torus]');
  const fpsEl = document.querySelector<HTMLElement>('[data-fps]');
  if (!el) return;

  const W = 64, H = 30, shade = '.,-~:;=!*#$@';
  let A = 1, B = 1, mx = 0, my = 0;
  const render = () => {
    const out = new Array<string>(W * H).fill(' ');
    const z = new Float32Array(W * H);
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    for (let j = 0; j < 6.28; j += 0.07) {
      const ct = Math.cos(j), st = Math.sin(j);
      for (let i = 0; i < 6.28; i += 0.02) {
        const sp = Math.sin(i), cp = Math.cos(i);
        const h = ct + 2;
        const D = 1 / (sp * h * sA + st * cA + 5);
        const t = sp * h * cA - st * sA;
        // Scales leave a 2-cell margin around the 64x30 grid at every angle.
        const x = Math.floor(W / 2 + 24 * D * (cp * h * cB - t * sB));
        const y = Math.floor(H / 2 + 12 * D * (cp * h * sB + t * cB));
        const o = x + W * y;
        const N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
        if (y >= 0 && y < H && x >= 0 && x < W && D > z[o]) {
          z[o] = D;
          out[o] = shade[Math.max(0, N)] ?? '.';
        }
      }
    }
    let s = '';
    for (let k = 0; k < H; k++) s += out.slice(k * W, k * W + W).join('') + '\n';
    el.textContent = s;
  };
  render();

  if (fpsEl) {
    followers.add(() => { fpsEl.textContent = motion ? '-- fps' : 'static'; });
  }

  if (finePointer) {
    window.addEventListener('pointermove', (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 0.04;
      my = (e.clientY / innerHeight - 0.5) * 0.04;
    }, { passive: true });
  }

  // Cheaper target on small screens: 30fps desktop, ~20fps mobile.
  const minDt = innerWidth < SMALL_SCREEN ? 48 : 30;
  let last = 0, frames = 0, acc = 0;
  whileVisible(el, (t) => {
    const dt = last ? t - last : 16;
    // Only advance `last` when a frame is actually drawn, otherwise dt stays
    // at one vsync (~16ms) and the limiter below would skip every frame.
    if (last && dt < minDt) return;
    last = t;
    A += 0.045 + my; B += 0.025 + mx;
    render();
    frames++; acc += dt;
    if (acc > 1000 && fpsEl) { fpsEl.textContent = `${Math.round((frames * 1000) / acc)} fps`; frames = 0; acc = 0; }
  });
}

/* ── decrypt / scramble text when it enters the viewport ── */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\|';
function scramble(el: HTMLElement) {
  const final = el.textContent ?? '';
  if (!motion) { el.textContent = final; return; }
  const total = 22;
  let frame = 0;
  const tick = () => {
    const revealed = Math.floor((frame / total) * final.length);
    let s = '';
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      s += i < revealed || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = s;
    if (frame++ < total) setTimeout(tick, 38);
    else el.textContent = final;
  };
  if (!el.dataset.realText) el.dataset.realText = final;
  tick();
}

function reveals() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      if (el.hasAttribute('data-scramble') && motion) scramble(el);
      else el.classList.add('is-in');
      io.unobserve(el);
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
  document.querySelectorAll('[data-reveal], [data-scramble]').forEach((el) => io.observe(el));
}

/* ── self-typing terminal ── */
function terminal() {
  const box = document.querySelector<HTMLElement>('[data-terminal]');
  if (!box) return;
  const lines = Array.from(box.querySelectorAll<HTMLElement>('[data-line]'));
  if (!motion) { lines.forEach((l) => l.classList.add('shown')); return; }

  box.classList.add('typing');
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    lines.forEach((l) => l.classList.add('shown'));
  };
  followers.add(() => { if (!motion) stop(); });

  let i = 0;
  const next = () => {
    if (stopped) return;
    const line = lines[i++];
    if (!line) return;
    line.classList.add('shown');
    const cmdEl = line.querySelector<HTMLElement>('[data-cmd-text]');
    if (!cmdEl) { setTimeout(next, 140); return; }
    const full = line.dataset.cmd ?? '';
    let c = 0;
    cmdEl.textContent = '';
    const type = () => {
      if (stopped) return;
      cmdEl.textContent = full.slice(0, ++c);
      if (c < full.length) setTimeout(type, 45 + Math.random() * 60);
      else setTimeout(next, 320);
    };
    setTimeout(type, 260);
  };
  setTimeout(next, 600);
}

/* ── glyph rain behind the contact section ── */
function rain() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-rain]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789{}<>/=;';
  const size = 16;
  let cols = 0, drops: number[] = [];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(canvas.clientWidth / size);
    drops = Array.from({ length: cols }, () => Math.random() * -60);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  const draw = () => {
    ctx.fillStyle = 'rgba(7, 8, 7, 0.12)';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.font = `${size - 2}px "Geist Mono Variable", monospace`;
    for (let i = 0; i < cols; i++) {
      const y = drops[i] * size;
      ctx.fillStyle = Math.random() > 0.975 ? '#e8ede6' : '#3dff8b';
      ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, y);
      if (y > canvas.clientHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 1;
    }
  };
  // Static texture when motion is off, so the panel is never a dead black box.
  followers.add(() => { if (!motion) { for (let k = 0; k < 30; k++) draw(); } });
  let last = 0;
  whileVisible(canvas, (t) => { if (t - last > 55) { last = t; draw(); } });
}

/* ── cursor spotlight on cards ── */
function spotlights() {
  document.querySelectorAll<HTMLElement>('[data-spot]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    el.addEventListener('pointerleave', () => { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
  });
}

function clocks() {
  const fmt = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago', hour12: false });
  const tick = () => document.querySelectorAll('[data-clock]').forEach((c) => (c.textContent = fmt.format(new Date())));
  tick();
  setInterval(tick, 15_000);
}

function copyEmail() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const original = btn.textContent ?? '';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
        btn.textContent = btn.dataset.copied ?? '✓';
        setTimeout(() => (btn.textContent = original), 1600);
      } catch {
        // Clipboard unavailable: select the visible address so it can be copied by hand.
        const email = btn.parentElement?.querySelector('[data-email]');
        if (email) window.getSelection()?.selectAllChildren(email);
      }
    });
  });
}

export function initMotion() {
  clocks();
  copyEmail();
  torus();
  rain();
  reveals();
  terminal();
  if (finePointer) spotlights();

  document.querySelectorAll('[data-motion-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => setMotion(!motion));
  });

  // Follow OS-level changes only while the visitor has not chosen explicitly.
  reduceQuery.addEventListener('change', (e) => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(STORE_KEY); } catch { /* ignore */ }
    if (stored) return;
    motion = !e.matches;
    paintSwitch();
    if (!motion) revealAll();
  });

  paintSwitch();
  if (!motion) revealAll();
}
