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
