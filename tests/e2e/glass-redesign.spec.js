import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";

async function captureWithoutBlackTiles(page, path) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const screenshot = await page.screenshot({ fullPage: true });
    const blackRatio = await page.evaluate(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 144;
      canvas.height = Math.max(1, Math.round((image.height / image.width) * canvas.width));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let blackPixels = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] < 8 && pixels[index + 1] < 8 && pixels[index + 2] < 8) blackPixels += 1;
      }
      return blackPixels / (pixels.length / 4);
    }, `data:image/png;base64,${screenshot.toString("base64")}`);

    if (blackRatio < 0.02) {
      await writeFile(path, screenshot);
      return;
    }
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  throw new Error(`Black compositor tiles persisted while capturing ${path}`);
}

test("benefits uses one sheet and four distinct glyphs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  await expect(page.locator(".customer-benefits-hero .brand-mascot")).toHaveCount(1);
  await expect(page.locator('[data-glass-level="acrylic"].customer-coupon-sheet')).toHaveCount(1);
  for (const kind of ["store", "dish", "group", "drink"]) {
    await expect(page.locator(`[data-glyph-kind="${kind}"]`)).toHaveCount(1);
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: "artifacts/screenshots/glass/benefits-reference.png", fullPage: true });
});

test("benefit tabs move the lens and keep content accessible", async ({ page }) => {
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  await page.getByRole("tab", { name: "推荐券" }).click();
  await expect(page.getByRole("tab", { name: "推荐券" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("朋友到店后，推荐券会自动生效")).toBeVisible();
});

test("customer nav is a floating glass dock with one AI lens", async ({ page }) => {
  await page.goto("/?surface=customer&route=home&scenario=returning-customer");
  const nav = page.getByRole("navigation", { name: "燎客 AI主导航" });
  await expect(nav).toHaveClass(/mini-program-tabs--glass/);
  const restingAiLens = nav.locator(".is-featured .liquid-lens");
  await expect(restingAiLens).toHaveCount(1);
  await expect(restingAiLens).toHaveAttribute("data-lens-active", "false");
  await expect(restingAiLens).toHaveCSS("background-image", "none");
  await expect(nav.getByRole("button")).toHaveText(["首页", "权益", "AI创作", "积分", "我的"]);

  await page.goto("/?surface=customer&route=ai-progress&scenario=returning-customer&variant=copy");
  const activeAiLens = page.locator(".mini-program-tabs .is-featured .liquid-lens");
  await expect(activeAiLens).toHaveAttribute("data-lens-active", "true");
  await expect(activeAiLens).not.toHaveCSS("background-image", "none");
});

test("points and balance have distinct glyphs without list mascots", async ({ page }) => {
  await page.goto("/?surface=customer&route=points-store&scenario=returning-customer");
  await expect(page.locator('[data-glyph-kind="points"]')).toHaveCount(3);
  await expect(page.locator(".customer-product-list .brand-mascot")).toHaveCount(0);

  await page.goto("/?surface=customer&route=balance&scenario=returning-customer");
  const balanceGlyph = page.locator('[data-glyph-kind="balance"]');
  await expect(balanceGlyph).toHaveCount(1);
  await expect(balanceGlyph.locator(".lucide-droplets")).toHaveCount(1);
  await expect(balanceGlyph.locator(".lucide-ticket-check")).toHaveCount(0);
  const reservoir = balanceGlyph.locator(".reward-glyph__reservoir");
  await expect(reservoir).toBeVisible();
  const waterLevel = reservoir.locator(".reward-glyph__water-level");
  await expect(waterLevel).toHaveCSS("height", "24px");
  await expect(waterLevel).not.toHaveCSS("background-image", "none");
});

test("AI and referral flows expose their own glyph families without row mascots", async ({ page }) => {
  await page.goto("/?surface=customer&route=ai-create&scenario=returning-customer");
  await expect(page.locator('[data-glass-level="acrylic"].customer-ai-composer')).toHaveCount(1);
  await expect(page.locator('.customer-ai-composer [data-glyph-kind="ai"]')).toHaveCount(1);

  await page.goto("/?surface=customer&route=referrals&scenario=returning-customer");
  await expect(page.locator('[data-glyph-kind="referral"]')).toHaveCount(1);
  await expect(page.locator(".customer-referral-record .brand-mascot")).toHaveCount(0);
});

test("entry success empty and poster mascots use Liaoxiaoxing moments", async ({ page }) => {
  await page.goto("/?surface=customer&route=entry-consent&scenario=new-customer");
  await expect(page.locator(".customer-entry-moment .brand-mascot")).toHaveCount(1);

  await page.goto("/?surface=customer&route=entry-unavailable&scenario=new-customer");
  await expect(page.locator(".customer-unavailable-moment .brand-mascot")).toHaveCount(1);

  await page.goto("/?surface=customer&route=coupon-claim&scenario=returning-customer");
  await expect(page.locator(".customer-claim-moment .brand-mascot")).toHaveCount(1);

  await page.goto("/?surface=customer&route=ai-progress&scenario=returning-customer&variant=rejected");
  await expect(page.locator(".customer-ai__progress-moment .brand-mascot")).toHaveCount(1);

  await page.goto("/?surface=customer&route=ai-progress&scenario=returning-customer&variant=fallback");
  await page.getByRole("button", { name: "查看生成结果" }).click();
  await page.getByRole("button", { name: "选这版" }).first().click();
  await expect(page.locator(".customer-ai__poster-moment .brand-mascot")).toHaveCount(1);
});

test("merchant verification has distinct glyphs on one acrylic workbench", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub");
  await expect(page.locator('[data-glass-level="acrylic"].merchant-verify-grid')).toHaveCount(1);
  await expect(page.locator('[data-glyph-kind="store"]')).toHaveCount(2);
  for (const kind of ["balance", "referral", "points"]) {
    await expect(page.locator(`[data-glyph-kind="${kind}"]`)).toHaveCount(1);
  }
});

test("merchant redesign does not widen staff access", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=activities");
  await expect(page.getByRole("heading", { name: "当前角色无法访问" })).toBeVisible();
  await expect(page.getByRole("button", { name: "发布活动" })).toHaveCount(0);
});

