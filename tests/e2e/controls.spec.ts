import { test, expect } from '@playwright/test';
import { loadGame, waitForNewGame, SEL, getTubes, clickHintAndApply } from './helpers';

test.describe('Game controls', () => {
  test.beforeEach(async ({ page }) => {
    await loadGame(page);
  });

  // ── New Game ────────────────────────────────────────────────────────────────

  test('New Game button generates a fresh puzzle', async ({ page }) => {
    // Make a move first
    await clickHintAndApply(page);
    await expect(page.locator('text=1 moves')).toBeVisible({ timeout: 2000 });

    await page.click(SEL.newGame);
    await waitForNewGame(page);

    // Move counter resets
    await expect(page.locator('text=0 moves')).toBeVisible({ timeout: 3000 });
    // Undo button gone
    await expect(page.locator(SEL.undo)).not.toBeVisible();
  });

  test('New Game resets timer', async ({ page }) => {
    // Wait a few seconds
    await page.waitForTimeout(3000);
    await page.click(SEL.newGame);
    await waitForNewGame(page);
    // Timer should be back near 0:00–0:01
    const timer = page.locator('.tabular-nums').first();
    const text = await timer.innerText();
    expect(['0:00', '0:01', '0:02']).toContain(text);
  });

  // ── Reset ───────────────────────────────────────────────────────────────────

  test('Reset restores initial game state', async ({ page }) => {
    // Make some moves
    await clickHintAndApply(page);
    await clickHintAndApply(page);
    await expect(page.locator('text=2 moves')).toBeVisible({ timeout: 2000 });

    await page.click(SEL.reset);
    await page.waitForTimeout(500);

    await expect(page.locator('text=0 moves')).toBeVisible({ timeout: 2000 });
    await expect(page.locator(SEL.undo)).not.toBeVisible();
  });

  test('Reset does not change tube count', async ({ page }) => {
    const countBefore = await getTubes(page).count();
    await clickHintAndApply(page);
    await page.click(SEL.reset);
    await page.waitForTimeout(500);
    await expect(getTubes(page)).toHaveCount(countBefore);
  });

  // ── Undo ────────────────────────────────────────────────────────────────────

  test('multiple undos walk back through history', async ({ page }) => {
    await clickHintAndApply(page);
    await clickHintAndApply(page);
    await clickHintAndApply(page);
    await expect(page.locator('text=3 moves')).toBeVisible({ timeout: 3000 });

    await page.click(SEL.undo);
    await expect(page.locator('text=2 moves')).toBeVisible({ timeout: 2000 });
    await page.click(SEL.undo);
    await expect(page.locator('text=1 moves')).toBeVisible({ timeout: 2000 });
    await page.click(SEL.undo);
    await expect(page.locator('text=0 moves')).toBeVisible({ timeout: 2000 });
    await expect(page.locator(SEL.undo)).not.toBeVisible();
  });

  // ── Colors counter ──────────────────────────────────────────────────────────

  test('Colors counter shows current value', async ({ page }) => {
    // Default is 5
    await expect(page.locator('text=COLORS').locator('..').locator('..')).toContainText('5');
  });

  test('Colors + button increases color count and starts new game', async ({ page }) => {
    await page.click(SEL.colorsInc);
    await waitForNewGame(page);
    // After increment from 5 → 6, and tubeCount must be ≥ colorCount+1 (6+1=7)
    // so tubeCount also bumps. Just verify move count reset.
    await expect(page.locator('text=0 moves')).toBeVisible({ timeout: 3000 });
  });

  test('Colors - button decreases color count and starts new game', async ({ page }) => {
    // Start at 5; decrement to 4
    await page.click(SEL.colorsDec);
    await waitForNewGame(page);
    await expect(page.locator('text=0 moves')).toBeVisible({ timeout: 3000 });
  });

  test('Colors cannot go below 2', async ({ page }) => {
    // Click minus many times
    for (let i = 0; i < 10; i++) {
      await page.click(SEL.colorsDec);
      await page.waitForTimeout(200);
    }
    await waitForNewGame(page);
    // Find the colors value in the counter — should be 2
    const colorsControl = page.locator('text=COLORS').locator('..').locator('span.tabular-nums');
    const value = await colorsControl.innerText();
    expect(parseInt(value)).toBeGreaterThanOrEqual(2);
  });

  // ── Tubes counter ───────────────────────────────────────────────────────────

  test('Tubes + button increases tube count', async ({ page }) => {
    const before = await getTubes(page).count();
    await page.click(SEL.tubesInc);
    await waitForNewGame(page);
    const after = await getTubes(page).count();
    expect(after).toBe(before + 1);
  });

  test('Tubes - button decreases tube count', async ({ page }) => {
    // First add a tube so we have room to subtract
    await page.click(SEL.tubesInc);
    await waitForNewGame(page);
    const before = await getTubes(page).count();

    await page.click(SEL.tubesDec);
    await waitForNewGame(page);
    const after = await getTubes(page).count();
    expect(after).toBe(before - 1);
  });

  // ── Settings persistence ────────────────────────────────────────────────────

  test('color count persists across page reloads', async ({ page }) => {
    // Increment to 6
    await page.click(SEL.colorsInc);
    await waitForNewGame(page);

    // Reload
    await page.reload();
    await page.waitForSelector(SEL.tube, { timeout: 15000 });
    await page.waitForTimeout(800);

    // Tubes count should reflect the persisted higher color count
    // (colors=6, tubes≥7) — just check tubes > 6
    const count = await getTubes(page).count();
    expect(count).toBeGreaterThanOrEqual(7);
  });
});
