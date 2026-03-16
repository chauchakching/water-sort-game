import { test, expect } from '@playwright/test';
import { loadGame, SEL, getTubes } from './helpers';

test.describe('Initial load', () => {
  test.beforeEach(async ({ page }) => {
    await loadGame(page);
  });

  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Water Sort');
  });

  test('header shows app name', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Water Sort');
  });

  test('difficulty badge appears after game generates', async ({ page }) => {
    // Badge renders after the deferred BFS completes
    const badge = page.locator('text=Easy').or(page.locator('text=Medium')).or(page.locator('text=Hard'));
    await expect(badge).toBeVisible({ timeout: 5000 });
  });

  test('timer starts and counts up', async ({ page }) => {
    const timer = page.locator('.tabular-nums').first();
    const initial = await timer.innerText();
    await page.waitForTimeout(2000);
    const after = await timer.innerText();
    expect(initial).not.toBe(after);
  });

  test('move counter starts at 0', async ({ page }) => {
    await expect(page.locator('text=0 moves')).toBeVisible();
  });

  test('correct number of tubes rendered (default 6)', async ({ page }) => {
    await expect(getTubes(page)).toHaveCount(6);
  });

  test('at least one empty tube exists (for pouring into)', async ({ page }) => {
    const empties = page.locator('[data-testid="tube"][aria-label*="0 of"]');
    await expect(empties).toHaveCount(1); // default: colorCount=5, tubeCount=6 → 1 empty
  });

  test('filled tubes have water colors', async ({ page }) => {
    // Each non-empty tube should have colored segments — they have bg-* classes on inner divs
    const tubes = getTubes(page);
    const count = await tubes.count();
    let filledCount = 0;
    for (let i = 0; i < count; i++) {
      const label = await tubes.nth(i).getAttribute('aria-label');
      if (label && !label.startsWith('Tube with 0')) filledCount++;
    }
    expect(filledCount).toBeGreaterThanOrEqual(5);
  });

  test('action buttons are visible', async ({ page }) => {
    await expect(page.locator(SEL.newGame)).toBeVisible();
    await expect(page.locator(SEL.hint)).toBeVisible();
    await expect(page.locator(SEL.reset)).toBeVisible();
  });

  test('undo button is hidden at game start', async ({ page }) => {
    await expect(page.locator(SEL.undo)).not.toBeVisible();
  });

  test('Colors and Tubes counter controls are visible', async ({ page }) => {
    await expect(page.locator('text=COLORS')).toBeVisible();
    await expect(page.locator('text=TUBES')).toBeVisible();
    await expect(page.locator(SEL.colorsInc)).toBeVisible();
    await expect(page.locator(SEL.tubesInc)).toBeVisible();
  });
});
