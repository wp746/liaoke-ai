# Task 4 Report: Lower-Intensity Merchant Spark Glass

## Scope

- Applied the shared `GlassSurface` and `RewardGlyph` primitives to merchant pages only.
- Preserved the existing 20 merchant routes, owner/manager/staff permission gates, verification state flow, and operating actions.
- Kept merchant rendering operational: one 12px acrylic verification workbench; metric, member, form, confirmation, activity, employee, history, and account groups use solid surfaces.
- Kept full mascot art out of lists and forms. The existing dashboard operating suggestion remains the sole in-page brand moment.

## TDD Evidence

### RED 1: workbench and permission contracts

Command:

```sh
npx playwright test tests/e2e/glass-redesign.spec.js --grep "merchant"
```

Result before implementation:

- `merchant verification has distinct glyphs on one acrylic workbench`: FAIL, acrylic workbench count was `0`.
- `merchant redesign does not widen staff access`: PASS.

The permission assertion uses the existing heading `当前角色无法访问`, because the brief's alternate copy belongs to `MerchantApp.jsx`, which is outside Task 4's implementation file boundary.

### RED 2: operational material contracts

Command:

```sh
npx playwright test tests/e2e/merchant-flows.spec.js --grep "verification modes render|operational groups"
```

Result before implementation: 2 FAIL. The verification workbench had no acrylic semantic level, and merchant metric/operational groups had no solid semantic level.

A follow-up RED also proved that activity and employee groups were not yet solid before those groups were converted.

### GREEN

Focused merchant material contracts: 4/4 PASS. Follow-up operational group contract: 1/1 PASS.

## Implementation

- Verification mapping: `coupon -> store`, `manual -> store`, `balance -> balance`, `referral_coupon -> referral`, `points_redemption -> points`.
- Verification hub: one acrylic `GlassSurface` containing five lightweight interactive rows.
- Merchant blur: 12px for acrylic; solid operational groups do not add backdrop blur.
- Dashboard metrics, trend/status, recent verification, member list/detail, verification forms/confirmation/history, activity/editor, employee forms, points/settings, plan, and export surfaces use semantic solid groups.
- Activity rows and member rows use one solid group with dividers instead of nested blurred cards.

## Verification

```sh
npx playwright test tests/e2e/merchant-flows.spec.js tests/e2e/glass-redesign.spec.js tests/e2e/shell.spec.js --grep "merchant|staff|overflow"
```

Result: 51/51 PASS, including all 20 merchant route renders, owner/manager/staff permission checks, verification and operating flows, and merchant 390x844 horizontal overflow.

```sh
npm test
```

Result: 31/31 PASS, including exact `20 customer / 20 merchant / 16 admin` route counts and permission/state contracts.

```sh
npm run build
```

Result: PASS. Vite emitted the existing informational chunk-size warning.

The E2E handoff test rewrote two existing merchant screenshots while running; both screenshot files were restored and Playwright output artifacts were removed before commit.
