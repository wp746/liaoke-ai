import { expect, test } from "@playwright/test";

test("staff lands on verification and cannot see owner operations", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=verify-hub");
  const navigation = page.getByRole("navigation", { name: "燎客商家主导航" });

  await expect(navigation.getByRole("button")).toHaveText(["核销", "记录", "我的"]);
  await expect(navigation).not.toContainText("运营");
  await expect(page.getByRole("link", { name: "积分规则" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "核销工作台" })).toBeVisible();
});

test("inaccessible merchant routes show permission state instead of target content", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=points-rules");

  await expect(page.getByRole("heading", { name: "当前角色无法访问" })).toBeVisible();
  await expect(page.getByText("积分规则配置")).toHaveCount(0);
  await expect(page.getByText("仅老板可配置积分规则")).toHaveCount(0);
  await page.getByRole("button", { name: "返回核销工作台" }).click();
  await expect(page.getByRole("heading", { name: "核销工作台" })).toBeVisible();
  await expect(page).toHaveURL(/route=verify-hub/);
});

test("owner dashboard shows the PRD operating picture and opens scanning", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=merchant-dashboard");

  const metrics = page.getByLabel("今日六项核心经营指标");
  for (const metric of ["今日扫码", "到店券领取", "今日新会员", "AI 海报用户", "老带新订单", "预估新增营业额"]) {
    await expect(metrics.getByText(metric, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "近7天" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "近30天" }).click();
  await expect(page.getByRole("button", { name: "近30天" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("门店营业中")).toBeVisible();
  await expect(page.getByText("权益成本接近预警线", { exact: true })).toBeVisible();
  await expect(page.getByText("本月有3位铁杆会员生日，发张生日券试试")).toBeVisible();
  await expect(page.getByRole("heading", { name: "最近核销" })).toBeVisible();

  await page.getByRole("button", { name: "扫一扫" }).click();
  await expect(page).toHaveURL(/route=verify-scan/);
});

test("manager can view the dashboard but cannot control store pause", async ({ page }) => {
  await page.goto("/?surface=merchant&role=manager&route=merchant-dashboard");

  await expect(page.getByRole("heading", { name: "今日经营" })).toBeVisible();
  await expect(page.getByRole("button", { name: "暂停营业" })).toHaveCount(0);
  await expect(page.getByText("仅老板可调整营业状态")).toBeVisible();
});

test("merchant login identifies the owner and enters the dashboard", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=merchant-login");

  await expect(page.getByRole("heading", { name: "商家登录" })).toBeVisible();
  await expect(page.getByText("老板 · 王老板")).toBeVisible();
  await expect(page.getByText("牛里牛气潮汕牛肉火锅")).toBeVisible();
  await page.getByRole("button", { name: "进入经营工作台" }).click();
  await expect(page).toHaveURL(/route=merchant-dashboard/);
});