test("admin limits glass to navigation and context while tables stay solid", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/?surface=admin&role=super_admin&route=admin-overview");
  await expect(page.locator('.admin-sidebar[data-glass-level="acrylic"]')).toHaveCount(1);
  await expect(page.locator('.admin-search[data-glass-level="acrylic"]')).toHaveCount(1);
  await expect(page.locator('.admin-context-drawer[data-glass-level="lens"]')).toHaveCount(1);
  await page.goto("/?surface=admin&role=super_admin&route=stores");
  await expect(page.locator('.admin-store-table[data-glass-level="solid"]')).toHaveCount(1);
  await expect(page.getByRole("table", { name: "平台门店列表" })).toBeVisible();
});

test("platform read-only stays non-AI and exposes no write action", async ({ page }) => {
  await page.goto("/?surface=admin&role=platform_admin&route=stores");
  await expect(page.getByText("只读运营视图", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "创建门店" })).toHaveCount(0);
  await expect(page.locator(".admin-role.is-readonly")).not.toHaveCSS("background-color", "rgba(0, 194, 255, 0.09)");
});

test("admin glyphs reserve risk for risk surfaces and AI for AI operations", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=risk-center");
  await expect(page.locator('[data-glyph-kind="risk"]')).toHaveCount(1);
  await expect(page.locator('[data-glyph-kind="ai"]')).toHaveCount(0);

  for (const route of ["ai-quota", "ai-failures"]) {
    await page.goto(`/?surface=admin&role=super_admin&route=${route}`);
    await expect(page.locator('[data-glyph-kind="ai"]')).toHaveCount(1);
    await expect(page.locator('[data-glyph-kind="risk"]')).toHaveCount(0);
  }

  await page.goto("/?surface=admin&role=super_admin&route=system-logs");
  await expect(page.locator('[data-glyph-kind="ai"]')).toHaveCount(0);
  await expect(page.locator('[data-glyph-kind="risk"]')).toHaveCount(0);
});

test("fallback glass surfaces keep a visible background, readable ink, and clear focus", async ({ page }) => {
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  const sheet = page.locator(".customer-coupon-sheet");
  const style = await sheet.evaluate((element) => ({
    background: getComputedStyle(element).backgroundImage,
    color: getComputedStyle(element).color,
  }));
  expect(style.background).not.toBe("none");
  expect(style.color).not.toBe("rgba(0, 0, 0, 0)");

  const coupon = sheet.locator(".glass-surface.is-interactive").first();
  await coupon.focus();
  await expect(coupon).toHaveCSS("outline-width", "2px");
  await expect(coupon).toHaveCSS("outline-color", "rgb(255, 75, 27)");
});

test("each surface stays within two large acrylic layers", async ({ page }) => {
  for (const url of [
    "/?surface=customer&route=benefits&scenario=returning-customer",
    "/?surface=merchant&role=staff&route=verify-hub",
    "/?surface=admin&role=super_admin&route=admin-overview",
  ]) {
    await page.goto(url);
    expect(await page.locator('[data-glass-level="acrylic"]').count()).toBeLessThanOrEqual(2);
  }
});

test("reduced motion keeps selected state without trail movement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  await page.getByRole("tab", { name: "推荐券" }).click();
  await expect(page.getByRole("tab", { name: "推荐券" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".spark-trail.is-active")).toHaveCSS("animation-name", "none");
});

test("captures four stable Spark Glass handoff views", async ({ browser }) => {
  const captures = [
    ["/?surface=customer&route=benefits&scenario=returning-customer", "artifacts/screenshots/glass/customer-benefits.png"],
    ["/?surface=customer&route=home&scenario=returning-customer", "artifacts/screenshots/glass/customer-home.png"],
    ["/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub", "artifacts/screenshots/glass/merchant-verification.png"],
    ["/?surface=admin&role=super_admin&route=admin-overview", "artifacts/screenshots/glass/admin-overview.png"],
  ];

  for (const [url, path] of captures) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(url);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: 1440, height: fullHeight });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await captureWithoutBlackTiles(page, path);
    await context.close();
  }
});
