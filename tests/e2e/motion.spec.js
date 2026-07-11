import { expect, test } from "@playwright/test";

test("loads the local Galacean scene when motion is enabled", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-progress&variant=copy");

  const stage = page.locator('.galacean-stage[data-kind="ai"]');
  await expect(stage).toHaveAttribute("data-motion-mode", "ready");
  await expect(stage.locator("canvas")).toHaveCount(1);
});

test("reduced motion keeps a static fallback and never requests Galacean", async ({ page }) => {
  const galaceanRequests = [];
  page.on("request", (request) => {
    if (/galacean.*effects/i.test(request.url())) galaceanRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-progress&variant=copy");

  const stage = page.locator('.galacean-stage[data-kind="ai"]');
  await expect(stage).toHaveAttribute("data-motion-mode", "reduced");
  await expect(stage.locator(".spark-fallback i")).toHaveCount(6);
  await expect(stage.locator("canvas")).toHaveCount(0);
  expect(galaceanRequests).toEqual([]);
});

test("a Galacean import failure activates the CSS fallback", async ({ page }) => {
  await page.route(/galacean.*effects/i, (route) => route.abort("failed"));
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-progress&variant=copy");

  const stage = page.locator('.galacean-stage[data-kind="ai"]');
  await expect(stage).toHaveAttribute("data-motion-mode", "fallback");
  await expect(stage.locator(".spark-fallback i")).toHaveCount(6);
  await expect(page.getByText("正在理解你的真实感受")).toBeVisible();
});

test("lists, verification confirmation, and admin settings mount no motion stage", async ({ page }) => {
  const routes = [
    "/?surface=customer&scenario=returning-customer&route=benefits",
    "/?surface=customer&scenario=returning-customer&route=points-store",
    "/?surface=merchant&scenario=returning-customer&role=staff&route=verify-confirm",
    "/?surface=admin&scenario=returning-customer&role=super_admin&route=system-logs",
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator(".galacean-stage")).toHaveCount(0);
  }
});

test("member upgrade motion mounts only for an explicit just-upgraded state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?surface=customer&scenario=returning-customer&route=member-level");
  await expect(page.locator(".galacean-stage")).toHaveCount(0);

  await page.goto("/?surface=customer&scenario=returning-customer&route=member-level&variant=just-upgraded");
  const stage = page.locator('.galacean-stage[data-kind="upgrade"]');
  await expect(stage).toHaveCount(1);
  await expect(stage).toHaveAttribute("data-motion-mode", "reduced");
});
