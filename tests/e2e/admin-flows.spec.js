import { expect, test } from "@playwright/test";

test("platform admin gets a complete read-only command center", async ({ page }) => {
  await page.goto("/?surface=admin&role=platform_admin&route=admin-overview");

  await expect(page.getByText("只读运营视图")).toBeVisible();
  await expect(page.getByPlaceholder("搜索门店、任务或订单")).toBeVisible();
  await expect(page.getByRole("heading", { name: "平台经营总览" })).toBeVisible();
  await expect(page.getByLabel("平台核心指标")).toContainText("在线门店");
  await expect(page.getByRole("img", { name: "近30日平台扫码趋势" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "风险队列" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "上下文助手" })).toBeVisible();
  await expect(page.getByRole("button", { name: "创建门店" })).toHaveCount(0);
});

test("super admin drills into 牛里牛气 and can open its editor", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=admin-overview");
  await page.getByRole("button", { name: "查看牛里牛气" }).click();
  await expect(page.getByRole("heading", { name: "牛里牛气潮汕牛肉火锅" })).toBeVisible();
  await expect(page.getByText("单店360°详情")).toBeVisible();
  await page.getByRole("button", { name: "编辑门店" }).click();
  await expect(page.getByRole("heading", { name: "编辑门店" })).toBeVisible();
});

test("store editor exposes the complete store profile and honors role permissions", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=store-editor");

  for (const label of ["门店名称", "门店类型", "桌牌 IP", "人均消费", "SaaS 套餐", "门店状态", "品牌 Logo", "品牌主色"]) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "保存门店" })).toBeEnabled();
  await page.getByRole("button", { name: "保存门店" }).click();
  await expect(page.getByRole("status")).toHaveText("原型已保存：门店资料已更新，生产环境将写入审计日志。");

  await page.goto("/?surface=admin&role=platform_admin&route=store-editor");
  await expect(page.getByRole("heading", { name: "门店资料" })).toBeVisible();
  await expect(page.getByRole("button", { name: "保存门店" })).toHaveCount(0);
  await expect(page.getByText("当前为只读运营视图，所有字段均不可编辑。")).toBeVisible();
});

test("table-code batch actions report truthful prototype outcomes and require confirmation", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=table-codes");

  await page.getByLabel("批量生成数量").fill("3");
  await page.getByRole("button", { name: "批量生成桌码" }).click();
  await expect(page.getByRole("status")).toContainText("原型演示：已在当前页生成 3 个临时桌码");

  await page.getByRole("checkbox", { name: "选择 A12" }).check();
  await page.getByRole("button", { name: "下载已选桌码" }).click();
  await expect(page.getByRole("status")).toContainText("原型演示：已准备 1 个桌码的下载清单，未生成真实文件");

  await page.getByRole("button", { name: "停用 A12" }).click();
  await expect(page.getByRole("dialog", { name: "确认停用桌码" })).toBeVisible();
  await page.getByRole("button", { name: "确认停用" }).click();
  await expect(page.getByRole("status")).toHaveText("桌码 A12 已在本次原型会话中停用。");

  await page.goto("/?surface=admin&role=platform_admin&route=table-codes");
  await expect(page.getByRole("button", { name: "批量生成桌码" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /\u505c用 A12/ })).toHaveCount(0);
});

test("admin login identifies the role and enters the command center", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=admin-login");
  await expect(page.getByRole("heading", { name: "平台后台登录" })).toBeVisible();
  await expect(page.getByText("超级管理员 · 创始人工作台")).toBeVisible();
  await page.getByRole("button", { name: "进入全局经营指挥台" }).click();
  await expect(page).toHaveURL(/route=admin-overview/);
});

test("tablet admin navigation collapses to an accessible icon rail", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/?surface=admin&role=super_admin&route=stores");

  const sidebar = page.locator(".admin-sidebar");
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByText("平台总览", { exact: true })).toHaveCSS("width", "1px");
  await expect(sidebar.getByRole("button", { name: "平台总览" })).toBeVisible();
  await expect(page.getByRole("table", { name: "平台门店列表" })).toBeVisible();
});
