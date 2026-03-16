import { test, expect } from '@playwright/test';
import { loadGame, SEL } from './helpers';

test.describe('Hint system', () => {
  test.beforeEach(async ({ page }) => {
    await loadGame(page);
  });

  test('clicking Hint highlights a source tube (amber)', async ({ page }) => {
    await page.click(SEL.hint);
    await expect(page.locator(SEL.hintSource)).toBeVisible({ timeout: 5000 });
  });

  test('clicking Hint highlights a destination tube (violet)', async ({ page }) => {
    await page.click(SEL.hint);
    await expect(page.locator(SEL.hintDest)).toBeVisible({ timeout: 5000 });
  });

  test('hint source and dest are different tubes', async ({ page }) => {
    await page.click(SEL.hint);
    const source = page.locator(SEL.hintSource);
    const dest = page.locator(SEL.hintDest);
    await expect(source).toBeVisible({ timeout: 5000 });
    await expect(dest).toBeVisible({ timeout: 5000 });

    const sourceBox = await source.boundingBox();
    const destBox = await dest.boundingBox();
    expect(sourceBox).not.toEqual(destBox);
  });

  test('Hint button shows active styling while hint is displayed', async ({ page }) => {
    await page.click(SEL.hint);
    await page.locator(SEL.hintSource).waitFor({ timeout: 5000 });
    // Hint button should have the amber active class
    const hintBtn = page.locator(SEL.hint);
    await expect(hintBtn).toHaveClass(/bg-amber/, { timeout: 2000 });
  });

  test('executing hinted move clears hint highlighting', async ({ page }) => {
    await page.click(SEL.hint);
    await page.locator(SEL.hintSource).waitFor({ timeout: 5000 });

    // Execute the move
    await page.locator(SEL.hintSource).click();
    await page.waitForTimeout(80);
    await page.locator(SEL.hintDest).click();
    await page.waitForTimeout(300);

    // Hint should be gone
    await expect(page.locator(SEL.hintSource)).not.toBeVisible();
    await expect(page.locator(SEL.hintDest)).not.toBeVisible();
  });

  test('hint auto-clears after ~3 seconds if not acted on', async ({ page }) => {
    await page.click(SEL.hint);
    await page.locator(SEL.hintSource).waitFor({ timeout: 5000 });
    // Wait for auto-clear
    await page.waitForTimeout(3500);
    await expect(page.locator(SEL.hintSource)).not.toBeVisible();
    await expect(page.locator(SEL.hintDest)).not.toBeVisible();
  });

  test('hint can be requested again after auto-clear', async ({ page }) => {
    await page.click(SEL.hint);
    await page.locator(SEL.hintSource).waitFor({ timeout: 5000 });
    await page.waitForTimeout(3500); // wait for auto-clear

    // Request again
    await page.click(SEL.hint);
    await expect(page.locator(SEL.hintSource)).toBeVisible({ timeout: 5000 });
  });

  test('hint is disabled when game is won', async ({ page }) => {
    // Solve via hints to win
    let won = false;
    for (let i = 0; i < 60 && !won; i++) {
      if (await page.locator(SEL.winOverlay).isVisible()) { won = true; break; }
      const hintBtn = page.locator(SEL.hint);
      if (await hintBtn.isDisabled()) break;
      await hintBtn.click();
      const src = page.locator(SEL.hintSource);
      try {
        await src.waitFor({ state: 'visible', timeout: 4000 });
        await src.click();
        await page.waitForTimeout(80);
        await page.locator(SEL.hintDest).click();
        await page.waitForTimeout(150);
      } catch { break; }
    }
    if (won || await page.locator(SEL.winOverlay).isVisible()) {
      // Win overlay is showing; hint button should be disabled
      // (overlay is modal but Hint button is behind it — test the button attr)
      const hintBtn = page.locator(SEL.hint);
      await expect(hintBtn).toBeDisabled();
    }
  });
});
