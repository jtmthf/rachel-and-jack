import { expect, test } from '@playwright/test';

[
  { page: 'home', path: '/' },
  { page: 'our story', path: '/our-story' },
  { page: 'details', path: '/details' },
  { page: 'things to do', path: '/things-to-do' },
  { page: 'dining', path: '/dining' },
  { page: 'frequency asked questions', path: '/faq' },
].forEach(({ page, path }) => {
  test(`screenshot ${page}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveScreenshot();
  });
});
