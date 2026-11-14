import assert from 'node:assert/strict';

// Use a separately installed Playwright module; no production dependency is added.
// PLAYWRIGHT=/absolute/path/to/playwright/index.mjs node tests/browser-language-navigation.mjs [url]
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.argv[2] || 'http://localhost:4322/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('[data-motion-toggle]')?.getAttribute('aria-pressed') === 'false');
  const esTitle = await page.title();
  const esDescription = await page.locator('meta[name="description"]').getAttribute('content');
  const esHeading = await page.locator('h1 .sr-only').textContent();
  const marker = await page.evaluate(() => {
    window.__languageNavigationMarker = crypto.randomUUID();
    return window.__languageNavigationMarker;
  });
  const switchLanguage = async (lang) => {
    await page.locator(`header a[hreflang="${lang}"]`).click();
    await page.waitForFunction((expected) => document.documentElement.lang === expected &&
      document.querySelector(`header a[hreflang="${expected}"]`)?.getAttribute('aria-current') === 'page' &&
      document.querySelector('[data-motion-toggle]')?.getAttribute('aria-pressed') === 'false', lang);
    assert.equal(await page.evaluate(() => window.__languageNavigationMarker), marker, 'language switch must keep the same JavaScript window');
    assert.equal(new URL(page.url()).pathname, lang === 'es' ? '/' : '/en/');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://rm.byteforus.com${lang === 'es' ? '/' : '/en/'}`);
  };
  await switchLanguage('en');
  // Both locales intentionally use the same professional title.
  assert.equal(await page.title(), esTitle);
  assert.notEqual(await page.locator('meta[name="description"]').getAttribute('content'), esDescription);
  assert.notEqual(await page.locator('h1 .sr-only').textContent(), esHeading);
  const enTitle = await page.title();
  for (const lang of ['es', 'en', 'es', 'en']) await switchLanguage(lang);
  await page.locator('[data-motion-toggle]').click();
  await page.waitForFunction(() => document.querySelector('[data-motion-toggle]').getAttribute('aria-pressed') === 'true');
  await page.locator('[data-motion-toggle]').click();
  await page.waitForFunction(() => document.querySelector('[data-motion-toggle]').getAttribute('aria-pressed') === 'false');
  await page.goBack();
  await page.waitForFunction(() => document.documentElement.lang === 'es');
  assert.equal(await page.title(), esTitle);
  assert.equal(await page.evaluate(() => window.__languageNavigationMarker), marker);
  await page.goForward();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(await page.title(), enTitle);
  await page.locator('header nav a[href="#work"]').click();
  await page.waitForFunction(() => location.hash === '#work');
  assert.equal(await page.evaluate(() => window.__languageNavigationMarker), marker);
  assert.deepEqual(errors, []);
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const direct = await noJs.newPage();
  await direct.goto(new URL('/en/', page.url()).href);
  assert.equal(await direct.locator('html').getAttribute('lang'), 'en');
  assert.equal(await direct.title(), enTitle);
  await noJs.close();
  console.log('PASS: repeated ES/EN switches preserve window, translate lang/content/description/canonical, retain the shared title and motion preference, keep controls and anchors working, support history and direct no-JS links; no page errors.');
  await context.close();
} finally {
  await browser.close();
}
