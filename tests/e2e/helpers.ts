import { Page, expect } from '@playwright/test';

// ── Selectors ────────────────────────────────────────────────────────────────

export const SEL = {
  tube: '[data-testid="tube"]',
  tubeState: (state: string) => `[data-testid="tube"][data-state="${state}"]`,
  hintSource: '[data-testid="tube"][data-state="hintSource"]',
  hintDest: '[data-testid="tube"][data-state="hintDest"]',
  selected: '[data-testid="tube"][data-state="selected"]',
  completed: '[data-testid="tube"][data-state="completed"]',
  invalid: '[data-testid="tube"][data-state="invalid"]',
  newGame: 'button:has-text("New Game")',
  hint: 'button:has-text("Hint")',
  undo: 'button:has-text("Undo")',
  reset: 'button:has-text("Reset")',
  colorsInc: '[aria-label="Increase Colors"]',
  colorsDec: '[aria-label="Decrease Colors"]',
  tubesInc: '[aria-label="Increase Tubes"]',
  tubesDec: '[aria-label="Decrease Tubes"]',
  winOverlay: 'text=Puzzle Solved!',
  newBestOverlay: 'text=New Best!',
  playAgain: 'button:has-text("Play Again")',
  deadBanner: 'text=No more moves',
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the app and wait for a game to be ready. */
export async function loadGame(page: Page) {
  await page.goto('/');
  await page.waitForSelector(SEL.tube, { timeout: 15000 });
  // Wait for animations to settle
  await page.waitForTimeout(800);
}

/** Wait for a new game to be generated (tubes rerender). */
export async function waitForNewGame(page: Page) {
  // Wait for old tubes to detach and new ones to attach
  await page.waitForTimeout(1200);
  await page.waitForSelector(SEL.tube, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/** Returns all tube locators in DOM order. */
export function getTubes(page: Page) {
  return page.locator(SEL.tube);
}

/** Find the single empty tube (data-state="default", 0 filled slots).
 *  We identify it by checking the aria-label for "0 of". */
export async function findEmptyTube(page: Page) {
  return page
    .locator('[data-testid="tube"]')
    .filter({ has: page.locator('[aria-label*="0 of"]') })
    .first();
}

/**
 * Click the Hint button and apply the suggested move.
 * Returns true if a hint was available and executed, false otherwise.
 */
export async function clickHintAndApply(page: Page): Promise<boolean> {
  // Don't click if already won or hint is disabled
  const hintBtn = page.locator(SEL.hint);
  if (await hintBtn.isDisabled()) return false;

  await hintBtn.click();

  const source = page.locator(SEL.hintSource);
  try {
    await source.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    return false; // no hint found
  }

  await source.click();
  await page.waitForTimeout(80);

  const dest = page.locator(SEL.hintDest);
  try {
    await dest.waitFor({ state: 'visible', timeout: 2000 });
  } catch {
    return false;
  }

  await dest.click();
  await page.waitForTimeout(150);
  return true;
}

/**
 * Solve the current puzzle using the hint system.
 * Returns true if the win overlay appears within maxMoves.
 */
const anyWinOverlay = (page: Page) =>
  page.locator(SEL.winOverlay).or(page.locator(SEL.newBestOverlay));

export async function solvePuzzle(page: Page, maxMoves = 60): Promise<boolean> {
  for (let i = 0; i < maxMoves; i++) {
    if (await anyWinOverlay(page).isVisible()) return true;
    const ok = await clickHintAndApply(page);
    if (!ok) break;
  }
  return anyWinOverlay(page).isVisible();
}

/**
 * Read the current move count shown in the header.
 */
export async function getMoveCount(page: Page): Promise<number> {
  const text = await page.locator('.tabular-nums').first().innerText();
  return parseInt(text, 10) || 0;
}
