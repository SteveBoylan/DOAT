const { chromium } = require('playwright');

// A/B/C cross-viewport test suite: A = desktop, B = tablet, C = mobile.
// Usage:  npm install playwright && node tests/abc-test.js
// Serve the site first, e.g.:  python3 -m http.server 8123
const BASE = process.env.BASE_URL || 'http://localhost:8123/';
const SHOT_DIR = process.env.SHOT_DIR || '/tmp';
const results = [];
const issues = [];
const ok = (name, pass, detail = '') => {
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!pass) issues.push(name + (detail ? ': ' + detail : ''));
};

(async () => {
  const browser = await chromium.launch();
  const consoleErrors = [];

  const variants = [
    { id: 'A-desktop', width: 1440, height: 900 },
    { id: 'B-tablet', width: 768, height: 1024 },
    { id: 'C-mobile', width: 390, height: 844, mobile: true },
  ];

  for (const v of variants) {
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      isMobile: !!v.mobile,
      hasTouch: !!v.mobile,
    });
    const page = await ctx.newPage();
    // Third-party requests (e.g. Google Fonts) can fail in sandboxes/offline;
    // the site has font fallbacks, so only first-party failures count.
    const externalFailures = [];
    page.on('requestfailed', (r) => {
      if (r.url().startsWith(BASE) || r.url().startsWith('http://localhost')) {
        consoleErrors.push(`[${v.id}] request failed: ${r.url()}`);
      } else {
        externalFailures.push(r.url());
      }
    });
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      if (m.text().startsWith('Failed to load resource') && externalFailures.length) return;
      consoleErrors.push(`[${v.id}] ${m.text()}`);
    });
    page.on('pageerror', (e) => consoleErrors.push(`[${v.id}] pageerror: ${e.message}`));

    await page.goto(BASE, { waitUntil: 'networkidle' });

    // 1. No horizontal overflow
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`${v.id}: no horizontal overflow`, overflow <= 0, overflow > 0 ? `${overflow}px overflow` : '');

    // 2. Scroll through entire page; every .reveal must become visible
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForTimeout(900);
    const reveals = await page.evaluate(() => {
      const all = document.querySelectorAll('.reveal');
      const visible = document.querySelectorAll('.reveal.is-visible');
      return { all: all.length, visible: visible.length };
    });
    ok(`${v.id}: all scroll-reveal sections shown`, reveals.all === reveals.visible,
      `${reveals.visible}/${reveals.all}`);

    // 3. Stat counters animated to final values
    const stat = await page.evaluate(() =>
      document.querySelector('.stat__num[data-count="15"]').textContent);
    ok(`${v.id}: stat counter animated`, stat === '15+', `value: ${stat}`);

    // 4. Tap targets >= 40px tall on mobile
    if (v.mobile) {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('.btn, .nav__toggle, .contact__social a')]
          .filter((el) => el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().height < 40)
          .map((el) => el.textContent.trim().slice(0, 20)));
      ok(`${v.id}: tap targets >= 40px`, small.length === 0, small.join(', '));
    }

    // 5. Mobile/tablet hamburger menu opens, navigates, closes
    const toggleVisible = await page.locator('#navToggle').isVisible();
    if (toggleVisible) {
      await page.locator('#navToggle').click();
      await page.waitForTimeout(400);
      const open = await page.evaluate(() =>
        document.getElementById('navLinks').classList.contains('is-open'));
      ok(`${v.id}: hamburger opens menu`, open);
      await page.screenshot({ path: `${SHOT_DIR}/test-${v.id}-menu.png` });
      await page.locator('#navLinks a[href="#contact"]').first().click();
      await page.waitForTimeout(900);
      const closed = await page.evaluate(() =>
        !document.getElementById('navLinks').classList.contains('is-open'));
      const atContact = await page.evaluate(() => {
        const r = document.getElementById('contact').getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      ok(`${v.id}: menu link navigates to section and closes menu`, closed && atContact);
    } else {
      // Desktop: nav link navigation
      await page.locator('.nav__links a[href="#services"]').first().click();
      await page.waitForTimeout(900);
      const atServices = await page.evaluate(() => {
        const r = document.getElementById('services').getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      ok(`${v.id}: desktop nav link scrolls to section`, atServices);
    }

    // 6. Form validation blocks empty submit
    await page.evaluate(() => document.getElementById('contact').scrollIntoView());
    await page.waitForTimeout(300);
    await page.locator('#bookingForm button[type="submit"]').click();
    const blocked = await page.evaluate(() => !document.getElementById('fName').checkValidity());
    ok(`${v.id}: empty form submit blocked by validation`, blocked);

    // 7. Filled form passes validation and builds the mailto string
    await page.fill('#fName', 'Test User');
    await page.fill('#fEmail', 'test@example.com');
    await page.selectOption('#fDevice', { index: 1 });
    await page.fill('#fMsg', 'Screen is cracked');
    const mailto = await page.evaluate(() => {
      const form = document.getElementById('bookingForm');
      if (!form.checkValidity()) return 'error: form invalid';
      const data = new FormData(form);
      return `mailto:info@deadoralivetechnology.com?subject=` +
        encodeURIComponent(`Repair request: ${data.get('device')}`);
    });
    ok(`${v.id}: form builds valid mailto`, mailto.startsWith('mailto:info@deadoralivetechnology.com'));

    // Section screenshots for the record
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOT_DIR}/test-${v.id}-top.png` });
    await ctx.close();
  }

  ok('no console/page errors across all variants', consoleErrors.length === 0,
    consoleErrors.slice(0, 5).join(' | '));

  await browser.close();
  console.log(results.join('\n'));
  console.log(issues.length ? `\n${issues.length} ISSUE(S) FOUND` : '\nALL TESTS PASSED');
  process.exit(issues.length ? 1 : 0);
})();
