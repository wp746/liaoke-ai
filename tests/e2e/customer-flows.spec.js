import { expect, test } from "@playwright/test";

test("captures the four customer handoff screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const [route, filename] of [
    ["home", "customer-home.png"],
    ["benefits", "customer-benefits.png"],
    ["points-store", "customer-points-store.png"],
  ]) {
    await page.goto(`/?surface=customer&scenario=returning-customer&route=${route}`);
    await expect(page.locator(`[data-route-id="${route}"]`)).toBeVisible();
    await page.screenshot({ path: `artifacts/screenshots/prototype/${filename}`, fullPage: true });
  }

  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-create");
  await page.getByLabel("上传用餐照片").setInputFiles({
    name: "meal.png",
    mimeType: "image/png",
    buffer: Buffer.from("prototype-image"),
  });
  await page.getByLabel("今天的真实感受").fill("吊龙很嫩，朋友聚餐很舒服");
  await page.getByRole("button", { name: "生成我的海报" }).click();
  await page.getByRole("button", { name: "继续生成图片" }).click();
  await page.getByRole("button", { name: "查看生成结果" }).click();
  await page.getByRole("button", { name: "选这版" }).first().click();
  await expect(page.getByRole("heading", { name: "海报已生成" })).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/prototype/customer-ai-poster.png", fullPage: true });
});

test("redeems a points gift and opens its code", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=points-store");
  await page.getByRole("button", { name: "查看酸梅汤一杯" }).click();
  await page.getByRole("button", { name: "立即兑换" }).click();
  await page.getByRole("button", { name: "确认消耗 500 积分" }).click();
  await expect(page.getByText("兑换成功")).toBeVisible();
  await expect(page.getByText("AB7X3K2Q")).toBeVisible();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByRole("button", { name: /750.*积分/ })).toBeVisible();
  await page.getByRole("button", { name: "积分", exact: true }).click();
  await expect(page.getByText("兑换酸梅汤一杯")).toBeVisible();
  await expect(page.getByText("-500").first()).toBeVisible();
});

test("a second eligible redemption opens its own transaction then reaches the monthly limit", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=points-store");
  for (const expectedCode of ["AB7X3K2Q", "AB7X3K2R"]) {
    await page.getByRole("button", { name: "查看酸梅汤一杯" }).click();
    await page.getByRole("button", { name: "立即兑换" }).click();
    await page.getByRole("button", { name: "确认消耗 500 积分" }).click();
    await expect(page.getByText(expectedCode)).toBeVisible();
    await page.getByRole("button", { name: "积分", exact: true }).click();
    await page.getByRole("button", { name: "逛积分商城" }).click();
  }
  await expect(page.getByRole("button", { name: "查看酸梅汤一杯" })).toBeDisabled();
  await expect(page.getByText("本月 2/2")).toBeVisible();
  await expect(page.getByText("本月限兑次数已用完")).toBeVisible();
});

test("privacy actions return prototype results and require destructive confirmation", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=privacy-data");
  await page.getByRole("button", { name: /查询个人数据/ }).click();
  await expect(page.getByText("查询结果：姓名、手机号、会员等级与积分记录")).toBeVisible();
  await page.getByRole("button", { name: /导出个人数据/ }).click();
  await expect(page.getByText("导出申请已创建（原型演示，不会生成真实文件）")).toBeVisible();
  for (const [action, consequence] of [["删除个人数据", "删除后将无法恢复"], ["撤回隐私同意", "部分个性化服务将停止"], ["注销账户", "账户权益与积分将无法继续使用"]]) {
    await page.getByRole("button", { name: new RegExp(action) }).click();
    await expect(page.getByRole("dialog")).toContainText(consequence);
    await page.getByRole("button", { name: "取消并返回" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: new RegExp(action) }).click();
    await page.getByRole("button", { name: `确认${action}` }).click();
    await expect(page.getByText(`${action}申请已记录（原型演示，未修改真实数据）`)).toBeVisible();
  }
});

