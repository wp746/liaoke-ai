import { test, expect } from "@playwright/test";

test("switches between all three surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "燎客 AI 三端高保真原型" })).toBeVisible();
  await page.getByRole("button", { name: "商家端" }).click();
  await expect(page.locator('[data-surface="merchant"]')).toBeVisible();
  await page.getByRole("button", { name: "平台后台" }).click();
  await expect(page.locator('[data-surface="admin"]')).toBeVisible();
});

test("keeps the inspector open on desktop and collapses it into a mobile drawer", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/");
  await expect(page.getByText("实时检查器", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 820, height: 800 });
  await expect(page.getByText("原型控制台", { exact: true })).toBeVisible();
  await expect(page.getByText("实时检查器", { exact: true })).toBeHidden();
  await page.getByText("原型控制台", { exact: true }).click();
  await expect(page.getByText("实时检查器", { exact: true })).toBeVisible();
});
