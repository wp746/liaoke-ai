# Liaoke Restrained Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all three Liaoke prototype surfaces from flat white-card styling to the approved restrained Spark Glass system without changing business behavior.

**Architecture:** Add a semantic visual layer (`GlassSurface`, `LiquidLens`, `RewardGlyph`, `SparkTrail`, `LiaoxiaoxingMoment`) and prove it on Benefits Center before expanding it. Customer pages use the richest IP expression; merchant and admin pages consume lower-intensity variants. All effects are CSS-first with solid fallbacks; existing Galacean use remains limited to six approved moments.

**Tech Stack:** React 18, Vite 6, CSS custom properties, `backdrop-filter`, Lucide React, existing Liaoxiaoxing assets, Node tests, Playwright 1.61.1.

## Global Constraints

- Preserve exactly 20 customer, 20 merchant, and 16 admin routes.
- Preserve state machines, URL variants, points accounting, verification records, permissions, and navigation labels.
- Ember means action/current state; Reward Gold means reward/growth; AI Cyan remains AI-only; Ash means used/expired/paused/read-only.
- Reduce exploratory Liquid Glass intensity by about 35%; no rainbow glass, blue corporate glass, dark customer UI, or equal-brightness outlines.
- Use at most two large `backdrop-filter` surfaces per viewport; rows do not each create a blur layer.
- Full Liaoxiaoxing art appears only in Hero/onboarding/success/empty/error moments; ordinary lists use glyphs.
- Reduced motion removes spring/trail/particle movement without hiding state.
- Do not modify `miniprogram/`, mock API, server, or native-sync boundaries.
- PR #1 stays Draft until visual comparison and regression pass.

---

### Task 1: Build Shared Spark Glass Primitives

**Files:**
- Create: `src/prototype/components/Glass.jsx`
- Create: `src/prototype/styles/glass.css`
- Create: `tests/unit/glass-system.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Produces `GlassSurface({ as, level, interactive, className, children, ...props })`.
- Produces `LiquidLens({ active, className, children })`.
- Produces `RewardGlyph({ kind, state, value, className })`; kinds are `store|dish|group|drink|balance|points|referral|risk|ai`, states are `active|used|expired|paused`.
- Produces `SparkTrail({ active, className })` and `LiaoxiaoxingMoment({ kind, className, children })`.

- [ ] **Step 1: Write failing contracts**

```js
// tests/unit/glass-system.test.js
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

