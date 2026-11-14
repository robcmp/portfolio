// Renders the Open Graph share cards (public/og-es.png, public/og-en.png) at 1200x630.
// Usage: PLAYWRIGHT=<path to playwright module> [CHROME=<chromium binary>] node og/render.cjs
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pw = process.env.PLAYWRIGHT || 'playwright';
const { chromium } = require(pw);

// Fonts are inlined as data URLs: a page loaded via setContent (about:blank) cannot fetch file:// fonts.
const fontUrl = (pkg, file) =>
  'data:font/woff2;base64,' +
  fs.readFileSync(path.join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).toString('base64');

// One static frame of the same donut projection used by src/scripts/motion.ts.
function torus(A = 1.05, B = 0.6, W = 46, H = 20) {
  const out = new Array(W * H).fill(' ');
  const z = new Float32Array(W * H);
  const shade = '.,-~:;=!*#$@';
  const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
  for (let j = 0; j < 6.28; j += 0.05) {
    const ct = Math.cos(j), st = Math.sin(j);
    for (let i = 0; i < 6.28; i += 0.015) {
      const sp = Math.sin(i), cp = Math.cos(i);
      const h = ct + 2;
      const D = 1 / (sp * h * sA + st * cA + 5);
      const t = sp * h * cA - st * sA;
      const x = Math.floor(W / 2 + 18 * D * (cp * h * cB - t * sB));
      const y = Math.floor(H / 2 + 8.3 * D * (cp * h * sB + t * cB));
      const o = x + W * y;
      const N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
      if (y >= 0 && y < H && x >= 0 && x < W && D > z[o]) { z[o] = D; out[o] = shade[Math.max(0, N)] || '.'; }
    }
  }
  const rows = [];
  for (let k = 0; k < H; k++) rows.push(out.slice(k * W, k * W + W).join(''));
  return rows.join('\n');
}

const copy = {
  es: { l1: 'Menos fricción.', l2: 'Más producto.', status: 'abierto a nuevos desafíos' },
  en: { l1: 'Less friction.', l2: 'More product.', status: 'open to new challenges' },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const html = (lang) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:Display;src:url('${fontUrl('big-shoulders-display', 'big-shoulders-display-latin-wght-normal.woff2')}') format('woff2');font-weight:100 900}
@font-face{font-family:Mono;src:url('${fontUrl('geist-mono', 'geist-mono-latin-wght-normal.woff2')}') format('woff2');font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;background:#070807;color:#e8ede6;overflow:hidden}
body{position:relative;font-family:Mono,monospace}
.grid{position:absolute;inset:0;background-image:linear-gradient(#e8ede614 1px,transparent 1px),linear-gradient(90deg,#e8ede614 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 90% 80% at 30% 20%,#000 30%,transparent 100%)}
.frame{position:absolute;inset:28px;border:1px solid #e8ede61f}
.bar{position:absolute;left:28px;right:28px;top:28px;height:44px;border-bottom:1px solid #e8ede61f;display:flex;align-items:center;justify-content:space-between;padding:0 24px;font-size:16px;color:#e8ede6b3}
.bar b{color:#3dff8b;font-weight:500}
.dot{display:inline-block;width:9px;height:9px;background:#3dff8b;box-shadow:0 0 10px #3dff8b;margin-right:10px;vertical-align:middle}
.main{position:absolute;left:68px;top:112px;right:68px}
.eyebrow{font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:#3dff8b}
.eyebrow span{color:#e8ede680}
h1{margin-top:22px;font-family:Display,sans-serif;font-weight:800;text-transform:uppercase;font-size:126px;line-height:.98;letter-spacing:-.005em;white-space:nowrap}
h1 .neon{color:#3dff8b;text-shadow:0 0 28px #3dff8b73}
.who{position:absolute;left:68px;bottom:60px;right:360px}
.name{font-family:Display,sans-serif;font-weight:700;font-size:40px;text-transform:uppercase;letter-spacing:.01em}
.role{margin-top:6px;font-size:17px;color:#e8ede6b3}
.url{display:inline-block;margin-top:18px;font-size:19px;color:#3dff8b;border:1px solid #3dff8b66;padding:7px 13px}
pre{position:absolute;right:62px;bottom:44px;font-family:Mono,monospace;font-size:10px;line-height:1.02;color:#3dff8b;text-shadow:0 0 8px #3dff8b80}
</style></head><body>
<div class="grid"></div><div class="frame"></div>
<div class="bar"><span>~/rmendoza — zsh</span><span><i class="dot"></i>${esc(copy[lang].status)}</span></div>
<div class="main">
  <p class="eyebrow"><span>// </span>software engineer • santiago, cl</p>
  <h1><span>${esc(copy[lang].l1)}</span><br><span class="neon">${esc(copy[lang].l2)}</span></h1>
</div>
<pre aria-hidden="true">${esc(torus())}</pre>
<div class="who">
  <p class="name">Roberto Mendoza</p><p class="role">Frontend &amp; Full Stack Engineer · Cloud · Applied AI</p>
  <p class="url">rm.byteforus.com</p>
</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME || undefined,
    args: ['--no-sandbox'],
  });
  for (const lang of ['es', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(html(lang), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => ['Display', 'Mono'].filter((f) => !document.fonts.check(`800 40px ${f}`)));
    if (loaded.length) throw new Error(`[${lang}] fonts not loaded: ${loaded.join(', ')}`);
    // Fail loudly if anything leaves the 1200x630 canvas or the 28px frame.
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll('h1, pre, .who, .bar, .eyebrow')]
        .map((el) => [el.className || el.tagName, el.getBoundingClientRect()])
        .filter(([, r]) => r.left < 28 || r.top < 28 || r.right > 1172 || r.bottom > 602)
        .map(([n, r]) => `${n}: ${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}`),
    );
    const clash = await page.evaluate(() => {
      // Measure the text runs themselves (block boxes span the full width).
      const box = (sel) => {
        const r = document.createRange();
        r.selectNodeContents(document.querySelector(sel));
        return r.getBoundingClientRect();
      };
      const hit = (a, b, pad = 12) =>
        a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
      const h = box('h1'), t = box('pre'), w = box('.who');
      const msgs = [];
      if (hit(h, t)) msgs.push('headline overlaps torus');
      if (hit(h, w)) msgs.push('headline overlaps name block');
      if (hit(w, t)) msgs.push('name block overlaps torus');
      return msgs.join('; ');
    });
    if (clash) overflow.push(clash);
    if (overflow.length) throw new Error(`[${lang}] overflow: ${overflow.join('; ')}`);
    const out = path.join(root, 'public', `og-${lang}.png`);
    await page.screenshot({ path: out, type: 'png' });
    console.log(`${out} ${fs.statSync(out).size} bytes`);
  }
  await browser.close();
})().catch((e) => { console.error(e.message || e); process.exit(1); });
