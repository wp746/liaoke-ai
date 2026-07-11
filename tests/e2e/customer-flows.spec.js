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

test("referral tab renders upstream records without a self-service issuance control", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=benefits");
  await page.getByRole("tab", { name: "推荐券" }).click();
  await expect(page.getByRole("button", { name: "生成推荐券" })).toHaveCount(0);
  await expect(page.getByText("RC-20260710-PENDING")).toBeVisible();
  await expect(page.getByText("待生效", { exact: true })).toBeVisible();
  await expect(page.getByText("可使用", { exact: true })).toBeVisible();
  await expect(page.getByText("已使用", { exact: true })).toBeVisible();
  await expect(page.getByText("已过期", { exact: true })).toBeVisible();
});

test("creates and saves a referral poster", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-create");
  await expect(page.getByLabel("上传用餐照片")).toHaveAttribute("multiple", "");
  await expect(page.getByLabel("今天的真实感受")).toHaveAttribute("maxlength", "50");
  for (const style of ["烟火食刻", "质感大片", "漫画趣味", "简约清新"]) {
    await expect(page.getByRole("button", { name: style, exact: true })).toBeVisible();
  }

  await page.getByLabel("今天的真实感受").fill("吊龙很嫩，朋友聚餐很舒服");
  await page.getByRole("button", { name: "生成我的海报" }).click();
  await expect(page.getByText("燎小星正在点亮这张照片")).toBeVisible();
  await page.getByRole("button", { name: "查看生成结果" }).click();
  await expect(page.getByRole("button", { name: "选这版" })).toHaveCount(3);
  await page.getByRole("button", { name: "选这版" }).first().click();
  await expect(page.getByRole("heading", { name: "海报已生成" })).toBeVisible();
  await expect(page.getByText("专属推荐码")).toBeVisible();
  await expect(page.getByText("牛里牛气潮汕牛肉火锅")).toBeVisible();
  await expect(page.getByRole("button", { name: "保存海报" })).toBeVisible();
  await expect(page.getByRole("button", { name: "复制文案" })).toBeVisible();
  await expect(page.getByRole("button", { name: "再生成一次" })).toBeVisible();
  await expect(page.getByText(/强制分享/)).toHaveCount(0);
});

test("shows deterministic AI progress fallback and rejection states", async ({ page }) => {
  const states = [
    ["copy", "正在理解你的真实感受"],
    ["image", "正在为照片调出烟火质感"],
    ["fallback", "先给你精选版"],
    ["rejected", "照片不符合要求，请更换"],
  ];

  for (const [variant, copy] of states) {
    await page.goto(`/?surface=customer&scenario=returning-customer&route=ai-progress&variant=${variant}`);
    await expect(page.getByText(copy)).toBeVisible();
  }
});

test("limits an AI creation to three uploaded images", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-create");
  await page.getByLabel("上传用餐照片").setInputFiles(
    [1, 2, 3, 4].map((index) => ({
      name: `meal-${index}.png`,
      mimeType: "image/png",
      buffer: Buffer.from("prototype-image"),
    })),
  );
  await expect(page.getByText("最多上传 3 张照片")).toBeVisible();
});
