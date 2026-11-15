import assert from 'node:assert/strict';

// PLAYWRIGHT=/path/to/playwright/index.mjs node tests/browser-contact-email.mjs [url]
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({ headless: true });
const email = 'robcmpdev@gmail.com';
try {
  const context = await browser.newContext({ reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  for (const locale of ['/', '/en/']) {
    await page.goto(new URL(locale, process.argv[2] || 'http://127.0.0.1:4323/').href, { waitUntil: 'networkidle' });
    const contact = page.locator('[data-email]');
    assert.equal(await contact.textContent(), email, `${locale} visible email`);
    assert.equal(await contact.getAttribute('href'), `mailto:${email}`, `${locale} email link`);
    const copy = page.locator('[data-copy]');
    assert.equal(await copy.getAttribute('data-copy'), email, `${locale} copy target`);
    assert.ok((await copy.getAttribute('aria-label')).includes(email), `${locale} accessible copy label`);
    const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    assert.equal(structured.email, `mailto:${email}`, `${locale} structured data`);
    await copy.click();
    await page.waitForFunction((expected) => document.querySelector('[data-copy]').textContent === expected,
      await copy.getAttribute('data-copied'));
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), email, `${locale} copied email`);
  }
  await context.close();
  console.log('PASS: ES/EN visible email, mailto link, accessible copy label, clipboard content and structured data use the updated contact address.');
} finally {
  await browser.close();
}
