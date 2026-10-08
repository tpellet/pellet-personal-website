import { test, expect } from '@playwright/test';

const routes = ['', 'projects/', 'publications/', 'gallery/', 'resume/'];

test('every page serves its local links and assets without browser errors', async ({ page, request, baseURL }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (new URL(response.url()).origin === new URL(baseURL!).origin && response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  const checked = new Set<string>();
  for (const route of routes) {
    const response = await page.goto(new URL(route, baseURL).href);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    const previewImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(previewImage).toBeTruthy();
    const imagePath = new URL(previewImage!).pathname;
    expect(imagePath.startsWith(new URL(baseURL!).pathname)).toBe(true);
    const image = await request.get(new URL(imagePath, baseURL).href);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toContain('image/');
    const urls = await page.locator('a[href], script[src], link[href], img[src]').evaluateAll(elements =>
      elements.map(element => element.getAttribute('href') ?? element.getAttribute('src') ?? '')
    );
    for (const value of urls) {
      const url = new URL(value, page.url());
      if (url.origin !== new URL(baseURL!).origin || checked.has(url.href)) continue;
      expect(url.pathname.startsWith(new URL(baseURL!).pathname), url.href).toBe(true);
      if (url.pathname === new URL(page.url()).pathname && url.hash) {
        expect(await page.locator(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).count(), url.href).toBe(1);
      }
      checked.add(url.href);
      const asset = await request.get(url.href);
      expect(asset.status(), url.href).toBe(200);
    }
  }
  expect(errors).toEqual([]);
});

test('resume links deliver a real PDF', async ({ page, request, baseURL }) => {
  await page.goto(new URL('resume/', baseURL).href);
  const link = page.locator('a[href$=".pdf"]').first();
  await expect(link).toBeVisible();
  const response = await request.get(new URL((await link.getAttribute('href'))!, page.url()).href);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('theme selection persists after navigation and reload', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  const before = await page.locator('html').getAttribute('data-theme');
  await page.locator('.theme-toggle').click();
  const after = await page.locator('html').getAttribute('data-theme');
  expect(after).toMatch(/^(light|dark)$/);
  expect(after).not.toBe(before);
  await page.goto(new URL('projects/', baseURL).href);
  await expect(page.locator('html')).toHaveAttribute('data-theme', after!);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', after!);
});

test('publication filters show the selected category and restore all entries', async ({ page, baseURL }) => {
  await page.goto(new URL('publications/', baseURL).href);
  const cards = page.locator('.publication-entry');
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);
  const filters = page.locator('.publication-filter');
  expect(await filters.count()).toBeGreaterThan(1);
  for (let index = 1; index < await filters.count(); index++) {
    const filter = filters.nth(index);
    await filter.click();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    const selected = await filter.getAttribute('data-filter');
    const visible = page.locator('.publication-entry:visible');
    expect(await visible.count()).toBeGreaterThan(0);
    for (const card of await visible.all()) await expect(card).toHaveAttribute('data-category', selected!);
  }
  await filters.first().click();
  await expect(page.locator('.publication-entry:visible')).toHaveCount(total);
  await expect(page.locator('#publication-status')).toContainText(String(total));
});

test('mobile menu opens, closes, and reaches projects', async ({ page, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation control');
  await page.goto(baseURL!);
  const toggle = page.locator('.menu-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#site-menu')).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.locator('#site-menu a[href$="/projects/"]').click();
  await expect(page).toHaveURL(new URL('projects/', baseURL).href);
});

test('pages fit the viewport and expose keyboard focus', async ({ page, baseURL }, testInfo) => {
  for (const route of routes) {
    await page.goto(new URL(route, baseURL).href);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.goto(baseURL!);
  // Safari's default Tab navigation omits links; Option-Tab includes them.
  await page.keyboard.press(testInfo.project.name === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
  await expect(page.locator('a:focus')).toBeVisible();
});

test('reduced motion keeps network interaction static', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(baseURL!);
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await page.locator('.network-toggle').click();
  await expect(page.locator('.network-art')).toHaveClass(/is-traced/);
  await expect(page.locator('.network-toggle')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
});

test('invalid and unavailable local storage preserve usable theme controls', async ({ page, baseURL }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => localStorage.setItem('theme-preference', 'invalid'));
  await page.goto(baseURL!);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const denied = await page.context().newPage();
  await denied.emulateMedia({ colorScheme: 'light' });
  denied.on('pageerror', error => errors.push(error.message));
  await denied.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage unavailable', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'SecurityError'); };
  });
  await denied.goto(baseURL!);
  await expect(denied.locator('html')).toHaveAttribute('data-theme', 'light');
  await denied.locator('.theme-toggle').click();
  await expect(denied.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
  await denied.close();
});

test('network interaction and content work when the animation library is unavailable', async ({ page, baseURL }) => {
  await page.route('**/js/motion.js', route => route.abort());
  await page.goto(baseURL!);
  await expect(page.locator('h1')).toBeVisible();
  const toggle = page.locator('.network-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('navigation and publication content remain usable without JavaScript', async ({ browser, page, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize()! });
  const plain = await context.newPage();
  await plain.goto(baseURL!);
  await expect(plain.locator('h1')).toBeVisible();
  await plain.locator('#site-menu a[href$="/publications/"]').click();
  await expect(plain).toHaveURL(new URL('publications/', baseURL).href);
  const entries = plain.locator('.publication-entry');
  expect(await entries.count()).toBeGreaterThan(0);
  await expect(plain.locator('.publication-entry:visible')).toHaveCount(await entries.count());
  await context.close();
});

test('missing routes return a helpful 404', async ({ page, baseURL }) => {
  const response = await page.goto(new URL('this-page-does-not-exist/', baseURL).href);
  expect(response?.status()).toBe(404);
  await expect(page.locator('main')).toContainText(/404|not found|doesn.t exist/i);
  const home = page.locator('main a').filter({ hasText: /home|start/i }).first();
  await expect(home).toBeVisible();
  await home.click();
  await expect(page).toHaveURL(baseURL!);
});
