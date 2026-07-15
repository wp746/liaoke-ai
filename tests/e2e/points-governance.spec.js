import { test, expect } from "@playwright/test";

test("manager publishes a points product that appears in the customer store", async ({ page }) => {
  await page.goto("/?surface=merchant&role=manager&route=points-products");
  await page.getByRole("button", { name: "新建积分商品" }).click();
  await page.getByLabel("商品名称").fill("店长上架甜品");
  await page.getByLabel("所需积分").fill("600");
  await page.getByLabel("库存").fill("5");
  await page.getByRole("button", { name: "保存积分商品" }).click();
  await expect(page.getByRole("status")).toHaveText("积分商品已保存");

  await page.getByRole("navigation", { name: "原型端选择" }).getByRole("button", { name: /顾客端/ }).click();
  await page.getByLabel("当前页面").selectOption("points-store");
  await expect(page.getByText("店长上架甜品", { exact: true })).toBeVisible();
  await expect(page.getByText(/600 积分 · 剩余库存 5/)).toBeVisible();
});

test("platform points governance pauses redemption across the customer surface", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=points-governance");
  await expect(page.getByRole("heading", { name: "积分治理" })).toBeVisible();
  await page.getByLabel("全平台积分兑换").uncheck();
  await page.getByRole("button", { name: "发布积分治理规则" }).click();
  await expect(page.getByRole("status")).toHaveText("积分治理规则已发布");

  await page.getByRole("navigation", { name: "原型端选择" }).getByRole("button", { name: /顾客端/ }).click();
  await page.getByLabel("当前页面").selectOption("points-store");
  await expect(page.getByRole("strong").filter({ hasText: "平台已暂停积分兑换" })).toBeVisible();
  await expect(page.getByRole("button", { name: /查看酸梅汤一杯/ })).toBeDisabled();
});
