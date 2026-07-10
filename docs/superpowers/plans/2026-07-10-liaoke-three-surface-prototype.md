# Liaoke Three-Surface Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, interactive React/Vite prototype covering the 20-page customer mini program, 20-page merchant mini program, and 16-page platform admin while preserving the approved Spark OS visual system and role-based behavior.

**Architecture:** Replace the current single-page showcase with a `PrototypeApp` shell that owns surface, route, scenario, and role state. Each surface has a focused page registry and page groups, while shared design-system, fixture, permission, and motion modules keep behavior consistent. The prototype remains frontend-only; deterministic fixtures and scenario transitions simulate the five primary business flows.

**Tech Stack:** React 18.3, Vite 6, Lucide React, CSS custom properties, Node built-in test runner, Playwright 1.61, `@galacean/effects` 2.9.3.

## Global Constraints

- Preserve the existing npm package manager, `package-lock.json`, Vite entry point, brand assets, `miniprogram/` tree, mock API, and unrelated user changes.
- Deliver exactly 56 registered routes: 20 customer, 20 merchant, and 16 platform admin.
- Use the approved B “Spark OS” visual direction: Ivory/Cream surfaces, Ember gradient CTAs, Gold rewards, and AI Cyan only for AI states.
- Customer navigation is exactly `首页 / 权益 / AI创作 / 积分 / 我的`.
- Merchant navigation is role-derived: owner `经营 / 核销 / 会员 / 运营 / 我的`; manager `经营 / 核销 / 会员 / 记录`; staff `核销 / 记录 / 我的`.
- Platform permissions distinguish writable `super_admin` from read-only `platform_admin`.
- Reuse the existing Liaoke logo and 3D LiaoXiaoXing assets under `public/brand/`; do not generate replacement brand art.
- Do not add production APIs, real WeChat login, payment, customer PII, or persistent backend state.
- Do not use customer-facing copy containing `裂变`, `私域`, `获客`, `强制分享`, `提现`, `下线`, or `团队收益`.
- Points exchange copy must only describe gifts or services, never cash deduction.
- Galacean Effects must be lazy-loaded, must respect `prefers-reduced-motion`, and must have a CSS fallback.
- Every task stages and commits only its listed files; never stage `.superpowers/` or unrelated existing changes.

---

## File Structure

```text
src/
├── App.jsx                                  # Thin export of PrototypeApp
├── main.jsx                                 # Existing React entry
├── styles.css                               # Imports focused prototype styles
└── prototype/
    ├── PrototypeApp.jsx                     # Surface/route/scenario/role orchestration
    ├── routeRegistry.js                     # 56 canonical route definitions
    ├── fixtures.js                          # Deterministic realistic product data
    ├── scenarioStore.js                     # Pure scenario state and transitions
    ├── permissions.js                       # Merchant/admin permission derivation
    ├── components/
    │   ├── PrototypeShell.jsx               # Global prototype navigation and inspectors
    │   ├── MiniProgramFrame.jsx             # Shared customer/merchant phone frame
    │   ├── AdminFrame.jsx                   # Platform sidebar/topbar/content shell
    │   ├── Brand.jsx                        # Logo, mascot, bubble, state illustration
    │   ├── Ui.jsx                           # Button, card, tabs, modal, drawer, states
    │   └── Charts.jsx                       # Lightweight SVG/CSS charts
    ├── customer/
    │   ├── CustomerApp.jsx                  # Customer route renderer and tab navigation
    │   ├── EntryPages.jsx                   # Entry, consent, invalid/paused, home, claim
    │   ├── BenefitPages.jsx                 # Rights, coupon code, balance, deduction code
    │   ├── AiPages.jsx                      # Input, progress, selection, poster
    │   └── PointsProfilePages.jsx           # Points, store, product, redeem, referrals, level, me, privacy
    ├── merchant/
    │   ├── MerchantApp.jsx                  # Role-aware merchant route renderer
    │   ├── DashboardPages.jsx               # Login and business dashboard
    │   ├── VerificationPages.jsx            # Five verification modes and results/history
    │   ├── MemberPages.jsx                  # Member list and 360 view
    │   └── OperationsPages.jsx              # Activities, policies, points, employees, store, plan, export
    ├── admin/
    │   ├── AdminApp.jsx                     # Admin route renderer and permission state
    │   ├── OverviewPages.jsx                # Login and platform overview
    │   ├── StorePages.jsx                   # Store list/edit/detail and table-code center
    │   └── SystemPages.jsx                  # Templates, AI, prompts, risk, contracts, exports, accounts, logs
    ├── motion/
    │   ├── GalaceanStage.jsx                # Lazy Player lifecycle and fallback
    │   └── sparkSuccessScene.js              # Local minimal scene object
    └── styles/
        ├── tokens.css                        # Approved design tokens
        ├── shell.css                         # Prototype selector and device shells
        ├── mobile.css                        # Customer/merchant shared layout
        ├── customer.css                      # Customer domain styling
        ├── merchant.css                      # Merchant domain styling
        ├── admin.css                         # Platform desktop styling
        └── motion.css                        # CSS fallback and reduced motion
tests/
├── unit/
│   ├── routeRegistry.test.js                # Exact route counts and uniqueness
│   ├── permissions.test.js                  # Role navigation/write isolation
│   └── scenarioStore.test.js                # Deterministic business transitions
└── e2e/
    ├── shell.spec.js                         # Surface/route/scenario switcher
    ├── customer-flows.spec.js                # Entry, AI, referral, points
    ├── merchant-flows.spec.js                # Verification and role behavior
    └── admin-flows.spec.js                   # Read/write state and store drilldown
playwright.config.js                          # Local Vite webServer and artifact settings
```

## Task 1: Lock the Route Contract and Test Harness

