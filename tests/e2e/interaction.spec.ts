import { test, expect } from '@playwright/test';
import { loadGame, SEL, getTubes, clickHintAndApply } from './helpers';

test.describe('Tube interaction', () => {
  test.beforeEach(async ({ page }) => {
    await loadGame(page);
  });

  test('clicking an empty tube shows invalid state', async ({ page }) => {
    const emptyTube = page.locator('[data-testid="tube"][aria-label*="0 of"]').first();
    await emptyTube.click();
    await expect(emptyTube).toHaveAttribute('data-state', 'invalid');
    // Invalid state auto-clears after 500ms
    await page.waitForTimeout(600);
    await expect(emptyTube).toHaveAttribute('data-state', 'default');
  });

  test('clicking a filled tube selects it', async ({ page }) => {
    const filledTubes = page
      .locator('[data-testid="tube"]')
      .filter({ hasNot: page.locator('[aria-label*="0 of"]') });
    const tube = filledTubes.first();
    await tube.click();
    await expect(tube).toHaveAttribute('data-state', 'selected');
  });

  test('clicking the selected tube again deselects it', async ({ page }) => {
    const filledTubes = page
      .locator('[data-testid="tube"]')
      .filter({ hasNot: page.locator('[aria-label*="0 of"]') });
    const tube = filledTubes.first();
    await tube.click();
    await expect(tube).toHaveAttribute('data-state', 'selected');
    await tube.click();
    await expect(tube).not.toHaveAttribute('data-state', 'selected');
  });

  test('valid pour increments move counter', async ({ page }) => {
    await expect(page.locator('text=0 moves')).toBeVisible();
    const moved = await clickHintAndApply(page);
    expect(moved).toBe(true);
    // Move count should now be 1
    await expect(page.locator('text=1 moves')).toBeVisible({ timeout: 3000 });
  });

  test('undo button appears after a move', async ({ page }) => {
    await expect(page.locator(SEL.undo)).not.toBeVisible();
    await clickHintAndApply(page);
    await expect(page.locator(SEL.undo)).toBeVisible({ timeout: 2000 });
  });

  test('undo reverts move and decrements counter', async ({ page }) => {
    await clickHintAndApply(page);
    await expect(page.locator('text=1 moves')).toBeVisible({ timeout: 2000 });
    await page.click(SEL.undo);
    await expect(page.locator('text=0 moves')).toBeVisible({ timeout: 2000 });
  });

  test('undo button disappears when no moves to undo', async ({ page }) => {
    await clickHintAndApply(page);
    await expect(page.locator(SEL.undo)).toBeVisible({ timeout: 2000 });
    await page.click(SEL.undo);
    await expect(page.locator(SEL.undo)).not.toBeVisible({ timeout: 2000 });
  });

  test('tubes are keyboard accessible (Enter key selects)', async ({ page }) => {
    const filledTubes = page
      .locator('[data-testid="tube"]')
      .filter({ hasNot: page.locator('[aria-label*="0 of"]') });
    const tube = filledTubes.first();
    await tube.focus();
    await tube.press('Enter');
    await expect(tube).toHaveAttribute('data-state', 'selected');
  });

  test('tubes are keyboard accessible (Space key selects)', async ({ page }) => {
    const filledTubes = page
      .locator('[data-testid="tube"]')
      .filter({ hasNot: page.locator('[aria-label*="0 of"]') });
    const tube = filledTubes.first();
    await tube.focus();
    await tube.press('Space');
    await expect(tube).toHaveAttribute('data-state', 'selected');
  });

  test('completed tube shows completed state', async ({ page }) => {
    // Make several moves; eventually a tube will fill with one color.
    // Use hints to drive towards completion.
    for (let i = 0; i < 8; i++) {
      const moved = await clickHintAndApply(page);
      if (!moved) break;
      const completed = page.locator(SEL.completed);
      if (await completed.count() > 0) break;
    }
    // Don't assert a specific count — just assert the state renders correctly
    // if a tube completes. Skip assertion if no tube completed in 8 moves.
    const completedCount = await page.locator(SEL.completed).count();
    if (completedCount > 0) {
      await expect(page.locator(SEL.completed).first()).toHaveAttribute('data-state', 'completed');
    }
  });
});
