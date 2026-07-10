import { test, expect } from "@playwright/test";

test("switches between all three surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "燎客 AI 三端高保真原型" })).toBeVisible();
  await page.getByRole("button", { name: "商家端" }).click();
  await expect(page.locator('[data-surface="merchant"]')).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("role")).toBe("owner");
  await page.getByRole("button", { name: "平台后台" }).click();
  await expect(page.locator('[data-surface="admin"]')).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("role")).toBe("super_admin");
  await page.getByRole("button", { name: "顾客端" }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("role")).toBe(null);
});

test("keeps the inspector open on desktop and collapses it into a mobile drawer", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/");
  await expect(page.getByText("实时检查器", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 820, height: 800 });
  await expect(page.getByText("原型控制台", { exact: true })).toBeVisible();
  await expect(page.getByText("实时检查器", { exact: true })).toBeHidden();
  await page.getByText("原型控制台", { exact: true }).click();
  await expect(page.getByText("实时检查器", { exact: true })).toBeVisible();
});

test("customer direct URLs strip privileged roles and expose the exact five tabs", async ({ page }) => {
  await page.goto("/?surface=customer&role=super_admin");

  const navigation = page.getByRole("navigation", { name: "燎客 AI主导航" });
  await expect(navigation.getByRole("button")).toHaveText(["首页", "权益", "AI创作", "积分", "我的"]);
  await expect.poll(() => new URL(page.url()).searchParams.get("role")).toBe(null);
});

test("merchant direct URLs expose the exact tabs for every role", async ({ page }) => {
  const variants = [
    { role: "owner", labels: ["经营", "核销", "会员", "运营", "我的"] },
    { role: "manager", labels: ["经营", "核销", "会员", "记录"] },
    { role: "staff", labels: ["核销", "记录", "我的"] },
  ];

  for (const variant of variants) {
    await page.goto(`/?surface=merchant&role=${variant.role}`);
    const navigation = page.getByRole("navigation", { name: "燎客商家主导航" });
    await expect(navigation.getByRole("button")).toHaveText(variant.labels);
    await expect.poll(() => new URL(page.url()).searchParams.get("role")).toBe(variant.role);
  }
});

test("merchant and admin direct URLs normalize invalid roles to surface defaults", async ({ page }) => {
  await page.goto("/?surface=merchant&role=super_admin");
  await expect.poll(() => new URL(page.url()).searchParams.get("role")).toBe("owner");
  await expect(page.getByRole("navigation", { name: "燎客商家主导航" }).getByRole("button"))
    .toHaveText(["经营", "核销", "会员", "运营", "我的"]);

  await page.goto("/?surface=admin&role=owner");
  await expect.poll(() => new URL(page.url()).searchParams.get("role")).toBe("super_admin");
  await expect(page.locator(".admin-role")).toHaveText("超级管理员");
});

test("admin direct URLs render writable and read-only role states", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin");
  await expect(page.locator(".admin-role")).toHaveText("超级管理员");
  await expect(page.locator(".admin-role")).not.toHaveClass(/is-readonly/);

  await page.goto("/?surface=admin&role=platform_admin");
  await expect(page.locator(".admin-role")).toHaveText("只读运营视图");
  await expect(page.locator(".admin-role")).toHaveClass(/is-readonly/);
});

test("decorative shell and read-only states do not use AI Cyan", async ({ page }) => {
  await page.goto("/?surface=admin&role=platform_admin");
  await page.locator(".surface-switcher button").first().focus();

  const colors = await page.evaluate(() => ({
    bodyBackground: getComputedStyle(document.body).backgroundImage,
    focusOutline: getComputedStyle(document.querySelector(".surface-switcher button")).outlineColor,
    readonlyBackground: getComputedStyle(document.querySelector(".admin-role.is-readonly")).backgroundColor,
  }));

  expect(colors.bodyBackground).not.toContain("0, 194, 255");
  expect(colors.focusOutline).not.toBe("rgb(0, 194, 255)");
  expect(colors.readonlyBackground).not.toBe("rgba(0, 194, 255, 0.09)");

  await page.goto("/?surface=customer");
  await expect.poll(() => page.locator(".mini-program-frame__screen").evaluate((element) => getComputedStyle(element).backgroundImage))
    .not.toContain("0, 194, 255");
});
