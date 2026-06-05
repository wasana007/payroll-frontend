import { test, expect } from '@playwright/test';

test.describe('Payroll form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should show form with all fields', async ({ page }) => {
    await expect(page.getByPlaceholder('f.eks. A001')).toBeVisible();
    await expect(page.getByPlaceholder('f.eks. 55000')).toBeVisible();
    await expect(page.getByPlaceholder('f.eks. 2025-01')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Send lønnsdata' }),
    ).toBeVisible();
  });

  test('should disable button when form is empty', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Send lønnsdata' }),
    ).toBeDisabled();
  });

  test('should disable button when salary is 0', async ({ page }) => {
    await page.getByPlaceholder('f.eks. A001').fill('E001');
    await page.getByPlaceholder('f.eks. 55000').fill('0');
    await page.getByPlaceholder('f.eks. 2025-01').fill('2026-01');
    await expect(
      page.getByRole('button', { name: 'Send lønnsdata' }),
    ).toBeDisabled();
  });

  test('should enable button when all fields are filled', async ({ page }) => {
    await page.getByPlaceholder('f.eks. A001').fill('E001');
    await page.getByPlaceholder('f.eks. 55000').fill('55000');
    await page.getByPlaceholder('f.eks. 2025-01').fill('2026-01');
    await expect(
      page.getByRole('button', { name: 'Send lønnsdata' }),
    ).toBeEnabled();
  });

  test('should show PENDING status after submit', async ({ page }) => {
    await page.getByPlaceholder('f.eks. A001').fill('E001');
    await page.getByPlaceholder('f.eks. 55000').fill('55000');
    await page.getByPlaceholder('f.eks. 2025-01').fill('2026-01');
    await page.getByRole('button', { name: 'Send lønnsdata' }).click();
    await expect(page.getByText('BEHANDLER')).toBeVisible();
  });

  test('should clear form after submit', async ({ page }) => {
    await page.getByPlaceholder('f.eks. A001').fill('E001');
    await page.getByPlaceholder('f.eks. 55000').fill('55000');
    await page.getByPlaceholder('f.eks. 2025-01').fill('2026-01');
    await page.getByRole('button', { name: 'Send lønnsdata' }).click();
    await expect(page.getByPlaceholder('f.eks. A001')).toHaveValue('');
    await expect(page.getByPlaceholder('f.eks. 55000')).toHaveValue('');
    await expect(page.getByPlaceholder('f.eks. 2025-01')).toHaveValue('');
  });

  test('should show correlationId after submit', async ({ page }) => {
    await page.getByPlaceholder('f.eks. A001').fill('E001');
    await page.getByPlaceholder('f.eks. 55000').fill('55000');
    await page.getByPlaceholder('f.eks. 2025-01').fill('2026-01');
    await page.getByRole('button', { name: 'Send lønnsdata' }).click();
    await expect(page.getByText('korrelasjons-ID')).toBeVisible();
  });

  test('should show COMPLETED and add to history', async ({ page }) => {
    await page.getByPlaceholder('f.eks. A001').fill('E001');
    await page.getByPlaceholder('f.eks. 55000').fill('55000');
    await page.getByPlaceholder('f.eks. 2025-01').fill('2026-01');
    await page.getByRole('button', { name: 'Send lønnsdata' }).click();
    await expect(page.getByText('FULLFØRT')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('🗂 Historikk')).toBeVisible();
    await expect(page.getByText('E001')).toBeVisible();
  });
});
