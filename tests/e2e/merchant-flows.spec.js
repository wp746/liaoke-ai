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
  await page.getByLabel("报表类型").selectOption("activity");
  await page.getByRole("button", { name: "生成报表" }).click();
  await expect(page.getByRole("status")).toHaveText("可下载");
  await expect(page.getByTestId("export-task-id").locator("..").getByText("活动报表", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "下载报表" })).toBeVisible();
});

test("only owner can publish points rules", async ({ page }) => {
  await page.goto("/?surface=merchant&role=manager&route=points-rules");
  await expect(page.getByText("老板权限才能修改积分规则")).toBeVisible();
  await expect(page.getByRole("button", { name: "保存积分规则" })).toHaveCount(0);

  await page.goto("/?surface=merchant&role=owner&route=points-rules");
  await expect(page.getByRole("button", { name: "保存积分规则" })).toBeEnabled();
  for (const [label, value] of [["每消费 1 元", "10"], ["每日到店签到", "5"], ["AI 晒圈成功", "50"], ["完善个人资料", "100"], ["生日当月到店", "200"]]) {
    await expect(page.getByLabel(label)).toHaveValue(value);
  }
  await expect(page.getByLabel("积分有效期")).toHaveValue("365");
});

test("activities expose the four PRD templates and their editor", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=activities");
  for (const template of ["老带新奖励（常驻）", "生日礼", "工作日福利", "晒圈送券"]) {
    await expect(page.getByRole("button", { name: new RegExp(template) })).toBeVisible();
  }
  await page.getByRole("button", { name: /工作日福利/ }).click();
  await expect(page).toHaveURL(/route=activity-editor/);
  await expect(page.getByRole("heading", { name: "活动编辑" })).toBeVisible();
  await expect(page.getByLabel("活动模板")).toHaveValue("weekday");
  await expect(page.getByRole("button", { name: "发布活动" })).toBeEnabled();
});

test("benefit policy enforces the PRD ranges and defaults", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=benefit-policy");
  await expect(page.getByLabel("消费返现比例")).toHaveAttribute("min", "3");
  await expect(page.getByLabel("消费返现比例")).toHaveAttribute("max", "15");
  await expect(page.getByLabel("老带新抵扣券面值")).toHaveAttribute("min", "5");
  await expect(page.getByLabel("老带新抵扣券面值")).toHaveAttribute("max", "20");
  await expect(page.getByLabel("抵扣券有效期").getByRole("option")).toHaveText(["30 天", "45 天", "60 天"]);
  await expect(page.getByLabel("每人每月领取上限")).toHaveAttribute("min", "1");
  await expect(page.getByLabel("每人每月领取上限")).toHaveAttribute("max", "20");
  await expect(page.getByLabel("新客首单优惠券面值")).toHaveAttribute("min", "0");
  await expect(page.getByLabel("新客首单优惠券面值")).toHaveAttribute("max", "30");
  await expect(page.getByLabel("成本预警阈值")).toHaveValue("12");
});

test("points product editor exposes fulfillment and publishing fields", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=points-products");
  await expect(page.getByRole("heading", { name: "积分商品" })).toBeVisible();
  await page.getByRole("button", { name: "新建积分商品" }).click();
  for (const label of ["商品图片", "商品分类", "所需积分", "库存", "每人每月上限", "上架状态"]) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
});

test("owner controls employees store availability and plan while other roles remain read only", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=employees");
  await expect(page.getByRole("button", { name: "添加员工" })).toBeEnabled();

  await page.goto("/?surface=merchant&role=owner&route=store-settings");
  await page.getByRole("button", { name: "暂停营业" }).click();
  await expect(page.getByText("门店已暂停营业", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "恢复营业" }).click();
  await expect(page.getByText("门店正常营业", { exact: true })).toBeVisible();

  await page.goto("/?surface=merchant&role=manager&route=merchant-plan");
  await expect(page.getByText("当前套餐：成长版 Pro", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "续费" })).toHaveCount(0);
  await page.goto("/?surface=merchant&role=owner&route=merchant-plan");
  await expect(page.getByRole("button", { name: "续费" })).toBeEnabled();
});

test("export job preserves its type and state across route remount", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=merchant-export");
  await page.getByLabel("报表类型").selectOption("members");
  await page.getByRole("button", { name: "生成报表" }).click();
  await expect(page.getByRole("status")).toHaveText("可下载");
  const taskId = await page.getByTestId("export-task-id").textContent();
  const navigation = page.getByRole("navigation", { name: "燎客商家主导航" });
  await navigation.getByRole("button", { name: "经营" }).click();
  await navigation.getByRole("button", { name: "我的" }).click();
  await expect(page.getByTestId("export-task-id")).toHaveText(taskId);
  await expect(page.getByTestId("export-task-id").locator("..").getByText("会员列表", { exact: true })).toBeVisible();
});

