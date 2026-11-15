import assert from 'node:assert/strict';

// PLAYWRIGHT=/path/to/playwright/index.mjs node tests/browser-mobile-layout.mjs [url]
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({ headless: true });
const widths = [320, 360, 375, 384, 390, 412, 430, 480, 640, 767, 768, 820, 1024, 1280];
try {
  // A mobile touch context catches layout/viewport differences hidden by desktop emulation.
  const context = await browser.newContext({ isMobile: true, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const failures = [];
  for (const locale of ['/', '/en/']) {
    await page.goto(new URL(locale, process.argv[2] || 'http://127.0.0.1:4323/').href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 915 });
      const result = await page.evaluate(() => {
        const problems = [];
        const root = document.documentElement;
        if (root.scrollWidth > root.clientWidth + 1) problems.push(`document ${root.scrollWidth} > ${root.clientWidth}`);
        const grid = document.querySelector('#work ol');
        const gridRect = grid.getBoundingClientRect();
        const cards = [...grid.children];
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          if (rect.left < gridRect.left - 1 || rect.right > gridRect.right + 1) problems.push(`card ${index + 1} [${rect.left},${rect.right}] exceeds grid [${gridRect.left},${gridRect.right}]`);
          const article = card.querySelector('article');
          if (article.scrollWidth > article.clientWidth + 1) problems.push(`card ${index + 1} content overflows ${article.scrollWidth} > ${article.clientWidth}`);
          for (const element of article.querySelectorAll('h3, p, ul, a, article > div')) {
            const box = element.getBoundingClientRect();
            if (box.left < rect.left - 1 || box.right > rect.right + 1) problems.push(`card ${index + 1} ${element.tagName} outside its container`);
          }
        });
        const first = cards[0].getBoundingClientRect();
        const second = cards[1].getBoundingClientRect();
        if (innerWidth < 768 && Math.abs(first.left - second.left) > 1) problems.push('mobile cards are not one column');
        if (innerWidth >= 768 && Math.abs(first.top - second.top) > 1) problems.push('desktop cards are not two columns');
        return { problems, width: root.clientWidth };
      });
      if (result.problems.length) failures.push({ locale, width, ...result });
      // Verify that the page cannot be panned horizontally, not merely that no scrollbar is drawn.
      await page.evaluate(() => window.scrollTo({ left: 10000, top: 0, behavior: 'instant' }));
      if (await page.evaluate(() => window.scrollX) !== 0) failures.push({ locale, width, problem: 'page pans horizontally' });
    }
  }
  assert.deepEqual(errors, [], 'no browser errors');
  assert.deepEqual(failures, [], 'document and project cards must fit every tested viewport');
  console.log(`PASS: ES/EN document and project-card containers fit ${widths.join('/')}px in a mobile touch context, no horizontal panning; one-column mobile and two-column desktop preserved; no browser errors.`);
  await context.close();
} finally {
  await browser.close();
}
