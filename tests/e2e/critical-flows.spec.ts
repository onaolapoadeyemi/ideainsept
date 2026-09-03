import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("visitor generates a fallback idea and commits after demo auth", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Turn your skills/i })).toBeVisible();
  await page.getByRole("button", { name: /Generate Idea/i }).click();
  await expect(page.getByRole("heading", { name: /SprintPulse|ApiCost Guard|RepoReadiness/i })).toBeVisible();
  await page.getByRole("button", { name: /Commit to this Sprint/i }).click();
  await expect(page).toHaveURL(/account/);
  await page.getByRole("button", { name: /Continue In Demo Mode/i }).click();
  await page.goto("/generator");
  await page.getByRole("button", { name: /Generate Idea/i }).click();
  await page.getByRole("button", { name: /Commit to this Sprint/i }).click();
  await expect(page).toHaveURL(/sprint/);
  await page.getByRole("gridcell", { name: /^Day 1, /i }).click();
  await page.getByRole("combobox", { name: /^Status$/ }).selectOption("completed");
  await page.reload();
  await expect(page.getByText("1/30")).toBeVisible();
});

test("submitted project stays out of public feed until approved and duplicate vote is rejected", async ({ page }) => {
  await page.goto("/account");
  await page.getByRole("button", { name: /Continue In Demo Mode/i }).click();
  await page.goto("/showcase");
  await page.getByLabel("Project name").fill("QuietLaunch");
  await page.getByLabel("Tagline").fill("A calm launch board");
  await page.getByLabel("Tech stack").fill("React, Supabase");
  await page.getByLabel("Live link").fill("https://example.com/quietlaunch");
  await page.getByLabel("Pitch").fill("A finished September project that keeps launch work visible without noise.");
  await page.getByLabel(/authorized/).check();
  await page.getByLabel(/showcase rules/).check();
  await page.getByRole("button", { name: /Submit for Review/i }).click();
  await expect(page.getByText(/Submitted for moderation/i)).toBeVisible();
  await expect(page.getByText("QuietLaunch")).toHaveCount(0);
  await page.getByRole("button", { name: /^Vote$/i }).first().click();
  await page.getByRole("button", { name: /^Vote$/i }).first().click();
  await expect(page.getByText(/already voted/i)).toBeVisible();
});
