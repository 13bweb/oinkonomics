import { test, expect } from "@playwright/test";

test("mint modal workflow (mock): mint -> shows minted image + explorer button", async ({ page }) => {
  await page.goto("/debug-mint");

  await page.getByRole("button", { name: /open mint modal/i }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: /mint nft/i }).click();

  await expect(page.getByRole("dialog").getByText("Mint successful", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /view on solana explorer/i })).toBeVisible();

  const img = page.getByRole("img", { name: /e2e oinkonomics #12/i });
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", "https://example.com/e2e-nft.png");
});