**Files:**
- Create: `src/prototype/routeRegistry.js`
- Create: `tests/unit/routeRegistry.test.js`
- Create: `playwright.config.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `SURFACES`, `ROUTES`, `getRoutesForSurface(surface)`, `getRoute(surface, routeId)`.
- `ROUTES` entries are `{ id: string, surface: 'customer'|'merchant'|'admin', title: string, group: string, roles?: string[] }`.

- [ ] **Step 1: Add test scripts without changing existing verification scripts**

Modify `package.json` scripts to include:

```json
"test": "node --test tests/unit/*.test.js",
"test:e2e": "playwright test",
"test:e2e:update": "playwright test --update-snapshots"
```

Run:

```bash
npm install @galacean/effects@2.9.3
npm install --save-dev @playwright/test@1.61.1
```

Expected: `package.json` and `package-lock.json` record version `2.9.3`; existing dependencies remain.

- [ ] **Step 2: Write the failing route contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { ROUTES, getRoutesForSurface } from "../../src/prototype/routeRegistry.js";

test("registers exactly 20 customer, 20 merchant, and 16 admin routes", () => {
  assert.equal(getRoutesForSurface("customer").length, 20);
  assert.equal(getRoutesForSurface("merchant").length, 20);
  assert.equal(getRoutesForSurface("admin").length, 16);
  assert.equal(ROUTES.length, 56);
});

test("route ids are unique inside each surface", () => {
  for (const surface of ["customer", "merchant", "admin"]) {
    const ids = getRoutesForSurface(surface).map((route) => route.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});
```

- [ ] **Step 3: Run the test and verify the missing module failure**

Run: `npm test`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/prototype/routeRegistry.js`.

- [ ] **Step 4: Implement the complete route registry**

Use these exact ids:

```js
export const SURFACES = ["customer", "merchant", "admin"];

const customer = [
  "entry-consent", "entry-unavailable", "home", "coupon-claim", "benefits",
  "coupon-code", "ai-create", "ai-progress", "ai-select", "poster-preview",
  "balance", "deduction-code", "points", "points-store", "points-product",
  "points-redemption", "referrals", "member-level", "me", "privacy-data",
];
const merchant = [
  "merchant-login", "merchant-dashboard", "verify-hub", "verify-scan", "verify-manual",
  "verify-confirm", "verify-result", "verify-history", "members", "member-detail",
  "activities", "activity-editor", "benefit-policy", "points-products", "points-product-editor",
  "points-rules", "employees", "store-settings", "merchant-plan", "merchant-export",
];
const admin = [
  "admin-login", "admin-overview", "stores", "store-editor", "store-detail", "table-codes",
  "benefit-templates", "ai-quota", "ai-failures", "prompt-versions", "keywords",
  "risk-center", "contracts", "export-audit", "platform-accounts", "system-logs",
];

const titles = {
  "entry-consent": "登录与协议", "entry-unavailable": "门店不可用", home: "首页",
  "coupon-claim": "领取权益", benefits: "权益中心", "coupon-code": "券码详情",
  "ai-create": "AI 创作", "ai-progress": "AI 生成中", "ai-select": "选择效果",
  "poster-preview": "海报预览", balance: "返现余额", "deduction-code": "余额抵扣码",
  points: "我的积分", "points-store": "积分商城", "points-product": "商品详情",
  "points-redemption": "兑换码", referrals: "邀请记录", "member-level": "等级权益",
  me: "我的", "privacy-data": "隐私与数据权利",
  "merchant-login": "商家登录", "merchant-dashboard": "今日经营", "verify-hub": "核销工作台",
  "verify-scan": "扫码核销", "verify-manual": "手动核销", "verify-confirm": "核销确认",
  "verify-result": "核销结果", "verify-history": "核销记录", members: "会员列表",
  "member-detail": "会员 360°详情", activities: "活动列表", "activity-editor": "活动编辑",
  "benefit-policy": "返现与推荐策略", "points-products": "积分商品", "points-product-editor": "积分商品编辑",
  "points-rules": "积分规则", employees: "员工与权限", "store-settings": "门店设置",
  "merchant-plan": "套餐与续费", "merchant-export": "导出与商家账号",
  "admin-login": "后台登录", "admin-overview": "平台总览", stores: "门店列表",
  "store-editor": "创建与编辑门店", "store-detail": "门店 360°详情", "table-codes": "桌码中心",
  "benefit-templates": "权益预设模板", "ai-quota": "AI 配额", "ai-failures": "AI 失败任务",
  "prompt-versions": "提示词版本", keywords: "关键词与禁用词", "risk-center": "风险中心",
  contracts: "合同套餐与续费", "export-audit": "数据导出与审计", "platform-accounts": "平台账号",
  "system-logs": "管理日志与系统任务",
};

function definitions(surface, ids) {
  return ids.map((id) => ({ id, surface, title: titles[id], group: id.split("-")[0] }));
}

