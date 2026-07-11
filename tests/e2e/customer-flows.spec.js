import { expect, test } from "@playwright/test";

test("new customer accepts consent and claims the daily benefit", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=new-customer&route=entry-consent");
  await page.getByRole("button", { name: "同意并继续" }).click();
  await expect(page.getByText("欢迎落座")).toBeVisible();
  await page.getByRole("button", { name: "领取 ¥10 今日到店券" }).click();
  await expect(page.getByText("福利已放进权益中心")).toBeVisible();
  await page.getByRole("button", { name: "查看权益" }).click();
  await expect(page.getByRole("heading", { name: "权益中心" })).toBeVisible();
});

test("consent must be checked before a new customer can continue", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=new-customer&route=entry-consent");
  await page.getByRole("checkbox", { name: "我已阅读并同意用户服务与隐私说明" }).uncheck();
  await expect(page.getByRole("button", { name: "同意并继续" })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "这一桌的星火，等你点亮" })).toBeVisible();
});

test("coupon detail keeps the coupon selected from benefits", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=benefits");
  await page.getByRole("button", { name: /手切嫩肉一份/ }).click();
  await expect(page.getByRole("heading", { name: "手切嫩肉一份" })).toBeVisible();
  await expect(page.getByText("NENR0710")).toBeVisible();
  await expect(page.getByText("有效期至 2026-08-10 23:59:59")).toBeVisible();
});

test("referral tab renders referral coupon records and their state", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=benefits");
  await page.getByRole("tab", { name: "推荐券" }).click();
  await page.getByRole("button", { name: "生成推荐券" }).click();
  await expect(page.getByText("RC-20260710-01")).toBeVisible();
  await expect(page.getByText("待生效", { exact: true })).toBeVisible();
});