test("renders every points and profile route with required customer content", async ({ page }) => {
  const routes = [
    ["points", "每日签到 +5 积分"],
    ["points-store", "积分商城"],
    ["points-product", "酸梅汤一杯"],
    ["points-redemption", "确认消耗 500 积分"],
    ["referrals", "推荐进度"],
    ["member-level", "1,280 / 2,000 成长值"],
    ["me", "林小满"],
    ["privacy-data", "撤回隐私同意"],
  ];
  for (const [route, copy] of routes) {
    await page.goto(`/?surface=customer&scenario=returning-customer&route=${route}`);
    await expect(page.getByText(copy, { exact: false }).first()).toBeVisible();
  }
  await page.goto("/?surface=customer&scenario=returning-customer&route=points-store");
  for (const category of ["热门", "饮品", "小菜", "小吃", "服务"]) await expect(page.getByRole("tab", { name: category })).toBeVisible();
  await expect(page.getByRole("button", { name: /优先排队一次/ })).toBeDisabled();
});

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
  await expect(page.getByRole("button", { name: "生成我的海报" })).toBeDisabled();
  for (const style of ["烟火食刻", "质感大片", "漫画趣味", "简约清新"]) {
    await expect(page.getByRole("button", { name: style, exact: true })).toBeVisible();
  }

  await page.getByLabel("上传用餐照片").setInputFiles({
    name: "meal.png",
    mimeType: "image/png",
    buffer: Buffer.from("prototype-image"),
  });
  await page.getByLabel("今天的真实感受").fill("吊龙很嫩，朋友聚餐很舒服");
  await page.getByRole("button", { name: "漫画趣味", exact: true }).click();
  await page.getByRole("button", { name: "生成我的海报" }).click();
  await expect(page.getByText("燎小星正在点亮这张照片")).toBeVisible();
  await page.getByRole("button", { name: "继续生成图片" }).click();
  await expect(page.getByText("正在为照片调出烟火质感")).toBeVisible();
  await page.getByRole("button", { name: "查看生成结果" }).click();
  await expect(page.getByRole("button", { name: "选这版" })).toHaveCount(3);
  await expect(page.getByText("已使用「漫画趣味」效果，你还可以重新创作。")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "生成我的海报" })).toBeDisabled();
  await expect(page.getByText("燎小星正在点亮这张照片")).toHaveCount(0);
});

test("does not start AI generation without an image", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-create");
  await page.getByLabel("今天的真实感受").fill("吊龙很嫩");
  await expect(page.getByRole("button", { name: "生成我的海报" })).toBeDisabled();
  await expect(page.getByText("燎小星正在点亮这张照片")).toHaveCount(0);
  await expect(page).toHaveURL(/route=ai-create/);
});

test("renders fallback and rejection from stateful upstream outcomes", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-create&variant=fallback");
  await page.getByLabel("上传用餐照片").setInputFiles({ name: "meal.png", mimeType: "image/png", buffer: Buffer.from("image") });
  await page.getByRole("button", { name: "生成我的海报" }).click();
  await page.getByRole("button", { name: "继续生成图片" }).click();
  await page.getByRole("button", { name: "查看生成结果" }).click();
  await expect(page.getByText("先给你精选版")).toBeVisible();
  await page.getByRole("button", { name: "查看生成结果" }).click();
  await expect(page.getByRole("button", { name: "选这版" })).toHaveCount(3);

  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-create&variant=rejected");
  await page.getByLabel("上传用餐照片").setInputFiles({ name: "meal.png", mimeType: "image/png", buffer: Buffer.from("image") });
  await page.getByLabel("今天的真实感受").fill("需保留的真实感受");
  await page.getByRole("button", { name: "简约清新", exact: true }).click();
  await page.getByRole("button", { name: "生成我的海报" }).click();
  await expect(page.getByText("照片不符合要求，请更换")).toBeVisible();
  await page.getByRole("button", { name: "返回更换照片" }).click();
  await expect(page.getByRole("heading", { name: "把这一桌，拍成会发光的记忆" })).toBeVisible();
  await expect(page.getByLabel("今天的真实感受")).toHaveValue("需保留的真实感受");
  await expect(page.getByRole("button", { name: "简约清新", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("guards AI result routes while generation state is idle", async ({ page }) => {
  for (const route of ["ai-select", "poster-preview"]) {
    await page.goto(`/?surface=customer&scenario=returning-customer&route=${route}`);
    await expect(page.getByRole("heading", { name: "把这一桌，拍成会发光的记忆" })).toBeVisible();
    await expect(page.getByRole("button", { name: "选这版" })).toHaveCount(0);
  }
});