export const ROUTES = [
  ...definitions("customer", customer),
  ...definitions("merchant", merchant),
  ...definitions("admin", admin),
];
export const getRoutesForSurface = (surface) => ROUTES.filter((route) => route.surface === surface);
export const getRoute = (surface, routeId) => ROUTES.find((route) => route.surface === surface && route.id === routeId);
```

Add `assert.ok(ROUTES.every((route) => route.title))` to the route contract test so no route can ship without a Chinese title.

- [ ] **Step 5: Add Playwright configuration**

```js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "artifacts/playwright",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: { command: "npm run dev -- --port 4173", url: "http://127.0.0.1:4173", reuseExistingServer: true },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test`

Expected: PASS, 2 tests.

```bash
git add package.json package-lock.json playwright.config.js src/prototype/routeRegistry.js tests/unit/routeRegistry.test.js
git commit -m "test: lock prototype route contract"
```

## Task 2: Build Scenario State and Role Permissions

**Files:**
- Create: `src/prototype/scenarioStore.js`
- Create: `src/prototype/permissions.js`
- Create: `src/prototype/fixtures.js`
- Create: `tests/unit/scenarioStore.test.js`
- Create: `tests/unit/permissions.test.js`

**Interfaces:**
- Produces: `createScenarioState(scenarioId)`, `transition(state, event)`, `SCENARIOS`.
- Produces: `merchantTabs(role)`, `canMerchant(role, action)`, `canAdmin(role, action)`.
- Produces deterministic `fixtures.store`, `fixtures.customer`, `fixtures.coupons`, `fixtures.pointsProducts`, `fixtures.members`, and `fixtures.riskEvents`.

- [ ] **Step 1: Write failing permission tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { merchantTabs, canMerchant, canAdmin } from "../../src/prototype/permissions.js";

test("staff sees only verification, history, and account", () => {
  assert.deepEqual(merchantTabs("staff").map((tab) => tab.id), ["verify-hub", "verify-history", "merchant-export"]);
  assert.equal(canMerchant("staff", "points:write"), false);
});

test("platform admin is read-only while super admin can write", () => {
  assert.equal(canAdmin("platform_admin", "store:update"), false);
  assert.equal(canAdmin("super_admin", "store:update"), true);
});
```

- [ ] **Step 2: Write failing scenario transitions**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createScenarioState, transition } from "../../src/prototype/scenarioStore.js";

test("new customer flow claims a coupon and unlocks it in benefits", () => {
  const start = createScenarioState("new-customer");
  const consented = transition(start, { type: "ACCEPT_CONSENT" });
  const claimed = transition(consented, { type: "CLAIM_COUPON" });
  assert.equal(claimed.customer.consentAccepted, true);
  assert.equal(claimed.coupons[0].status, "active");
});

test("points redemption reduces points and emits an active code", () => {
  const start = createScenarioState("returning-customer");
  const redeemed = transition(start, { type: "REDEEM_POINTS", productId: "drink-suanmei" });
  assert.equal(redeemed.points.balance, start.points.balance - 500);
  assert.equal(redeemed.points.redemptions[0].status, "active");
});
```

- [ ] **Step 3: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because both modules are missing.

- [ ] **Step 4: Implement permission maps**

```js
const merchantNavigation = {
  owner: ["merchant-dashboard", "verify-hub", "members", "activities", "merchant-export"],
  manager: ["merchant-dashboard", "verify-hub", "members", "verify-history"],
  staff: ["verify-hub", "verify-history", "merchant-export"],
};
const merchantActions = {
  owner: new Set(["verify", "members:read", "activity:write", "points:write", "employee:write", "store:update", "export"]),
  manager: new Set(["verify", "members:read"]),
  staff: new Set(["verify"]),
};
export const merchantTabs = (role) => merchantNavigation[role].map((id) => ({ id }));
export const canMerchant = (role, action) => merchantActions[role]?.has(action) ?? false;
export const canAdmin = (role, action) => role === "super_admin" || (role === "platform_admin" && action.endsWith(":read"));
```

- [ ] **Step 5: Implement immutable scenario transitions and fixtures**

`transition` must clone only changed branches and support these exact events:

```js
export const EVENTS = [
  "ACCEPT_CONSENT", "CLAIM_COUPON", "START_AI", "COMPLETE_AI",
  "CREATE_REFERRAL_COUPON", "ACTIVATE_REFERRAL_COUPON", "REDEEM_POINTS",
  "VERIFY_CODE", "PAUSE_STORE", "RESUME_STORE", "SET_ROLE",
];
```

Fixtures use `牛里牛气潮汕牛肉火锅`, customer `林小满`, 1,250 points, ¥24.80 balance, and the v3.1 products `酸梅汤一杯` (500 points), `招牌凉菜一份` (800), `优先排队一次` (2,000).

Implement transitions with this switch shape; each branch returns a new root and new changed branch:

```js
export function transition(state, event) {
  switch (event.type) {
    case "ACCEPT_CONSENT":
      return { ...state, customer: { ...state.customer, consentAccepted: true } };
    case "CLAIM_COUPON":
      return { ...state, coupons: state.coupons.map((coupon, index) => index === 0 ? { ...coupon, status: "active" } : coupon) };
    case "START_AI":
      return { ...state, ai: { ...state.ai, status: "processing", stage: "copy" } };
    case "COMPLETE_AI":
      return { ...state, ai: { ...state.ai, status: event.fallback ? "fallback" : "done", stage: "poster" } };
    case "CREATE_REFERRAL_COUPON":
      return { ...state, referralCoupons: [{ id: "RC-20260710-01", status: "pending", value: 10 }, ...state.referralCoupons] };
    case "ACTIVATE_REFERRAL_COUPON":
      return { ...state, referralCoupons: state.referralCoupons.map((coupon) => coupon.id === event.couponId ? { ...coupon, status: "active" } : coupon) };
    case "REDEEM_POINTS": { 
      const product = fixtures.pointsProducts.find((item) => item.id === event.productId);
      if (!product || state.points.balance < product.points) return { ...state, lastError: "POINTS_INSUFFICIENT" };
      const redemption = { id: "PNT-20260710-01", code: "AB7X3K2Q", productId: product.id, status: "active" };
      return { ...state, points: { ...state.points, balance: state.points.balance - product.points, redemptions: [redemption, ...state.points.redemptions] } };
    }
    case "VERIFY_CODE":
      return { ...state, verification: { ...state.verification, status: event.result ?? "success", code: event.code } };
    case "PAUSE_STORE":
      return { ...state, store: { ...state.store, paused: true } };
    case "RESUME_STORE":
      return { ...state, store: { ...state.store, paused: false } };
    case "SET_ROLE":
      return { ...state, role: event.role };
    default:
      return state;
  }
}
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test`

Expected: PASS, 6 total tests.

```bash
git add src/prototype/scenarioStore.js src/prototype/permissions.js src/prototype/fixtures.js tests/unit/scenarioStore.test.js tests/unit/permissions.test.js
git commit -m "feat: add prototype scenarios and permissions"
```

## Task 3: Create the Spark OS Design System and Prototype Shell

**Files:**
- Create: `src/prototype/PrototypeApp.jsx`
- Create: `src/prototype/components/PrototypeShell.jsx`
- Create: `src/prototype/components/MiniProgramFrame.jsx`
- Create: `src/prototype/components/AdminFrame.jsx`
- Create: `src/prototype/components/Brand.jsx`
- Create: `src/prototype/components/Ui.jsx`
- Create: `src/prototype/components/Charts.jsx`
- Create: `src/prototype/styles/tokens.css`
- Create: `src/prototype/styles/shell.css`
- Create: `src/prototype/styles/mobile.css`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `index.html`
- Create: `tests/e2e/shell.spec.js`

**Interfaces:**
- `PrototypeShell({ surface, routeId, scenarioId, role, routes, onSurfaceChange, onRouteChange, onScenarioChange, onRoleChange, children })`.
- `MiniProgramFrame({ title, tabs, activeRoute, onNavigate, children })`.
- `AdminFrame({ role, activeRoute, onNavigate, children })`.

- [ ] **Step 1: Write a failing shell test**

```js
import { test, expect } from "@playwright/test";