async function loadGlass() {
  const root = new URL("../..", import.meta.url).pathname;
  const vite = await createServer({ root, configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
  return { vite, module: await vite.ssrLoadModule("/src/prototype/components/Glass.jsx") };
}

test("glass primitives expose semantic material contracts", async () => {
  const { vite, module } = await loadGlass();
  try {
    const html = renderToStaticMarkup(React.createElement(module.GlassSurface, { level: "acrylic", interactive: true }, "权益"));
    assert.match(html, /data-glass-level="acrylic"/);
    assert.match(html, /is-interactive/);
  } finally { await vite.close(); }
});

test("glyphs expose kind and non-color state text", async () => {
  const { vite, module } = await loadGlass();
  try {
    const html = renderToStaticMarkup(React.createElement(module.RewardGlyph, { kind: "group", state: "used", value: "¥12" }));
    assert.match(html, /data-glyph-kind="group"/);
    assert.match(html, /data-glyph-state="used"/);
    assert.match(html, /已使用/);
  } finally { await vite.close(); }
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/unit/glass-system.test.js`  
Expected: FAIL because `Glass.jsx` does not exist.

- [ ] **Step 3: Implement the primitive module**

```jsx
// src/prototype/components/Glass.jsx
import React from "react";
import { Coins, Droplets, Drumstick, Flame, ShieldAlert, Sparkles, TicketCheck, UsersRound } from "lucide-react";
import { BrandMascot } from "./Brand.jsx";

const icons = { store: Flame, dish: Drumstick, group: UsersRound, drink: Droplets, balance: TicketCheck, points: Sparkles, referral: UsersRound, risk: ShieldAlert, ai: Sparkles };

export function GlassSurface({ as: Tag = "section", level = "acrylic", interactive = false, className = "", children, ...props }) {
  return <Tag className={`glass-surface glass-surface--${level}${interactive ? " is-interactive" : ""} ${className}`.trim()} data-glass-level={level} {...props}>{children}</Tag>;
}
export function LiquidLens({ active = false, className = "", children }) {
  return <span className={`liquid-lens${active ? " is-active" : ""} ${className}`.trim()} data-lens-active={active}>{children}</span>;
}
export function RewardGlyph({ kind, state = "active", value, className = "" }) {
  const Icon = icons[kind] ?? Coins;
  const inactive = ["used", "expired", "paused"].includes(state);
  return <span className={`reward-glyph reward-glyph--${kind} reward-glyph--${state} ${className}`.trim()} data-glyph-kind={kind} data-glyph-state={state} aria-label={inactive ? `${value ?? kind}，已使用` : undefined}><Icon aria-hidden="true" size={18} /><strong>{value}</strong><i aria-hidden="true" /></span>;
}
export function SparkTrail({ active = false, className = "" }) { return <span aria-hidden="true" className={`spark-trail${active ? " is-active" : ""} ${className}`.trim()} />; }
export function LiaoxiaoxingMoment({ kind = "coupon", className = "", children }) { return <div className={`liaoxiaoxing-moment liaoxiaoxing-moment--${kind} ${className}`.trim()}><BrandMascot kind={kind} />{children}</div>; }
```

- [ ] **Step 4: Implement tokens, fallback, interaction, and reduced motion**

```css
/* src/prototype/styles/glass.css */
:root {
  --glass-ivory: rgba(255,253,248,.76);
  --glass-solid: rgba(255,253,248,.96);
  --glass-line: rgba(90,55,24,.10);
  --glass-shadow: 0 14px 32px rgba(73,43,18,.10);
  --glass-shadow-hover: 0 22px 44px rgba(73,43,18,.15);
  --glass-spring: 280ms cubic-bezier(.2,.9,.24,1.18);
}
.glass-surface { position: relative; isolation: isolate; border: 1px solid var(--glass-line); background: var(--glass-solid); box-shadow: var(--glass-shadow); }
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .glass-surface--acrylic { border-color: rgba(255,255,255,.64); background: linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,249,239,.62)); backdrop-filter: blur(18px) saturate(1.08); }
  .glass-surface--lens,.liquid-lens { backdrop-filter: blur(24px) saturate(1.15); }
}
.glass-surface.is-interactive { transition: transform var(--glass-spring),box-shadow var(--glass-spring); }
.glass-surface.is-interactive:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow-hover); }
.glass-surface.is-interactive:active { transform: scale(.987); box-shadow: 0 8px 18px rgba(73,43,18,.10); }
.liquid-lens { display: grid; place-items: center; border-radius: inherit; }
.liquid-lens.is-active { background: rgba(255,255,255,.78); box-shadow: inset 0 1px 0 #fff,0 8px 22px rgba(255,104,20,.13); }
.reward-glyph { display: grid; width: 60px; height: 60px; place-items: center; color: var(--ember-600); }
.reward-glyph--store { border-radius: 48% 52% 46% 54%; background: rgba(255,105,29,.16); }
.reward-glyph--dish { border-radius: 48% 42% 52% 38%; background: rgba(255,121,68,.13); }
.reward-glyph--group { border-radius: 46% 54% 56% 44%; background: rgba(116,118,126,.10); }
.reward-glyph--drink { border-radius: 54% 46% 58% 42%; background: rgba(248,184,77,.14); }
.reward-glyph--used,.reward-glyph--expired { color: #8a8b92; filter: saturate(.15); }
.spark-trail { width: 26px; height: 2px; opacity: 0; background: linear-gradient(90deg,transparent,var(--gold-400),transparent); }
.spark-trail.is-active { opacity: 1; animation: spark-trail-glide 280ms ease-out; }
@keyframes spark-trail-glide { from { transform: translateX(-14px) scaleX(.3); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .glass-surface.is-interactive,.spark-trail.is-active { animation: none; transition: none; transform: none; } }
```

- [ ] **Step 5: Import and verify GREEN**

Add `@import "./prototype/styles/glass.css";` after tokens in `src/styles.css`.

Run: `node --test tests/unit/glass-system.test.js && npm run build`  
Expected: tests and build PASS; no new package or initial chunk.

- [ ] **Step 6: Commit**

```bash
git add src/prototype/components/Glass.jsx src/prototype/styles/glass.css src/styles.css tests/unit/glass-system.test.js
git commit -m "feat: add Spark Glass primitives"
```

---

### Task 2: Rebuild Benefits Center as the Reference Screen

**Files:**
- Modify: `src/prototype/customer/BenefitPages.jsx`
- Modify: `src/prototype/styles/customer.css`
- Create: `tests/e2e/glass-redesign.spec.js`
- Create: `artifacts/screenshots/glass/benefits-reference.png`

**Interfaces:**
- Consumes all Task 1 primitives.
- Produces one Liaoxiaoxing Hero moment, one active tab lens, one acrylic coupon sheet, and exact coupon glyph mapping: `01→store`, `02→dish`, used `01→group`, `20→drink`.

- [ ] **Step 1: Write failing reference-screen tests**

```js
// tests/e2e/glass-redesign.spec.js
import { test, expect } from "@playwright/test";
test("benefits uses one sheet and four distinct glyphs", async ({ page }) => {
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  await expect(page.locator(".customer-benefits-hero .brand-mascot")).toHaveCount(1);
  await expect(page.locator('[data-glass-level="acrylic"].customer-coupon-sheet')).toHaveCount(1);
  for (const kind of ["store","dish","group","drink"]) await expect(page.locator(`[data-glyph-kind="${kind}"]`)).toHaveCount(1);
});
test("benefit tabs move the lens and keep content accessible", async ({ page }) => {
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  await page.getByRole("tab", { name: "推荐券" }).click();
  await expect(page.getByRole("tab", { name: "推荐券" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("朋友到店后，推荐券会自动生效")).toBeVisible();
});
```

- [ ] **Step 2: Verify RED**

Run: `npx playwright test tests/e2e/glass-redesign.spec.js`  
Expected: FAIL because the current page has flat cards and no semantic glyphs.

- [ ] **Step 3: Implement exact semantic mapping and grouped markup**

```jsx
import { GlassSurface, LiaoxiaoxingMoment, LiquidLens, RewardGlyph, SparkTrail } from "../components/Glass.jsx";
const couponGlyphKinds = { "CPN-20260710-01":"store", "CPN-20260710-02":"dish", "CPN-20260703-01":"group", "CPN-20260620-01":"drink" };

function CouponRow({ coupon, onOpen }) {
  const usable = coupon.status === "active";
  return <button type="button" className="customer-coupon-row glass-surface is-interactive" onClick={onOpen}>
    <RewardGlyph kind={couponGlyphKinds[coupon.id]} state={usable ? "active" : "used"} value={`¥${coupon.value}`} />
    <span><strong>{coupon.title.replace(/^¥\d+\s*/, "")}</strong><small>{usable ? `有效期至 ${coupon.expiresAt.slice(0,10)}` : "已使用"}</small></span>
    <ChevronRight aria-hidden="true" size={18} />
  </button>;
}
```

Wrap the heading in `<LiaoxiaoxingMoment kind="coupon" className="customer-benefits-hero">`; wrap tabs in one `GlassSurface`; wrap each label in `LiquidLens`; add `SparkTrail`; wrap all coupon rows in one `GlassSurface level="acrylic" className="customer-coupon-sheet"`.

- [ ] **Step 4: Implement the approved restrained density**

```css
.customer-page:has(.customer-benefits-hero) { background: radial-gradient(circle at 76% 5%,rgba(248,184,77,.18),transparent 34%),linear-gradient(180deg,#fffdf8,#faf6ee); }
.customer-benefits-hero { min-height: 96px; padding: 2px; }
.customer-benefits-hero .brand-mascot { position: absolute; top: -6px; right: 4px; width: 74px; height: 82px; transform: none; }
.customer-benefits-hero .customer-page__header { position: relative; z-index: 1; padding-right: 82px; }
.customer-segment { grid-template-columns: repeat(3,1fr); padding: 4px; border-radius: 22px; }
.customer-segment button { position: relative; min-height: 42px; padding: 0; background: transparent; }
.customer-coupon-sheet { display: grid; overflow: hidden; padding: 6px 12px; border-radius: 28px; }
.customer-coupon-row { display: grid; grid-template-columns: 64px 1fr 20px; gap: 13px; align-items: center; min-height: 94px; padding: 14px 4px; border: 0; border-bottom: 1px solid rgba(90,55,24,.10); border-radius: 0; background: transparent; box-shadow: none; color: inherit; text-align: left; }
.customer-coupon-row:last-child { border-bottom: 0; }
.customer-coupon-row strong,.customer-coupon-row small { display: block; }
.customer-coupon-row small { margin-top: 7px; color: var(--ink-600); font-size: 9px; }
```

- [ ] **Step 5: Verify and capture**

Run: `npx playwright test tests/e2e/glass-redesign.spec.js`  
Expected: 2 tests PASS.

Capture after fonts and two animation frames to `artifacts/screenshots/glass/benefits-reference.png`; compare with `docs/superpowers/specs/assets/liaoke-restrained-glass-benefits.png`.

- [ ] **Step 6: Commit**

```bash
git add src/prototype/customer/BenefitPages.jsx src/prototype/styles/customer.css tests/e2e/glass-redesign.spec.js artifacts/screenshots/glass/benefits-reference.png
git commit -m "feat: redesign customer benefits with Spark Glass"
```

---

### Task 3: Extend Spark Glass Across Customer Flows

**Files:**
- Modify: `src/prototype/components/MiniProgramFrame.jsx`
- Modify: `src/prototype/styles/mobile.css`
- Modify: `src/prototype/customer/EntryPages.jsx`
- Modify: `src/prototype/customer/AiPages.jsx`
- Modify: `src/prototype/customer/PointsProfilePages.jsx`
- Modify: `src/prototype/styles/customer.css`
- Modify: `tests/e2e/customer-flows.spec.js`
- Modify: `tests/e2e/glass-redesign.spec.js`

**Interfaces:**
- Consumes Task 1 primitives and Task 2 density.
- Produces a floating acrylic bottom dock and semantic `ai`, `points`, `balance`, and `referral` glyphs.
- Preserves all customer URLs, clipboard/download behavior, points gates, and six Galacean mount kinds.

- [ ] **Step 1: Write failing customer-wide contracts**

```js
test("customer nav is a floating glass dock with one AI lens", async ({ page }) => {
  await page.goto("/?surface=customer&route=home&scenario=returning-customer");
  const nav = page.getByRole("navigation", { name: "燎客 AI主导航" });
  await expect(nav).toHaveClass(/mini-program-tabs--glass/);
  await expect(nav.locator(".is-featured .liquid-lens")).toHaveCount(1);
  await expect(nav.getByRole("button")).toHaveText(["首页","权益","AI创作","积分","我的"]);
});
test("points and balance have distinct glyphs without list mascots", async ({ page }) => {
  await page.goto("/?surface=customer&route=points-store&scenario=returning-customer");
  await expect(page.locator('[data-glyph-kind="points"]')).toHaveCount(3);
  await expect(page.locator(".customer-product-list .brand-mascot")).toHaveCount(0);
  await page.goto("/?surface=customer&route=balance&scenario=returning-customer");
  await expect(page.locator('[data-glyph-kind="balance"]')).toHaveCount(1);
});
```

- [ ] **Step 2: Verify RED**

Run: `npx playwright test tests/e2e/glass-redesign.spec.js --grep "customer nav|points and balance"`  
Expected: FAIL because navigation and object families do not expose the new contracts.

- [ ] **Step 3: Convert the bottom navigation**

```jsx
// MiniProgramFrame.jsx
import { LiquidLens } from "./Glass.jsx";
<nav className="mini-program-tabs mini-program-tabs--glass" aria-label={`${title}主导航`}>
  {tabs.map((tab) => {
    const Icon = tab.icon;
    const active = tab.id === activeRoute;
    return <button type="button" key={tab.id} className={`${active ? "is-active" : ""}${tab.featured ? " is-featured" : ""}`} aria-current={active ? "page" : undefined} onClick={() => onNavigate(tab.id)}>
      <LiquidLens active={active || tab.featured} className="mini-program-tabs__icon">{Icon ? <Icon size={18} /> : tab.label.slice(0,1)}</LiquidLens>
      <span>{tab.label}</span>
    </button>;
  })}
</nav>
```

```css
/* mobile.css */
.mini-program-frame__screen { position: relative; background: radial-gradient(circle at 78% 4%,rgba(248,184,77,.13),transparent 31%),linear-gradient(180deg,#fffdf8,#faf6ee); }
.mini-program-tabs--glass { margin: 0 8px 8px; padding: 7px 8px 8px; border: 1px solid rgba(255,255,255,.72); border-radius: 25px; background: rgba(255,253,248,.76); box-shadow: 0 14px 30px rgba(73,43,18,.13); backdrop-filter: blur(18px); }
.mini-program-tabs--glass button.is-featured .liquid-lens { background: var(--brand-gradient); color: #fff; box-shadow: 0 9px 20px rgba(255,75,27,.22); }
```

- [ ] **Step 4: Apply exact object semantics**

```jsx
// AiPages.jsx composer shell
<GlassSurface level="acrylic" className="customer-ai-composer"><RewardGlyph kind="ai" state="active" />{/* existing inputs and submit action */}</GlassSurface>

// PointsProfilePages.jsx product shell
<GlassSurface as="article" level="solid" interactive className="customer-points-product"><RewardGlyph kind="points" state={availability.enabled ? "active" : "paused"} value={`${product.points}`} />{/* existing stock, limit, and action */}</GlassSurface>

// BenefitPages.jsx balance shell
<GlassSurface level="acrylic" className="customer-balance-vessel"><RewardGlyph kind="balance" state="active" />{/* existing balance and action */}</GlassSurface>
```

Wrap existing entry/success/empty/error mascots in `LiaoxiaoxingMoment`. Do not add mascot images to product, transaction, referral-record, or coupon rows.

- [ ] **Step 5: Verify customer and motion regressions**

Run: `npm test && npx playwright test tests/e2e/customer-flows.spec.js tests/e2e/glass-redesign.spec.js tests/e2e/motion.spec.js`  
Expected: all PASS; Galacean kinds remain `entry,ai,claim,poster,redeem,upgrade`.

- [ ] **Step 6: Commit**

```bash
git add src/prototype/components/MiniProgramFrame.jsx src/prototype/styles/mobile.css src/prototype/customer src/prototype/styles/customer.css tests/e2e/customer-flows.spec.js tests/e2e/glass-redesign.spec.js
git commit -m "feat: extend Spark Glass across customer flows"
```

---

### Task 4: Apply a Lower-Intensity Merchant Variant

**Files:**
- Modify: `src/prototype/merchant/VerificationPages.jsx`
- Modify: `src/prototype/merchant/DashboardPages.jsx`
- Modify: `src/prototype/merchant/MemberPages.jsx`
- Modify: `src/prototype/merchant/OperationsPages.jsx`
- Modify: `src/prototype/styles/merchant.css`
- Modify: `tests/e2e/merchant-flows.spec.js`
- Modify: `tests/e2e/glass-redesign.spec.js`

**Interfaces:**
- Produces verification glyph mapping `coupon→store`, `manual→store`, `balance→balance`, `referral_coupon→referral`, `points_redemption→points`.
- Uses lower blur and no full mascot art in lists/forms.
- Preserves owner/manager/staff gates.

- [ ] **Step 1: Write failing merchant contracts**

```js
test("merchant verification has distinct glyphs on one acrylic workbench", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub");
  await expect(page.locator('[data-glass-level="acrylic"].merchant-verify-grid')).toHaveCount(1);
  await expect(page.locator('[data-glyph-kind="store"]')).toHaveCount(2);
  for (const kind of ["balance","referral","points"]) await expect(page.locator(`[data-glyph-kind="${kind}"]`)).toHaveCount(1);
});
test("merchant redesign does not widen staff access", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=activities");
  await expect(page.getByText("当前角色无权访问此页面")).toBeVisible();
  await expect(page.getByRole("button", { name: "发布活动" })).toHaveCount(0);
});
```

- [ ] **Step 2: Verify RED**

Run: `npx playwright test tests/e2e/glass-redesign.spec.js --grep "merchant"`  
Expected: glyph/workbench test FAIL; permission test PASS.

- [ ] **Step 3: Implement verification glyphs and acrylic group**

```jsx
import { GlassSurface, RewardGlyph } from "../components/Glass.jsx";
const verificationGlyphKinds = { coupon:"store", manual:"store", balance:"balance", referral_coupon:"referral", points_redemption:"points" };
<GlassSurface as="div" level="acrylic" className="merchant-verify-grid">
  {Object.entries(verificationTypes).map(([id,item]) => <button type="button" key={id} className="glass-surface is-interactive" onClick={() => onChoose(id)}><RewardGlyph kind={verificationGlyphKinds[id]} /><strong>{item.label}</strong><span>扫码或输入券码</span></button>)}
</GlassSurface>
```

- [ ] **Step 4: Apply operational material rules**

```css
.merchant-page { background: radial-gradient(circle at 82% 2%,rgba(248,184,77,.10),transparent 28%); }
.merchant-page .glass-surface--acrylic { background: rgba(255,253,248,.82); backdrop-filter: blur(12px); }
.merchant-verify-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; padding: 10px; border-radius: 24px; }
.merchant-verify-grid > button { display: grid; grid-template-columns: 42px 1fr; min-height: 76px; gap: 3px 9px; align-items: center; padding: 10px; border-radius: 18px; background: rgba(255,255,255,.42); text-align: left; }
.merchant-verify-grid .reward-glyph { grid-row: 1 / 3; width: 42px; height: 42px; }
.merchant-metric-card,.merchant-member-list article,.merchant-operations-panel { background: rgba(255,253,248,.88); border-color: rgba(90,55,24,.09); }
```

Use `GlassSurface level="solid"` for metric groups, member groups, forms, and confirmation surfaces.

- [ ] **Step 5: Verify merchant, permission, and overflow tests**

Run: `npx playwright test tests/e2e/merchant-flows.spec.js tests/e2e/glass-redesign.spec.js tests/e2e/shell.spec.js --grep "merchant|staff|overflow"`  
Expected: selected tests PASS; 390×844 has no horizontal overflow.

- [ ] **Step 6: Commit**

```bash
git add src/prototype/merchant src/prototype/styles/merchant.css tests/e2e/merchant-flows.spec.js tests/e2e/glass-redesign.spec.js
git commit -m "feat: refine merchant workbench with Spark Glass"
```

---

### Task 5: Apply Professional Glass Hierarchy to Admin

**Files:**
- Modify: `src/prototype/components/AdminFrame.jsx`
- Modify: `src/prototype/admin/OverviewPages.jsx`
- Modify: `src/prototype/admin/StorePages.jsx`
- Modify: `src/prototype/admin/SystemPages.jsx`
- Modify: `src/prototype/styles/admin.css`
- Modify: `tests/e2e/admin-flows.spec.js`
- Modify: `tests/e2e/glass-redesign.spec.js`

**Interfaces:**
- Acrylic applies only to sidebar, top search, context drawer, filters, and focused risk surfaces.
- Tables remain `data-glass-level="solid"` and high contrast.
- `platform_admin` remains read-only; read-only styling stays Ash, not AI Cyan.

- [ ] **Step 1: Write failing hierarchy and permission tests**

```js
test("admin limits glass to navigation and context while tables stay solid", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=admin-overview");
  await expect(page.locator('.admin-sidebar[data-glass-level="acrylic"]')).toHaveCount(1);
  await expect(page.locator('.admin-context-drawer[data-glass-level="lens"]')).toHaveCount(1);
  await page.goto("/?surface=admin&role=super_admin&route=stores");
  await expect(page.locator('.admin-store-table[data-glass-level="solid"]')).toHaveCount(1);
});
test("platform read-only stays non-AI and exposes no write action", async ({ page }) => {
  await page.goto("/?surface=admin&role=platform_admin&route=stores");
  await expect(page.getByText("只读运营视图")).toBeVisible();
  await expect(page.getByRole("button", { name: "创建门店" })).toHaveCount(0);
  await expect(page.locator(".admin-role.is-readonly")).not.toHaveCSS("background-color", "rgba(0, 194, 255, 0.09)");
});
```

- [ ] **Step 2: Verify RED**

Run: `npx playwright test tests/e2e/glass-redesign.spec.js --grep "admin|platform"`  
Expected: material hierarchy FAIL; permission test PASS.

- [ ] **Step 3: Add semantic materials without changing handlers**

```jsx
// AdminFrame.jsx
<aside className="admin-sidebar glass-surface glass-surface--acrylic" data-glass-level="acrylic">{/* existing brand, nav, status */}</aside>

// OverviewPages.jsx
<GlassSurface as="aside" level="lens" className="admin-panel admin-context-drawer">{/* existing context content */}</GlassSurface>

// StoreTable
<table className="admin-store-table glass-surface--solid" data-glass-level="solid" aria-label="平台门店列表">{/* existing table */}</table>
```

- [ ] **Step 4: Implement restrained admin CSS**

```css
.admin-frame { background: radial-gradient(circle at 88% 0,rgba(248,184,77,.08),transparent 28%),#f6f2ea; }
.admin-sidebar.glass-surface--acrylic { border-width: 0 1px 0 0; border-radius: 0; background: rgba(255,253,248,.82); box-shadow: 10px 0 36px rgba(73,43,18,.08); backdrop-filter: blur(14px); }
.admin-sidebar nav button.is-active { background: linear-gradient(90deg,rgba(255,105,29,.13),rgba(248,184,77,.06)); box-shadow: inset 3px 0 0 var(--ember-600); }
.admin-context-drawer { border-radius: 24px; background: linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,247,233,.62)); }
.admin-panel,.admin-table-wrap { border-color: rgba(90,55,24,.09); background: rgba(255,253,248,.92); box-shadow: 0 12px 28px rgba(73,43,18,.07); }
.admin-store-table { background: #fffdfa; box-shadow: none; }
.admin-role.is-readonly { background: rgba(110,111,118,.10); color: #666870; }
```

Use `RewardGlyph kind="risk"` on risk pages and `kind="ai"` only on AI quota/failure pages.

- [ ] **Step 5: Verify admin and responsive contracts**

Run: `npx playwright test tests/e2e/admin-flows.spec.js tests/e2e/glass-redesign.spec.js tests/e2e/shell.spec.js --grep "admin|platform|sidebar|table"`  
Expected: selected tests PASS; sidebar/table visible at 1366×900; read-only controls absent.

- [ ] **Step 6: Commit**

```bash
git add src/prototype/components/AdminFrame.jsx src/prototype/admin src/prototype/styles/admin.css tests/e2e/admin-flows.spec.js tests/e2e/glass-redesign.spec.js
git commit -m "feat: add professional glass hierarchy to admin"
```

---

### Task 6: Finish Interaction, Accessibility, Performance, and Handoff

**Files:**
- Modify: `src/prototype/styles/glass.css`
- Modify: `src/prototype/styles/motion.css`
- Modify: `tests/unit/glass-system.test.js`
- Modify: `tests/e2e/glass-redesign.spec.js`
- Modify: `tests/e2e/shell.spec.js`
- Modify: `tests/e2e/customer-flows.spec.js`
- Modify: `tests/e2e/merchant-flows.spec.js`
- Modify: `tests/e2e/admin-flows.spec.js`
- Create: `artifacts/screenshots/glass/customer-benefits.png`
- Create: `artifacts/screenshots/glass/customer-home.png`
- Create: `artifacts/screenshots/glass/merchant-verification.png`
- Create: `artifacts/screenshots/glass/admin-overview.png`
- Modify: `docs/prototype/liaoke-three-surface-prototype-guide.md`

**Interfaces:**
- Consumes Tasks 1–5 contracts.
- Produces full fallback/reduced-motion/layer-budget evidence and stable comparison screenshots.

- [ ] **Step 1: Add failing fallback, layer-budget, and reduced-motion tests**

```js
test("glass fallback has opaque readable surfaces", async ({ page }) => {
  await page.goto("/?surface=customer&route=benefits&scenario=returning-customer");
  const style = await page.locator(".customer-coupon-sheet").evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }));
  expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
});
test("each surface stays within two large acrylic layers", async ({ page }) => {
  for (const url of ["/?surface=customer&route=benefits&scenario=returning-customer","/?surface=merchant&role=staff&route=verify-hub","/?surface=admin&role=super_admin&route=admin-overview"]) {
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
```

- [ ] **Step 2: Verify RED**

Run: `npx playwright test tests/e2e/glass-redesign.spec.js --grep "fallback|two large|reduced motion"`  
Expected: at least one test FAIL before final layer and motion rules.

- [ ] **Step 3: Complete focus, fallback, and motion CSS**

```css
.glass-surface.is-interactive:focus-visible,.liquid-lens:focus-visible { outline: 2px solid var(--ember-600); outline-offset: 3px; }
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .glass-surface--acrylic,.glass-surface--lens,.liquid-lens { background: rgba(255,253,248,.96); box-shadow: 0 12px 28px rgba(73,43,18,.11); }
}
@media (prefers-reduced-motion: reduce) {
  .glass-surface.is-interactive:hover,.glass-surface.is-interactive:active,.liquid-lens,.spark-trail { transform: none !important; animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Capture and inspect four stable screenshots**

```js
const captures = [
  ["/?surface=customer&route=benefits&scenario=returning-customer","artifacts/screenshots/glass/customer-benefits.png"],
  ["/?surface=customer&route=home&scenario=returning-customer","artifacts/screenshots/glass/customer-home.png"],
  ["/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub","artifacts/screenshots/glass/merchant-verification.png"],
  ["/?surface=admin&role=super_admin&route=admin-overview","artifacts/screenshots/glass/admin-overview.png"],
];
for (const [url,path] of captures) {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({ path, fullPage: true });
}
```

Open every original PNG. Reject loading frames, black compositor tiles, clipped mascots, text overflow, unreadable glass, or excessive reflection. Compare customer Benefits with `docs/superpowers/specs/assets/liaoke-restrained-glass-benefits.png` at the same crop.

- [ ] **Step 5: Update the guide**

```md
## Spark Glass visual system

The prototype uses restrained Fluent Acrylic structure with Liquid Glass reserved for interactive focus. Liaoxiaoxing contributes flame, spark, trail, soft-arc, and ash glyph language. The UI provides a solid warm-white fallback when backdrop filtering is unavailable and removes spring/trail motion under reduced-motion preferences.
```

- [ ] **Step 6: Run complete verification**

```bash
npm test
npm run test:e2e
npm run verify:all
git diff --check
```

Expected: all unit tests PASS; existing 130 Playwright checks plus new glass checks PASS; API/miniprogram/brand/build verification PASS; only the documented lazy Galacean chunk warning remains.

- [ ] **Step 7: Commit the handoff**

```bash
git add src/prototype/styles/glass.css src/prototype/styles/motion.css tests artifacts/screenshots/glass docs/prototype/liaoke-three-surface-prototype-guide.md
git commit -m "test: verify Spark Glass visual redesign"
```

- [ ] **Step 8: Request whole-branch review and update PR #1**

Review range: `474d7b8..HEAD`. Acceptance: no Critical/Important findings; behavior and permissions unchanged; approved Benefits direction is recognizable; QR and Galacean boundaries remain documented. Push the existing branch and keep PR #1 Draft until final user visual acceptance.

---

## Plan Self-Review Record

- Spec coverage: material hierarchy, intensity limit, Liaoxiaoxing grammar, object differentiation, three-surface variants, interaction, reduced motion, fallback, performance, and screenshots map to Tasks 1–6.
- Placeholder scan: no incomplete marker or unspecified implementation step remains.
- Type consistency: Tasks 2–6 consume the exact Task 1 names and fixed glyph kind/state values.
- Scope check: one shared visual redesign with surface-specific applications; no independent business subsystem is added.
