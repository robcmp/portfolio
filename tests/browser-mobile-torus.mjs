import assert from 'node:assert/strict';

// PLAYWRIGHT=/path/to/playwright/index.mjs node tests/browser-mobile-torus.mjs [url]
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const base = process.argv[2] || 'http://127.0.0.1:4322/';
  for (const locale of ['/', '/en/']) {
    await page.goto(new URL(locale, base).href, { waitUntil: 'networkidle' });
    for (const width of [375, 767, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const visible = width >= 768;
      const figure = page.locator('figure:has([data-torus])');
      assert.equal(await figure.count(), 1);
      for (const element of [figure, figure.locator('[data-fps]'), figure.locator('[data-torus]'), figure.locator('figcaption')]) {
        assert.equal(await element.isVisible(), visible, `${locale} torus panel at ${width}px`);
      }
      const motionToggle = page.locator('[data-motion-toggle]');
      assert.equal(await motionToggle.count(), 1, `${locale} motion toggle exists at ${width}px`);
      assert.equal(await motionToggle.isVisible(), visible, `${locale} motion toggle at ${width}px`);
      assert.equal(await page.locator('h1').isVisible(), true, `${locale} hero remains visible at ${width}px`);
      assert.equal(await page.locator('[data-terminal]').isVisible(), true, `${locale} terminal remains visible at ${width}px`);
    }
  }
  assert.deepEqual(errors, []);
  console.log('PASS: torus panel and motion toggle hidden at 375/767px and visible at 768/1280px in ES and EN; hero and terminal remain visible; no page errors.');
} finally {
  await browser.close();
}
