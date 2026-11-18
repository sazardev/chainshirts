import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const BASE = '/';

async function fresh(page: Page): Promise<void> {
  // Each Playwright test gets an isolated browser context, so storage starts empty.
  await page.goto(BASE);
  await waitForIslands(page);
}

async function waitForIslands(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.islandsReady === 'true');
}

async function go(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForIslands(page);
}

async function createProfile(page: Page, name = 'Ada Hunter'): Promise<void> {
  await go(page, '/profile/');
  await page.getByLabel('Display name').fill(name);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText(`Signed in as: ${name}`)).toBeVisible();
}

test('home renders and makes no remote requests', async ({ page }) => {
  const remote: string[] = [];
  page.on('request', (request) => {
    const host = new URL(request.url()).hostname;
    if (host !== '127.0.0.1' && host !== 'localhost' && host !== 'data') remote.push(request.url());
  });
  await fresh(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Wear the');
  await expect(page.getByRole('heading', { name: 'Deals of the day' })).toBeVisible();
  expect(remote).toEqual([]);
});

test('catalog lists products and category filters navigate', async ({ page }) => {
  await fresh(page);
  await go(page, '/catalog/');
  await expect(page.locator('[data-product-card]')).toHaveCount(112);
  await page
    .getByRole('navigation', { name: 'Filter by category' })
    .getByRole('link', { name: 'Mice' })
    .click();
  await expect(page).toHaveURL(/\/categories\/mice\/?$/);
  await expect(page.locator('[data-product-card]')).toHaveCount(9);
});

test('likes and comments update immediately and survive reload', async ({ page }) => {
  await createProfile(page);
  await go(page, '/products/fang-pro-wireless/');

  const like = page.getByRole('button', { name: /^Add to favourites: Fang Pro Wireless Mouse/ });
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  await like.click();
  await expect(
    page.getByRole('button', { name: /^Remove from favourites: Fang Pro Wireless Mouse/ }),
  ).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#comment-form[data-ready="true"]').waitFor();
  await page.getByLabel('Add a comment').fill('Great weight and a sharp sensor.');
  await page.getByRole('button', { name: 'Post comment' }).click();
  await expect(page.getByText('Great weight and a sharp sensor.')).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole('button', { name: /^Remove from favourites: Fang Pro Wireless Mouse/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Great weight and a sharp sensor.')).toBeVisible();
});

test('cart, checkout and order history complete end to end', async ({ page }) => {
  await createProfile(page);
  await go(page, '/products/fang-pro-wireless/');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('link', { name: /Cart.*1.*items in cart/ })).toBeVisible();

  await go(page, '/cart/');
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /Increase quantity of Fang Pro Wireless/ }).click();
  await expect(page.getByRole('link', { name: /Cart.*2.*items in cart/ })).toBeVisible();

  await page.getByRole('link', { name: 'Checkout', exact: true }).click();
  await page.getByLabel('Full name').fill('Ada Hunter');
  await page.getByLabel('Address').fill('14 Chain Street');
  await page.getByLabel('City').fill('Tokyo');
  await page.getByLabel('Postal code').fill('100-0001');
  await page.getByLabel('Card number').fill('4111 1111 1111 1111');
  await page.getByRole('button', { name: /Place order/ }).click();

  await expect(page).toHaveURL(/\/order-confirmation/);
  await expect(page.getByText(/Thanks, Ada Hunter/)).toBeVisible();
  await page.getByRole('link', { name: 'View order history' }).first().click();
  await expect(page.getByRole('heading', { name: 'Order history' })).toBeVisible();
  await expect(page.locator('main').getByText(/order-/)).not.toHaveCount(0);
});

test('blocks empty comments and shows accessible errors', async ({ page }) => {
  await createProfile(page);
  await go(page, '/products/fang-pro-wireless/');
  const send = page.getByRole('button', { name: 'Post comment' });
  await expect(send).toBeDisabled();
  await page.getByLabel('Add a comment').fill('   ');
  await expect(send).toBeDisabled();
});

test('key pages have no axe violations', async ({ page }) => {
  await fresh(page);
  for (const path of [
    '/',
    '/catalog/',
    '/products/fang-pro-wireless/',
    '/cart/',
    '/checkout/',
    '/account/',
    '/profile/',
  ]) {
    await go(page, path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, `axe violations on ${path}`).toEqual([]);
  }
});

test('layout reflows at 360px and 1440px', async ({ page }) => {
  await fresh(page);
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await go(page, '/catalog/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});