test("switches between all three surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "燎客 AI 三端高保真原型" })).toBeVisible();
  await page.getByRole("button", { name: "商家端" }).click();
  await expect(page.locator('[data-surface="merchant"]')).toBeVisible();
  await page.getByRole("button", { name: "平台后台" }).click();
  await expect(page.locator('[data-surface="admin"]')).toBeVisible();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx playwright test tests/e2e/shell.spec.js`

Expected: FAIL because the current showcase has no surface controls.

- [ ] **Step 3: Implement exact approved design tokens**

```css
:root {
  --ember-600:#ff4b1b; --ember-500:#ff6b1a; --gold-400:#f8b84d;
  --cream-100:#fff8ec; --ivory:#f7f6f3; --ink-900:#1f1f23;
  --ink-600:#5f6068; --line:#e8e1d5; --ai-cyan:#00c2ff;
  --brand-gradient:linear-gradient(135deg,#ff4b1b 0%,#ff8a12 52%,#f9c845 100%);
  --radius-button:999px; --radius-card:24px; --radius-panel:32px;
  --shadow-soft:0 18px 56px rgba(88,55,24,.08);
  --font-zh:"PingFang SC","Microsoft YaHei","Source Han Sans SC",system-ui,sans-serif;
}
```

- [ ] **Step 4: Build the shell and thin app entry**

`src/App.jsx` becomes:

```jsx
export { default } from "./prototype/PrototypeApp.jsx";
```

`PrototypeApp` initializes `surface="customer"`, `routeId="home"`, `scenarioId="returning-customer"`, and `role="owner"`; it renders the inspector on desktop and collapses it into a drawer below 900 px.

- [ ] **Step 5: Build reusable UI primitives**

Export exact components:

```jsx
export function PrimaryButton({ children, ...props }) { return <button className="ui-primary" {...props}>{children}</button>; }
export function SurfaceCard({ children, tone="plain" }) { return <section className={`ui-card ui-card--${tone}`}>{children}</section>; }
export function StatusPill({ status, children }) { return <span className={`status-pill status-pill--${status}`}>{children}</span>; }
export function EmptyState({ image, title, body, action }) { return <div className="empty-state"><img src={image} alt=""/><h3>{title}</h3><p>{body}</p>{action}</div>; }
```

- [ ] **Step 6: Update metadata and run shell test**

Set `index.html` title to `燎客 AI · 三端高保真原型` and description to `餐饮门店桌边 AI 增长系统交互原型`.

Run: `npx playwright test tests/e2e/shell.spec.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add index.html src/App.jsx src/styles.css src/prototype/PrototypeApp.jsx src/prototype/components src/prototype/styles tests/e2e/shell.spec.js
git commit -m "feat: create spark os prototype shell"
```

## Task 4: Implement Customer Entry, Home, and Benefits

**Files:**
- Create: `src/prototype/customer/CustomerApp.jsx`
- Create: `src/prototype/customer/EntryPages.jsx`
- Create: `src/prototype/customer/BenefitPages.jsx`
- Create: `src/prototype/styles/customer.css`
- Create: `tests/e2e/customer-flows.spec.js`

**Interfaces:**
- `CustomerApp({ routeId, state, dispatch, onNavigate })`.
- Produces page components for `entry-consent`, `entry-unavailable`, `home`, `coupon-claim`, `benefits`, `coupon-code`, `balance`, `deduction-code`.

- [ ] **Step 1: Write the failing entry and claim flow**

```js
test("new customer accepts consent and claims the daily benefit", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=new-customer&route=entry-consent");
  await page.getByRole("button", { name: "同意并继续" }).click();
  await expect(page.getByText("欢迎落座")).toBeVisible();
  await page.getByRole("button", { name: "领取 ¥10 今日到店券" }).click();
  await expect(page.getByText("福利已放进权益中心")).toBeVisible();
  await page.getByRole("button", { name: "查看权益" }).click();
  await expect(page.getByRole("heading", { name: "权益中心" })).toBeVisible();
});
```

- [ ] **Step 2: Implement route mapping and exact bottom navigation**

```jsx
const tabs = [
  { id:"home", label:"首页" }, { id:"benefits", label:"权益" },
  { id:"ai-create", label:"AI创作", featured:true }, { id:"points", label:"积分" },
  { id:"me", label:"我的" },
];
```

- [ ] **Step 3: Implement home and entry states**

Home must show `牛里牛气 · A12桌`, welcome mascot asset, claim CTA, AI creation card, `4 张可用权益`, `1,250 积分`, and the copy `先领福利，再把这一顿拍成大片。`.

Unavailable page supports `invalid-code`, `inactive-store`, and `paused-store` variants with the existing `liaoxiaoxing-empty-error.png` asset.

- [ ] **Step 4: Implement the rights hierarchy**

Benefits tabs are exactly `到店券 / 推荐券 / 返现余额`; referral coupons show `待生效 / 可使用 / 已使用 / 已过期`. Coupon and deduction-code dialogs show QR placeholders, eight-character codes, expiration, store name, and usage limits.

- [ ] **Step 5: Run flow and unit tests**

Run: `npm test && npx playwright test tests/e2e/customer-flows.spec.js --grep "new customer"`

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/prototype/customer/CustomerApp.jsx src/prototype/customer/EntryPages.jsx src/prototype/customer/BenefitPages.jsx src/prototype/styles/customer.css tests/e2e/customer-flows.spec.js
git commit -m "feat: build customer entry and benefits"
```

## Task 5: Implement the Customer AI Creation Flow

**Files:**
- Create: `src/prototype/customer/AiPages.jsx`
- Modify: `src/prototype/customer/CustomerApp.jsx`
- Modify: `tests/e2e/customer-flows.spec.js`

**Interfaces:**
- Produces `ai-create`, `ai-progress`, `ai-select`, `poster-preview`.
- Dispatches `START_AI` and `COMPLETE_AI`.

- [ ] **Step 1: Add the failing AI flow**

```js
test("creates and saves a referral poster", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=ai-create");
  await page.getByLabel("今天的真实感受").fill("吊龙很嫩，朋友聚餐很舒服");
  await page.getByRole("button", { name: "生成我的海报" }).click();
  await expect(page.getByText("燎小星正在点亮这张照片")).toBeVisible();
  await page.getByRole("button", { name: "查看生成结果" }).click();
  await page.getByRole("button", { name: "选这版" }).first().click();
  await expect(page.getByRole("heading", { name: "海报已生成" })).toBeVisible();
  await expect(page.getByText("专属推荐码")).toBeVisible();
});
```

- [ ] **Step 2: Implement input and progress states**

Input supports 1–3 images, a 50-character feeling field, and styles `烟火食刻 / 质感大片 / 漫画趣味 / 简约清新`. Progress supports `copy`, `image`, `fallback`, and `rejected` state views.

- [ ] **Step 3: Implement result selection and poster preview**

Provide three exact copy candidates, one selected style, the existing poster mascot, store lockup, referral QR placeholder, and `保存海报 / 复制文案 / 再生成一次` actions. Do not render forced-sharing copy.

- [ ] **Step 4: Run and commit**

Run: `npx playwright test tests/e2e/customer-flows.spec.js --grep "referral poster"`

Expected: PASS.

```bash
git add src/prototype/customer/AiPages.jsx src/prototype/customer/CustomerApp.jsx tests/e2e/customer-flows.spec.js
git commit -m "feat: build customer ai creation flow"
```

## Task 6: Implement Customer Points, Referrals, Level, and Account

**Files:**
- Create: `src/prototype/customer/PointsProfilePages.jsx`
- Modify: `src/prototype/customer/CustomerApp.jsx`
- Modify: `tests/e2e/customer-flows.spec.js`

**Interfaces:**
- Produces `points`, `points-store`, `points-product`, `points-redemption`, `referrals`, `member-level`, `me`, `privacy-data`.
- Dispatches `REDEEM_POINTS`.

- [ ] **Step 1: Add the failing points redemption test**

```js
test("redeems a points gift and opens its code", async ({ page }) => {
  await page.goto("/?surface=customer&scenario=returning-customer&route=points-store");
  await page.getByRole("button", { name: "查看酸梅汤一杯" }).click();
  await page.getByRole("button", { name: "立即兑换" }).click();
  await page.getByRole("button", { name: "确认消耗 500 积分" }).click();
  await expect(page.getByText("兑换成功")).toBeVisible();
  await expect(page.getByText("AB7X3K2Q")).toBeVisible();
});
```

- [ ] **Step 2: Implement points and store pages**

Show 1,250 points, +5 daily sign-in, transaction history, categories `热门 / 饮品 / 小菜 / 小吃 / 服务`, stock, monthly limit, and insufficient-points disabled states.

- [ ] **Step 3: Implement profile pages**

Member level shows Lv2 熟客, 1,280/2,000 growth, unlocked rights, and next-level progress. Referrals show bound, first-consumption, pending-coupon, active-coupon, and completed statuses. Privacy page contains query, export, delete, withdraw-consent, and account-cancellation entries.

- [ ] **Step 4: Run route coverage and flow tests**

Run: `npm test && npx playwright test tests/e2e/customer-flows.spec.js`

Expected: all customer routes render; both flows pass.

- [ ] **Step 5: Commit**

```bash
git add src/prototype/customer/PointsProfilePages.jsx src/prototype/customer/CustomerApp.jsx tests/e2e/customer-flows.spec.js
git commit -m "feat: complete customer points and profile"
```

## Task 7: Implement Merchant Role Shell and Dashboard

**Files:**
- Create: `src/prototype/merchant/MerchantApp.jsx`
- Create: `src/prototype/merchant/DashboardPages.jsx`
- Create: `src/prototype/styles/merchant.css`
- Create: `tests/e2e/merchant-flows.spec.js`

**Interfaces:**
- `MerchantApp({ routeId, role, state, dispatch, onNavigate })` consumes `merchantTabs` and `canMerchant`.
- Produces `merchant-login` and `merchant-dashboard`.

- [ ] **Step 1: Write the failing role navigation test**

```js
test("staff lands on verification and cannot see owner operations", async ({ page }) => {
  await page.goto("/?surface=merchant&role=staff&route=verify-hub");
  await expect(page.getByRole("navigation")).toContainText("核销");
  await expect(page.getByRole("navigation")).not.toContainText("运营");
  await expect(page.getByRole("link", { name: "积分规则" })).toHaveCount(0);
});
```

- [ ] **Step 2: Implement role-aware shell and login**

Owner, manager, and staff role chips are switchable from the prototype inspector. Changing to staff navigates to `verify-hub`; inaccessible direct routes render a permission state rather than the target page.

- [ ] **Step 3: Implement owner/manager dashboard**

Show the six PRD metrics, 7/30-day trend control, store pause state, rights-cost warning, one LiaoXiaoXing business suggestion, and recent verification list. The main `扫一扫` action navigates to `verify-scan`.

- [ ] **Step 4: Run and commit**

Run: `npx playwright test tests/e2e/merchant-flows.spec.js --grep "staff"`

Expected: PASS.

```bash
git add src/prototype/merchant/MerchantApp.jsx src/prototype/merchant/DashboardPages.jsx src/prototype/styles/merchant.css tests/e2e/merchant-flows.spec.js
git commit -m "feat: add merchant role workbench"
```

## Task 8: Implement Five Verification Modes and Member Views

**Files:**
- Create: `src/prototype/merchant/VerificationPages.jsx`
- Create: `src/prototype/merchant/MemberPages.jsx`
- Modify: `src/prototype/merchant/MerchantApp.jsx`
- Modify: `tests/e2e/merchant-flows.spec.js`

**Interfaces:**
- Produces `verify-hub`, `verify-scan`, `verify-manual`, `verify-confirm`, `verify-result`, `verify-history`, `members`, `member-detail`.
- Verification types are `coupon`, `manual`, `balance`, `referral_coupon`, `points_redemption`.

- [ ] **Step 1: Add failing points verification flow**

```js
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
```

- [ ] **Step 2: Implement verification state machine views**

Each type must render scan/manual input, confirmation, processing, success, duplicate, wrong-store, pending, minimum-spend, and timeout-query states. All successful records show verifier name and timestamp.

- [ ] **Step 3: Implement members and 360 view**

Member list filters by level, recent visit, and referral count; search accepts nickname or masked phone suffix. Detail shows basic profile, growth, spending, AI use, active rights, points, and referral-coupon history.

- [ ] **Step 4: Run and commit**

Run: `npx playwright test tests/e2e/merchant-flows.spec.js`

Expected: role and points-verification tests pass.

```bash
git add src/prototype/merchant/VerificationPages.jsx src/prototype/merchant/MemberPages.jsx src/prototype/merchant/MerchantApp.jsx tests/e2e/merchant-flows.spec.js
git commit -m "feat: build merchant verification and members"
```

## Task 9: Complete Merchant Operations and Configuration

**Files:**
- Create: `src/prototype/merchant/OperationsPages.jsx`
- Modify: `src/prototype/merchant/MerchantApp.jsx`
- Modify: `tests/e2e/merchant-flows.spec.js`

**Interfaces:**
- Produces `activities`, `activity-editor`, `benefit-policy`, `points-products`, `points-product-editor`, `points-rules`, `employees`, `store-settings`, `merchant-plan`, `merchant-export`.

- [ ] **Step 1: Add owner/manager permission test**

```js
test("only owner can publish points rules", async ({ page }) => {
  await page.goto("/?surface=merchant&role=manager&route=points-rules");
  await expect(page.getByText("老板权限才能修改积分规则")).toBeVisible();
  await page.goto("/?surface=merchant&role=owner&route=points-rules");
  await expect(page.getByRole("button", { name: "保存积分规则" })).toBeEnabled();
});
```

- [ ] **Step 2: Implement activity and benefit-policy pages**

Activities use the four PRD templates. Benefit policy exposes cashback 3–15%, referral coupon ¥5–20, validity 30/45/60 days, monthly limit 1–20, new-customer value 0–30, and cost alert default 12%.

- [ ] **Step 3: Implement points, employees, store, plan, and export**

Points rules expose defaults 10/5/50/100/200 and expiry 365 days. Product editor uses image, category, points, stock, monthly limit, and active state. Store settings include pause/resume. Export shows queued, processing, ready, and failed jobs.

- [ ] **Step 4: Run and commit**

Run: `npx playwright test tests/e2e/merchant-flows.spec.js`

Expected: all merchant tests pass.

```bash
git add src/prototype/merchant/OperationsPages.jsx src/prototype/merchant/MerchantApp.jsx tests/e2e/merchant-flows.spec.js
git commit -m "feat: complete merchant operations"
```

## Task 10: Implement Platform Command Center and Store Drilldown

**Files:**
- Create: `src/prototype/admin/AdminApp.jsx`
- Create: `src/prototype/admin/OverviewPages.jsx`
- Create: `src/prototype/admin/StorePages.jsx`
- Create: `src/prototype/styles/admin.css`
- Create: `tests/e2e/admin-flows.spec.js`

**Interfaces:**
- `AdminApp({ routeId, role, state, dispatch, onNavigate })` consumes `canAdmin`.
- Produces `admin-login`, `admin-overview`, `stores`, `store-editor`, `store-detail`, `table-codes`.

- [ ] **Step 1: Write failing read/write and drilldown tests**

```js
test("platform admin is read-only", async ({ page }) => {
  await page.goto("/?surface=admin&role=platform_admin&route=stores");
  await expect(page.getByText("只读运营视图")).toBeVisible();
  await expect(page.getByRole("button", { name: "创建门店" })).toHaveCount(0);
});

test("super admin drills into a store", async ({ page }) => {
  await page.goto("/?surface=admin&role=super_admin&route=admin-overview");
  await page.getByRole("button", { name: "查看牛里牛气" }).click();
  await expect(page.getByRole("heading", { name: "牛里牛气潮汕牛肉火锅" })).toBeVisible();
});
```

- [ ] **Step 2: Implement the approved command-center shell**

Use left module navigation, global search, platform KPIs, 30-day trend, risk queue, store table, and contextual drawer. Tablet widths collapse the sidebar to icon rail.

- [ ] **Step 3: Implement store and table-code pages**

Store editor includes identity, type, table IP, average spend, package, status, and brand assets. Table-code center supports batch generation, selected download, and deactivate confirmation. Read-only role can view but cannot mutate.

- [ ] **Step 4: Run and commit**

Run: `npx playwright test tests/e2e/admin-flows.spec.js`

Expected: both tests pass.

```bash
git add src/prototype/admin/AdminApp.jsx src/prototype/admin/OverviewPages.jsx src/prototype/admin/StorePages.jsx src/prototype/styles/admin.css tests/e2e/admin-flows.spec.js
git commit -m "feat: build platform command center"
```

## Task 11: Complete Platform Templates, AI, Risk, Commercial, and Audit Pages

**Files:**
- Create: `src/prototype/admin/SystemPages.jsx`
- Modify: `src/prototype/admin/AdminApp.jsx`
- Modify: `tests/e2e/admin-flows.spec.js`

**Interfaces:**
- Produces `benefit-templates`, `ai-quota`, `ai-failures`, `prompt-versions`, `keywords`, `risk-center`, `contracts`, `export-audit`, `platform-accounts`, `system-logs`.

- [ ] **Step 1: Add failing permission and risk-flow tests**

```js
test("super admin opens an AI failure while read-only admin cannot retry", async ({ page }) => {
  await page.goto("/?surface=admin&role=platform_admin&route=ai-failures");
  await page.getByRole("button", { name: "查看任务 AI-20260710-038" }).click();
  await expect(page.getByText("通义万相超时，已降级为文案海报")).toBeVisible();
  await expect(page.getByRole("button", { name: "重新执行" })).toHaveCount(0);
});
```

- [ ] **Step 2: Implement configuration pages**

Benefit templates expose default coupon, cashback, referral, and points presets. AI quota shows used/budget/cost by store. Prompt versions show draft, active, retired, copy, store keywords, and forbidden terms.

- [ ] **Step 3: Implement risk, contracts, exports, accounts, and logs**

Risk center includes self-verification, frequency spike, amount anomaly, AI over-budget, and failed scheduled task. Contracts show package, dates, renewal status, owner, and amount. Logs show actor, role, store, operation, result, and timestamp.

- [ ] **Step 4: Run and commit**

Run: `npx playwright test tests/e2e/admin-flows.spec.js`

Expected: all admin tests pass.

```bash
git add src/prototype/admin/SystemPages.jsx src/prototype/admin/AdminApp.jsx tests/e2e/admin-flows.spec.js
git commit -m "feat: complete platform operations"
```

## Task 12: Add Lazy Galacean Effects and Motion Fallback

**Files:**
- Create: `src/prototype/motion/GalaceanStage.jsx`
- Create: `src/prototype/motion/sparkSuccessScene.js`
- Create: `src/prototype/styles/motion.css`
- Modify: `src/prototype/components/Brand.jsx`
- Modify: customer success/progress page files

**Interfaces:**
- `GalaceanStage({ kind: 'entry'|'ai'|'claim'|'upgrade'|'redeem'|'poster', active=true, className='' })`.
- CSS fallback class is `.spark-fallback[data-kind="..."]`.

- [ ] **Step 1: Implement a local scene object with no remote assets**

```js
const colors = [
  [1, 0.294, 0.106, 1], [1, 0.42, 0.102, 1], [0.973, 0.722, 0.302, 1],
  [1, 0.541, 0.071, 1], [1, 0.78, 0.22, 1], [1, 0.35, 0.08, 1],
];
const positions = [[-2,-1,0],[-1,1,0],[0,-2,0],[1,1,0],[2,-1,0],[0,2,0]];
const items = colors.map((color, index) => ({
  id: String(index + 1), name: `spark-${index + 1}`, type: "1", visible: true,
  duration: 1.5, delay: index * 0.04, endBehavior: 0, renderLevel: "B+",
  content: {
    options: { startColor: color },
    positionOverLifetime: { direction: [0, 0, 0], startSpeed: 0, gravity: [0, 0, 0] },
    sizeOverLifetime: { size: [6, [[0, 0, 0, 2], [0.3, 1.4, 2, -1], [1, 0, -1, 0]]] },
    colorOverLifetime: { opacity: [6, [[0, 0, 0, 3], [0.2, 1, 0, 0], [1, 0, 0, 0]]] },
  },
  transform: { position: positions[index], rotation: [0, 0, 0], scale: [1, 1, 1] },
}));

export const sparkSuccessScene = {
  compositionId: "1", requires: [], images: [], bins: [], textures: [], shapes: [], plugins: [],
  version: "1.5", type: "mars",
  compositions: [{
    id: "1", name: "liaoke-spark-success", duration: 1.5, startTime: 0, endBehavior: 0,
    previewSize: [512, 512], items,
    camera: { fov: 60, far: 20, near: 0.1, clipMode: 1, position: [0, 0, 8], rotation: [0, 0, 0] },
  }],
};
```

- [ ] **Step 2: Implement lazy player lifecycle**

```jsx
useEffect(() => {
  if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let player;
  let cancelled = false;
  import("@galacean/effects").then(async ({ Player }) => {
    if (cancelled || !ref.current) return;
    player = new Player({ container: ref.current });
    await player.loadScene(sparkSuccessScene, { autoplay: true });
  }).catch(() => setFallback(true));
  return () => { cancelled = true; player?.dispose(); };
}, [active, kind]);
```

- [ ] **Step 3: Add fallback and reduced-motion CSS**

Fallback uses six pseudo/child sparks with opacity and transform only. Under `prefers-reduced-motion: reduce`, animation duration becomes `1ms` and the final static glow remains visible.

- [ ] **Step 4: Wire only approved high-value nodes**

Use stages on entry light-up, AI progress, claim success, member upgrade, points redemption, and poster completion. Verify no stage is mounted in list, table, verification confirmation, or admin settings pages.

- [ ] **Step 5: Build and commit**

Run: `npm run build`

Expected: successful Vite production build; Galacean emitted as a lazy chunk, not the initial application chunk.

```bash
git add src/prototype/motion src/prototype/styles/motion.css src/prototype/components/Brand.jsx src/prototype/customer
git commit -m "feat: add spark effects with safe fallback"
```

## Task 13: Validate All Routes, Primary Flows, Accessibility, and Screenshots

**Files:**
- Modify: `tests/e2e/shell.spec.js`
- Modify: `tests/e2e/customer-flows.spec.js`
- Modify: `tests/e2e/merchant-flows.spec.js`
- Modify: `tests/e2e/admin-flows.spec.js`
- Modify: `scripts/validate-miniprogram.js` only if it incorrectly scans the React prototype; otherwise leave untouched.
- Create: `artifacts/screenshots/prototype/` through Playwright output commands.

**Interfaces:**
- Every route must expose `[data-route-id="<id>"]` and one visible `h1`, `h2`, or `h3`.
- Primary actions must use accessible names from the spec.

- [ ] **Step 1: Add exact 56-route render coverage**

```js
for (const route of ROUTES) {
  test(`renders ${route.surface}/${route.id}`, async ({ page }) => {
    await page.goto(`/?surface=${route.surface}&route=${route.id}`);
    await expect(page.locator(`[data-route-id="${route.id}"]`)).toBeVisible();
    await expect(page.locator("h1,h2,h3").first()).toBeVisible();
  });
}
```

- [ ] **Step 2: Add remaining primary-flow coverage**

Cover these paths end-to-end:

1. Scan/consent/claim.
2. AI creation/poster/referral.
3. Customer points redemption.
4. Merchant points verification.
5. Platform store drilldown and read-only isolation.

- [ ] **Step 3: Add responsive and reduced-motion checks**

At 390×844, customer and merchant frames must have no horizontal overflow. At 1366×900, admin sidebar and store table must both be visible. With reduced motion, `[data-galacean-active="true"]` must not exist and `.spark-fallback` must remain visible.

- [ ] **Step 4: Capture handoff screenshots**

Capture these exact files:

```text
artifacts/screenshots/prototype/customer-home.png
artifacts/screenshots/prototype/customer-benefits.png
artifacts/screenshots/prototype/customer-ai-poster.png
artifacts/screenshots/prototype/customer-points-store.png
artifacts/screenshots/prototype/merchant-dashboard.png
artifacts/screenshots/prototype/merchant-verification.png
artifacts/screenshots/prototype/admin-overview.png
artifacts/screenshots/prototype/admin-store-detail.png
```

- [ ] **Step 5: Run the full verification suite**

Run:

```bash
npm test
npm run test:e2e
npm run verify:all
git diff --check
```

Expected: all unit and Playwright tests pass; existing API/miniprogram/brand validation and Vite build pass; no whitespace errors.

- [ ] **Step 6: Inspect the eight screenshots**

Verify correct mascot cropping, no text overflow, no dead controls, no dark full-screen customer UI, no forced-sharing copy, readable table columns, and consistent Ember/Gold/Cyan use. Fix only observed issues and rerun the affected screenshot test.

- [ ] **Step 7: Commit final integration**

```bash
git add tests/e2e artifacts/screenshots/prototype
git commit -m "test: verify liaoke three-surface prototype"
```

## Task 14: Document the Prototype Handoff

**Files:**
- Modify: `README.md`
- Create: `docs/prototype/liaoke-three-surface-prototype-guide.md`

**Interfaces:**
- Documents local start, surface/route/scenario query parameters, role switching, test commands, screenshot paths, and the later native-mini-program sync boundary.

- [ ] **Step 1: Add exact local commands**

Document:

```bash
npm install
npm run dev
npm test
npm run test:e2e
npm run verify:all
```

- [ ] **Step 2: Document direct-link examples**

Include:

```text
/?surface=customer&scenario=new-customer&route=entry-consent
/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub
/?surface=admin&role=platform_admin&route=admin-overview
```

- [ ] **Step 3: State the implementation boundary**

The guide must explicitly say this deliverable is the approved interactive review prototype. Native customer/merchant synchronization into `miniprogram/` is the next implementation phase after the user signs off the React prototype; it is not silently mixed into this phase.

- [ ] **Step 4: Run verification and commit**

Run: `npm run verify:all`

Expected: PASS.

```bash
git add README.md docs/prototype/liaoke-three-surface-prototype-guide.md
git commit -m "docs: add three-surface prototype guide"
```

## Final Self-Review Checklist

- [ ] Route registry exposes 20 customer, 20 merchant, and 16 admin pages with human-readable Chinese titles.
- [ ] Every spec page maps to a task and a route component.
- [ ] Customer, merchant, and admin navigation match the approved visual choices.
- [ ] Merchant and admin permissions are enforced in both navigation and direct-route rendering.
- [ ] All five primary flows have Playwright coverage.
- [ ] Galacean runtime is lazy, local-only, disposable, and safely degradable.
- [ ] No customer-facing banned words appear.
- [ ] Existing `miniprogram/`, mock API, and unrelated worktree files remain unchanged.
- [ ] All commands and expected outputs in this plan are executable without unstated files or services.
