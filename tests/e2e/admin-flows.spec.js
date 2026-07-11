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
  await page.getByRole("button", { name: "查看牛里牛气潮汕牛肉火锅" }).click();
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
  await expect(page.getByRole("heading", { name: "牛里牛气潮汕牛肉火锅" })).toBeVisible();

  await page.goto("/?surface=admin&role=platform_admin&route=store-editor");
  await expect(page.getByRole("heading", { name: "门店资料" })).toBeVisible();
  await expect(page.getByRole("button", { name: "保存门店" })).toHaveCount(0);
  await expect(page.getByText("当前为只读运营视图，所有字段均不可编辑。")).toBeVisible();
});

test("table-code batch actions create real rows and persist deactivation across routes", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=table-codes");

  const rows = page.getByRole("table", { name: "牛里牛气桌码列表" }).getByRole("row");
  await expect(rows).toHaveCount(4);
  await page.getByLabel("批量生成数量").fill("3");
  await page.getByRole("button", { name: "批量生成桌码" }).click();
  await expect(rows).toHaveCount(7);
  for (const table of ["A15", "A16", "A17"]) {
    await expect(page.getByRole("cell", { name: table, exact: true })).toBeVisible();
  }
  await expect(page.getByText("NXNQ-A15-NEW-001", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("已生成 3 个桌码并加入当前门店列表。");

  await page.getByRole("checkbox", { name: "选择 A15" }).check();
  await page.getByRole("button", { name: "下载已选桌码" }).click();
  await expect(page.getByRole("status")).toHaveText("已选择 A15（NXNQ-A15-NEW-001）；原型未生成真实下载文件。");

  await page.getByRole("button", { name: "停用 A12" }).click();
  await expect(page.getByRole("dialog", { name: "确认停用桌码" })).toBeVisible();
  await page.getByRole("button", { name: "确认停用" }).click();
  await expect(page.getByRole("status")).toHaveText("桌码 A12 已在本次原型会话中停用。");
  await page.getByRole("navigation", { name: "平台模块导航" }).getByRole("button", { name: "门店" }).click();
  await page.getByRole("navigation", { name: "平台模块导航" }).getByRole("button", { name: "桌码" }).click();
  await expect(page.getByRole("row").filter({ hasText: "A12" })).toContainText("已停用");
  await expect(page.getByRole("cell", { name: "A15", exact: true })).toBeVisible();

  await page.goto("/?surface=admin&role=platform_admin&route=table-codes");
  await expect(page.getByRole("button", { name: "批量生成桌码" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /\u505c用 A12/ })).toHaveCount(0);
});

test("store edits and creates persist across admin route navigation", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=stores");
  await page.getByRole("button", { name: "查看牛里牛气潮汕牛肉火锅" }).click();
  await page.getByRole("button", { name: "编辑门店" }).click();
  await page.getByLabel("门店名称").fill("牛里牛气旗舰店");
  await page.getByLabel("人均消费").fill("168");
  await page.getByRole("button", { name: "保存门店" }).click();
  await expect(page.getByRole("heading", { name: "牛里牛气旗舰店" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("门店资料已保存到当前原型会话。");
  await expect(page.getByText("¥168", { exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "平台模块导航" }).getByRole("button", { name: "门店" }).click();
  await expect(page.getByRole("cell", { name: /牛里牛气旗舰店 STORE001/ })).toBeVisible();

  await page.getByRole("button", { name: "创建门店" }).click();
  await page.getByLabel("门店名称").fill("燎火小馆深圳店");
  await page.getByLabel("门店类型").selectOption("中式正餐");
  await page.getByLabel("桌牌 IP").fill("燎小星·小馆系列");
  await page.getByLabel("人均消费").fill("88");
  await page.getByLabel("SaaS 套餐").selectOption("basic");
  await page.getByLabel("品牌 Logo").fill("liaohuo.svg");
  await page.getByLabel("品牌主色").fill("#F26B38");
  await page.getByRole("button", { name: "保存门店" }).click();
  await expect(page.getByRole("heading", { name: "燎火小馆深圳店" })).toBeVisible();
  await page.getByRole("navigation", { name: "平台模块导航" }).getByRole("button", { name: "门店" }).click();
  await expect(page.getByRole("cell", { name: /燎火小馆深圳店 STORE028/ })).toBeVisible();
});

test("every store drilldown carries the selected store identity", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=stores");
  await page.getByRole("button", { name: "查看薪火小馆·珠江新城" }).click();
  await expect(page.getByRole("heading", { name: "薪火小馆·珠江新城" })).toBeVisible();
  await expect(page.getByText("STORE018 · 广州·天河 · 营业中", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "编辑门店" }).click();
  await expect(page.getByLabel("门店名称")).toHaveValue("薪火小馆·珠江新城");
  await page.getByRole("navigation", { name: "平台模块导航" }).getByRole("button", { name: "桌码" }).click();
  await expect(page.getByRole("table", { name: "薪火小馆·珠江新城桌码列表" })).toBeVisible();
});

test("global and store filters select results and expose empty states", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=admin-overview");
  const globalSearch = page.getByPlaceholder("搜索门店、任务或订单");
  await globalSearch.fill("岭南");
  await page.getByRole("button", { name: "打开岭南清汤牛肉" }).click();
  await expect(page.getByRole("heading", { name: "岭南清汤牛肉" })).toBeVisible();
  await globalSearch.fill("不存在的门店");
  await expect(page.getByText("没有找到匹配的门店", { exact: true })).toBeVisible();

  await page.getByRole("navigation", { name: "平台模块导航" }).getByRole("button", { name: "门店" }).click();
  await page.getByLabel("门店检索").fill("珠江");
  await expect(page.getByRole("cell", { name: /薪火小馆·珠江新城 STORE018/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: /牛里牛气/ })).toHaveCount(0);
  await page.getByLabel("门店检索").fill("");
  await page.getByLabel("经营状态").selectOption("paused");
  await expect(page.getByRole("cell", { name: /岭南清汤牛肉 STORE027/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: /薪火小馆/ })).toHaveCount(0);
  await page.getByLabel("门店检索").fill("不存在");
  await expect(page.getByText("没有符合条件的门店", { exact: true })).toBeVisible();
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
