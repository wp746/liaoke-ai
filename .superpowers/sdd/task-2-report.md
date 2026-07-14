# Task 2 Report: Benefits Center Reference Screen

## Scope

- Modified `src/prototype/customer/BenefitPages.jsx`.
- Modified `src/prototype/styles/customer.css`.
- Created `tests/e2e/glass-redesign.spec.js`.
- Created `artifacts/screenshots/glass/benefits-reference.png`.
- Created this report as requested by the Task 2 dispatch.
- Did not modify the implementation plan or progress ledger.

## RED

Command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js
```

Result: exit code 1, `1 failed`, `1 passed`.

The reference-screen contract failed for the intended missing behavior:

```text
Locator:  locator('.customer-benefits-hero .brand-mascot')
Expected: 1
Received: 0
at tests/e2e/glass-redesign.spec.js:5:71
```

The tab accessibility test already passed against the retained business behavior. The structural/material test failed because the old page had no Liaoxiaoxing Hero, acrylic coupon sheet, or semantic coupon glyph structure. This was a valid RED rather than a setup or syntax error.

## Minimal implementation

- Added the exact fixture-ID glyph mapping:
  - `CPN-20260710-01 -> store`
  - `CPN-20260710-02 -> dish`
  - `CPN-20260703-01 -> group`
  - `CPN-20260620-01 -> drink`
- Reused all Task 1 primitives: `GlassSurface`, `LiaoxiaoxingMoment`, `LiquidLens`, `RewardGlyph`, and `SparkTrail`.
- Kept coupon buttons and `onSelectCoupon` navigation intact.
- Preserved the three tabs, their accessible names, `role="tab"`, `aria-selected`, referral content, and balance behavior.
- Grouped the four coupon rows into one acrylic sheet; rows remain lightweight transparent interactive surfaces rather than adding repeated backdrop blur.
- Applied the restrained density from the plan. Added `position: relative` to the Hero after visual inspection so its absolutely positioned mascot is anchored to the Hero rather than the phone frame.

## GREEN

Command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js
```

Result: exit code 0, `2 passed (1.2s)` in the final capture run.

The first test also performs the required deterministic capture: it sets a `1440x1000` viewport, enables reduced motion, waits for `document.fonts.ready`, waits two `requestAnimationFrame` frames, then writes:

```text
artifacts/screenshots/glass/benefits-reference.png
```

## Regression verification

Command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js tests/e2e/customer-flows.spec.js
```

Result: exit code 0, `21 passed (9.2s)`. This includes coupon selection/detail navigation, referral states, balance-adjacent customer flows, AI flows, and the two new Spark Glass tests.

Command:

```bash
npm test
```

Result: exit code 0, `30` tests passed, `0` failed.

Command:

```bash
npm run build
```

Result: exit code 0; Vite transformed `1607` modules and completed the production build.

## Screenshot inspection

Compared:

- Approved reference: `docs/superpowers/specs/assets/liaoke-restrained-glass-benefits.png`
- Implemented capture: `artifacts/screenshots/glass/benefits-reference.png` (`1440x1065`, RGB PNG)

Visual checks:

- Match: warm ivory canvas with a restrained orange-gold ambient field.
- Match: one Liaoxiaoxing brand moment in the Hero; no repeated mascot in coupon rows.
- Match: one rounded segmented glass control and exactly one visibly active white/orange lens.
- Match: one rounded acrylic coupon sheet containing four divided rows, avoiding card-in-card stacking.
- Match: distinct store/flame, dish, group, and drink semantics; the used group coupon is Ash and remains textually labeled `已使用`.
- Match: real fixture values and dates are preserved rather than copied from the visual reference.
- Intentional difference: the approved reference is a phone-only visual target, while the required artifact captures the full prototype review shell and phone at the established desktop handoff viewport.
- Intentional difference: production glyphs use the maintainable Lucide/CSS primitives approved in Task 1, so they approximate rather than pixel-copy the rendered liquid tokens in the concept image.

## Self-review

- File boundary checked: only the two Task 2 production files, the new E2E, the requested screenshot, and this requested report are changed.
- `git diff --check` reports no whitespace errors.
- Semantic mapping is explicit and deterministic; there is no title-based inference.
- The coupon title cleanup removes only a leading `¥` amount, preserving all business labels.
- Coupon click behavior still routes to the selected coupon code page, verified by customer E2E.
- Tab focus order and accessible names are unchanged; each tab continues to expose `aria-selected`.
- The page uses one large acrylic coupon sheet plus the compact tab surface, staying within the two-large-backdrop-layer constraint.

## Concerns

- Playwright prints the existing `NO_COLOR`/`FORCE_COLOR` environment warning; it does not affect test results.
- Vite prints the existing warning that one generated chunk exceeds 500 kB; Task 2 adds no dependency or runtime and does not address bundle splitting.
- Screenshot comparison is qualitative because the approved visual is explicitly a material/density/brand benchmark rather than a pixel-level specification.