test("merchant operation forms validate and persist controlled state", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=benefit-policy");
  await page.getByLabel("消费返现比例").fill("16");
  await expect(page.getByRole("alert")).toContainText("3%–15%");
  await expect(page.getByLabel("消费返现比例")).toHaveValue("8");
  await page.getByLabel("消费返现比例").fill("14");
  await page.getByLabel("当前页面").selectOption("activities");
  await page.getByLabel("当前页面").selectOption("benefit-policy");
  await expect(page.getByLabel("消费返现比例")).toHaveValue("8");
  await page.getByLabel("消费返现比例").fill("15");
  await page.getByRole("button", { name: "保存权益策略" }).click();
  await expect(page.getByRole("status")).toHaveText("权益策略已保存");
  await page.getByLabel("当前页面").selectOption("activities");
  await page.getByLabel("当前页面").selectOption("benefit-policy");
  await expect(page.getByLabel("消费返现比例")).toHaveValue("15");

  await page.getByLabel("当前页面").selectOption("activity-editor");
  await page.getByLabel("活动模板").selectOption("birthday");
  await page.getByRole("button", { name: "发布活动" }).click();
  await expect(page.getByRole("status")).toHaveText("活动已发布");
  await page.getByLabel("当前页面").selectOption("activities");
  await page.getByLabel("当前页面").selectOption("activity-editor");
  await expect(page.getByLabel("活动模板")).toHaveValue("birthday");
});

test("points forms persist truthful saves", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=points-rules");
  await page.getByLabel("生日当月到店").fill("225");
  await page.getByLabel("当前页面").selectOption("points-products");
  await page.getByLabel("当前页面").selectOption("points-rules");
  await expect(page.getByLabel("生日当月到店")).toHaveValue("200");
  await page.getByLabel("生日当月到店").fill("250");
  await page.getByRole("button", { name: "保存积分规则" }).click();
  await expect(page.getByRole("status")).toHaveText("积分规则已保存");
  await page.getByLabel("当前页面").selectOption("points-products");
  await page.getByLabel("当前页面").selectOption("points-rules");
  await expect(page.getByLabel("生日当月到店")).toHaveValue("250");

  await page.getByLabel("当前页面").selectOption("points-product-editor");
  await page.getByLabel("商品名称").fill("新品酸梅汤");
  await page.getByRole("button", { name: "保存积分商品" }).click();
  await expect(page.getByRole("status")).toHaveText("积分商品已保存");
  await page.getByLabel("当前页面").selectOption("points-products");
  await expect(page.getByText("新品酸梅汤", { exact: true })).toBeVisible();
});

test("employee and plan actions transition state while staff is gated", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=employees");
  await page.getByRole("button", { name: "添加员工" }).click();
  const invited = page.getByRole("article").filter({ hasText: "待绑定员工" });
  await expect(invited).toBeVisible();
  await invited.getByLabel("员工角色").selectOption("manager");
  await expect(invited.getByLabel("员工角色")).toHaveValue("manager");
  page.once("dialog", (dialog) => dialog.accept());
  await invited.getByRole("button", { name: "移除员工" }).click();
  await expect(invited).toHaveCount(0);

  await page.goto("/?surface=merchant&role=owner&route=merchant-plan");
  await page.getByRole("button", { name: "续费" }).click();
  await expect(page.getByRole("status")).toHaveText("已续费 1 年");
  await page.getByRole("button", { name: "升级套餐" }).click();
  await expect(page.getByText("当前套餐：旗舰版 Enterprise", { exact: true })).toBeVisible();

  await page.goto("/?surface=merchant&role=staff&route=merchant-plan");
  await expect(page.getByRole("heading", { name: "当前角色无法访问" })).toBeVisible();
});

test("failed export is visible and retries through the real task lifecycle", async ({ page }) => {
  await page.goto("/?surface=merchant&role=owner&route=merchant-export");
  await expect(page.getByRole("status")).toHaveText("生成失败");
  const failedTaskId = await page.getByTestId("export-task-id").textContent();
  await page.getByRole("button", { name: "重试生成" }).click();
  await expect(page.getByRole("status")).toHaveText("可下载");
  await expect(page.getByTestId("export-task-id")).toHaveText(failedTaskId);
  await expect(page.getByRole("link", { name: "下载报表" })).toBeVisible();
});
