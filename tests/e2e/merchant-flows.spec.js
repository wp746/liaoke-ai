import { expect, test } from "@playwright/test";

test("staff lands on verification and cannot see owner operations", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=verify-hub");
  const navigation = page.getByRole("navigation", { name: "燎客商家主导航" });

  await expect(navigation.getByRole("button")).toHaveText(["核销", "记录", "我的"]);
  await expect(navigation).not.toContainText("运营");
  await expect(page.getByRole("link", { name: "积分规则" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "核销工作台" })).toBeVisible();
});

test("staff verifies a points gift without cash fields", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub");
  await page.getByRole("button", { name: "积分兑换核销" }).click();
  await page.getByRole("button", { name: "模拟扫描" }).click();
  await expect(page.getByText("酸梅汤一杯")).toBeVisible();
  await expect(page.getByText("500 积分")).toBeVisible();
  await expect(page.getByText("应收金额")).toHaveCount(0);
  await page.getByRole("button", { name: "确认已交付赠品" }).click();
  await expect(page.getByText("核销成功")).toBeVisible();
});

test("manual verification keeps the submitted code and appends an auditable history record", async ({ page }) => {
  const submittedCode = "HAND-9Z77";
  await page.goto("/?surface=merchant&role=staff&route=verify-hub");
  await page.getByRole("button", { name: /手动核销/ }).click();
  await page.getByLabel("核销码").fill(submittedCode);
  await page.getByRole("button", { name: "查询权益" }).click();
  await expect(page.getByText(`核销码 ${submittedCode}`, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认核销" }).click();
  await expect(page.getByRole("heading", { name: "核销成功" })).toBeVisible();
  await page.getByRole("navigation", { name: "燎客商家主导航" }).getByRole("button", { name: "记录" }).click();
  const record = page.getByRole("article").filter({ hasText: submittedCode });
  await expect(record).toContainText("手动券码");
  await expect(record).toContainText("李店员");
  await expect(record).toContainText("2026-07-11 14:32:08");
});

test("all five verification modes share scan, manual, processing, and timeout-safe states", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=verify-hub");
  for (const label of ["扫码核销", "手动核销", "余额核销", "老带新抵扣券核销", "积分兑换核销"]) {
    await expect(page.getByRole("button", { name: new RegExp(label) })).toBeVisible();
  }

  await page.getByRole("button", { name: /扫码核销/ }).click();
  await page.getByRole("button", { name: "手动输入" }).click();
  await expect(page.getByLabel("核销码")).toBeVisible();
  await page.getByRole("button", { name: "查询权益" }).click();
  await page.getByLabel("演示结果").selectOption("timeout-query");
  await page.getByRole("button", { name: "确认核销" }).click();
  await expect(page.getByRole("status")).toContainText("正在校验");
  await expect(page.getByText("正在查询核销结果", { exact: true })).toBeVisible();
  await expect(page.getByText("查询状态：未核销", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "重新核销" })).toBeVisible();
});

test("manager searches and filters members then opens the member 360 view", async ({ page }) => {
  await page.goto("/?surface=merchant&role=manager&route=members");
  await expect(page.getByRole("heading", { name: "会员管理" })).toBeVisible();
  await page.getByLabel("搜索会员").fill("3208");
  await expect(page.getByText("陈一川", { exact: true })).toBeVisible();
  await expect(page.getByText("林小满", { exact: true })).toHaveCount(0);
  await page.getByLabel("搜索会员").fill("");
  await page.getByLabel("会员等级").selectOption("Lv2 熟客");
  await expect(page.getByText("林小满", { exact: true })).toBeVisible();
  await page.getByLabel("最近到店").selectOption("7");
  await page.getByLabel("老带新人数").selectOption("3");
  await page.getByRole("button", { name: /林小满/ }).click();
  await expect(page.getByRole("heading", { name: "林小满" })).toBeVisible();
  for (const section of ["基本资料", "等级成长", "消费记录", "AI 晒圈", "当前权益", "积分记录", "老带新抵扣券记录"]) {
    await expect(page.getByRole("heading", { name: section })).toBeVisible();
  }
});

test("staff cannot access member profiles", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=member-detail");
  await expect(page.getByRole("heading", { name: "当前角色无法访问" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "基本资料" })).toHaveCount(0);
});

test("verification outcomes are explicit and history respects the signed-in role", async ({ page }) => {
  const outcomes = {
    duplicate: "该兑换码已使用",
    "wrong-store": "非本门店权益",
    pending: "权益暂未生效",
    "minimum-spend": "未满足最低消费",
  };
  for (const [outcome, title] of Object.entries(outcomes)) {
    await page.goto(`/?surface=merchant&role=staff&route=verify-result&outcome=${outcome}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }

  await page.goto("/?surface=merchant&role=manager&route=verify-result&outcome=success");
  await expect(page.getByText("陈店长", { exact: true })).toBeVisible();
  await expect(page.getByText("2026-07-11 14:32:08", { exact: true })).toBeVisible();

  await page.goto("/?surface=merchant&role=staff&route=verify-history");
  await expect(page.getByText("李店员 · 2026-07-11 14:32:08", { exact: true })).toBeVisible();
  await expect(page.getByText(/陈店长/)).toHaveCount(0);
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
  await expect(page.getByText("本月权益成本率 8.6%，距离 12% 预警线还有 3.4%。", { exact: true })).toBeVisible();
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

test("merchant account keeps data export exclusive to the owner", async ({ page }) => {
  for (const role of ["manager", "staff"]) {
    await page.goto(`/?surface=merchant&role=${role}&route=merchant-export`);
    await expect(page.getByRole("heading", { name: "我的账号" })).toBeVisible();
    await expect(page.getByText("账号与门店身份信息", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "导出经营数据" })).toHaveCount(0);
    await expect(page.getByText("当前角色已通过权限校验。", { exact: true })).toHaveCount(0);
  }

  await page.goto("/?surface=merchant&role=owner&route=merchant-export");
  await expect(page.getByRole("heading", { name: "我的账号" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "数据导出" })).toBeVisible();
  await page.getByRole("button", { name: "导出经营数据" }).click();
  await expect(page.getByText("导出申请已记录（原型演示，不会生成真实文件）", { exact: true })).toBeVisible();
});
