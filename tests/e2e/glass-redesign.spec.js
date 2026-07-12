import { test, expect } from "@playwright/test";

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
