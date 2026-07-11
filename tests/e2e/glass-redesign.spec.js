import { test, expect } from "@playwright/test";

test("benefits uses one sheet and four distinct glyphs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  await expect(page.locator(".customer-benefits-hero .brand-mascot")).toHaveCount(1);
  await expect(page.locator('[data-glass-level="acrylic"].customer-coupon-sheet')).toHaveCount(1);
  for (const kind of ["store", "dish", "group", "drink"]) {
    await expect(page.locator(`[data-glyph-kind="${kind}"]`)).toHaveCount(1);
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: "artifacts/screenshots/glass/benefits-reference.png", fullPage: true });
});

test("benefit tabs move the lens and keep content accessible", async ({ page }) => {
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  await page.getByRole("tab", { name: "推荐券" }).click();
  await expect(page.getByRole("tab", { name: "推荐券" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("朋友到店后，推荐券会自动生效")).toBeVisible();
});
