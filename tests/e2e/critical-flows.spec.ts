import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("visitor can discover the generator and is directed to secure sign-in before committing", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Turn your skills/i })).toBeVisible();
  await page.getByRole("link", { name: /Generate My September Idea/i }).click();
  await expect(page.getByRole("heading", { name: /AI Idea Generator/i })).toBeVisible();
  await page.goto("/account");
  await expect(page.getByRole("button", { name: /Continue Securely With GitHub/i })).toBeVisible();
  await expect(page.getByText(/Demo email|Demo Mode/i)).toHaveCount(0);
});

test("showcase uses an empty production state until real projects are approved", async ({ page }) => {
  await page.goto("/showcase");
  await expect(page.getByRole("heading", { name: /Showcase/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Submit Finished Build/i })).toBeVisible();
  await expect(page.getByText("InvoiceFlow")).toHaveCount(0);
});
