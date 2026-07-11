# Task 3 Report: Extend Spark Glass Across Customer Flows

## Status

DONE_WITH_CONCERNS

## Scope

- Modified `src/prototype/components/MiniProgramFrame.jsx`.
- Modified `src/prototype/styles/mobile.css`.
- Modified `src/prototype/customer/EntryPages.jsx`.
- Modified `src/prototype/customer/AiPages.jsx`.
- Modified `src/prototype/customer/PointsProfilePages.jsx`.
- Modified `src/prototype/customer/BenefitPages.jsx`.
- Modified `src/prototype/styles/customer.css`.
- Modified `tests/e2e/glass-redesign.spec.js`.
- Replaced this Task 3 report.
- Did not modify the implementation plan, progress ledger, `customer-flows.spec.js`, native mini-program, API, server, fixtures, route registry, motion runtime, or packages.

`BenefitPages.jsx` is treated as an explicit Task 3 file because Step 4 names its Balance shell and Step 1 requires the balance glyph contract. The dispatch owner confirmed that the omission from the top-level file list is a plan-list clerical gap, not scope expansion.

## RED Evidence

### Customer dock and points/balance object families

Command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "customer nav|points and balance"
```

Exact result: exit code 1, `2 failed`.

- `customer nav is a floating glass dock with one AI lens` received class `mini-program-tabs` instead of the required `mini-program-tabs--glass`.
- `points and balance have distinct glyphs without list mascots` found `0` points glyphs instead of `3`.

### AI and referral object families

Command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "AI and referral"
```

Exact result: exit code 1, `1 failed`. The AI route contained `0` acrylic `.customer-ai-composer` surfaces instead of `1`.

### Liaoxiaoxing moment wrapping

Command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "entry success empty"
```

Exact result: exit code 1, `1 failed`. The entry route contained `0` `.customer-entry-moment .brand-mascot` matches instead of `1`.

All RED runs failed on missing requested behavior, not syntax, startup, fixture, or locator errors.

## Minimal Implementation

- Converted the five-item customer bottom navigation into a floating warm acrylic dock while preserving the labels, route IDs, button handlers, and `aria-current` state.
- Reused `LiquidLens` for every nav icon and retained the single featured AI orb; the active/featured state drives the existing semantic lens contract.
- Added opaque warm fallback styling before the supported `backdrop-filter` enhancement and included both prefixed and unprefixed filters.
- Grouped the existing AI upload, feeling, style, and submit controls inside one acrylic composer with one Cyan `ai` glyph; no input limits, draft state, or submit behavior changed.
- Rebuilt the three points-store product rows as solid interactive `GlassSurface` articles with `points` glyphs. Paused state follows the existing availability gate, while stock, monthly limit, balance gate, selection, and navigation handlers remain unchanged.
- Added one Gold `referral` glyph to the referral summary vessel and kept referral-record rows mascot-free.
- Rebuilt the balance action shell as one acrylic vessel with one `balance` glyph and the original deduction-code handler.
- Wrapped the existing entry, unavailable, coupon-claim, AI progress/error, and poster mascots in `LiaoxiaoxingMoment`; no full mascot was added to product, transaction, referral-record, or coupon rows.

## GREEN Evidence

Focused object-family command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "customer nav|points and balance|AI and referral"
```

Exact result: exit code 0, `3 passed`.

Focused mascot command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "entry success empty"
```

Exact result: exit code 0, `1 passed`.

Fresh final brief command:

```bash
npm test && npx playwright test tests/e2e/customer-flows.spec.js tests/e2e/glass-redesign.spec.js tests/e2e/motion.spec.js
```

Exact result: exit code 0.

- Node tests: `30` passed, `0` failed.
- Playwright: `30` passed, `0` failed in `9.9s`.
- Route registry contract: exactly `20` customer, `20` merchant, and `16` admin routes.
- Motion source contract: the approved customer mount kinds remain exactly `entry`, `ai`, `claim`, `poster`, `redeem`, and `upgrade`.
- Customer regression coverage includes both eligible redemptions, monthly-limit and insufficient-points gates, coupon selection, all customer route content, privacy confirmation, AI direct variants, 1-3 upload enforcement, actual SVG download, and clipboard resolve/reject behavior.
- `git diff --check`: exit code 0 with no output.

## Visual Self-Review

- Inspected home, Benefits, points store, AI composer/poster, balance, referrals, and entry at the established `1440x1000` review viewport.
- Re-captured entry, balance, and points store serially after `document.fonts.ready` plus two animation frames under reduced motion; no loading frames, black compositor tiles, clipped mascot, unreadable ink, or horizontal overflow remained.
- The bottom dock reads as a separate floating acrylic object with a single orange AI orb; labels remain `首页 / 权益 / AI创作 / 积分 / 我的`.
- AI Cyan is limited to the AI composer/glyph and existing AI controls. Points and referral use Reward Gold; paused points use Ash; balance remains Ember/action-oriented.
- Product and referral rows use lightweight solid surfaces and no repeated mascot art.
- Routes with a large acrylic content vessel use the dock plus at most one large content blur. Benefits retains its Task 2 large coupon sheet plus compact segmented control; the segmented control is not a large viewport layer.
- Reduced-motion screenshots preserve all selected/disabled/status information and the static AI orb.

## Behavior Self-Review

- Navigation retains the same five buttons, route callbacks, active route semantics, and accessible navigation name.
- AI file input, 50-character draft, four styles, generation transitions, save/download, and clipboard branches are unchanged.
- Points availability is still computed by stock, monthly limit, and balance in the original order; the glyph state only reflects the resulting gate.
- Balance still navigates to `deduction-code`; no balance amount or verification behavior changed.
- Referral records remain informational and expose no self-service issuance/share control.
- Ordinary product, coupon, transaction, and referral rows contain no `.brand-mascot`.

## Concerns

- The existing Playwright `NO_COLOR` / `FORCE_COLOR` warning remains and does not affect results.
- The screenshot tests rewrite tracked handoff PNGs and create `artifacts/playwright/`; all such generated changes were restored/removed after verification because Task 3 does not own those artifacts.
- Parallel screenshot capture briefly produced black compositor regions in generated review PNGs. Stable serial captures after fonts and two animation frames were clean; no screenshot artifact is included in this commit.
- `customer-flows.spec.js` did not need modification: it already contained the required clipboard, download, points-gate, URL, and customer-flow regression coverage. New visual/semantic contracts live in `glass-redesign.spec.js`.

## Review Fixes

### Findings addressed

1. Replaced the balance object's inherited `TicketCheck` rendering with a dedicated liquid-reservoir composition: a Lucide `Droplets` cue, a rounded storage vessel, and a visible 24px orange-gold water level. The balance page contains no ticket glyph or ticket silhouette.
2. Split the featured AI orb into two visual states. Non-AI routes retain a restrained warm-white featured marker with a shallow shadow; `ai-create`, `ai-progress`, `ai-select`, and completed `poster-preview` routes activate the orange-gold gradient and stronger glow.
3. Made the E2E contracts inspect rendered visual evidence, not only semantic data: the balance test requires the `Droplets` SVG, forbids `TicketCheck`, requires a visible reservoir and gradient water level, while the dock test verifies both `data-lens-active` and computed `background-image` across home and AI routes.

### Review RED evidence

Command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "customer nav|points and balance"
```

Exact result before the fix: exit code 1, `2 failed`.

- Home AI lens received `data-lens-active="true"` instead of `false`.
- Balance contained `0` `.lucide-droplets` elements instead of `1`.

After the state prop was corrected, a stronger CSS-level contract was added and run separately:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "customer nav"
```

Exact result: exit code 1, `1 failed`. The resting home orb still computed to the full orange-gold `linear-gradient(...)` instead of `background-image: none`, proving the unconditional featured CSS remained too strong.

### Review GREEN evidence

Focused command:

```bash
npx playwright test tests/e2e/glass-redesign.spec.js --grep "customer nav|points and balance"
```

Exact result: exit code 0, `2 passed`.

Fresh final brief command after the CSS state split:

```bash
npm test && npx playwright test tests/e2e/customer-flows.spec.js tests/e2e/glass-redesign.spec.js tests/e2e/motion.spec.js
```

Exact result: exit code 0; Node `30 passed, 0 failed`; Playwright `30 passed, 0 failed (9.6s)`.

### Review visual and behavior self-check

- Stable serial captures after fonts and two animation frames show the home AI orb as a quiet warm-white marker and the AI progress orb as the stronger orange-gold state.
- The balance glyph reads as a filled reservoir with a liquid droplet cue; it no longer resembles a coupon, ticket, or verification slip.
- Balance amount, deduction-code navigation, AI navigation, all five dock labels, focus order, points gates, clipboard/download branches, 20 customer routes, and the six approved Galacean mount kinds remain unchanged and covered by the final command.
- Test-generated tracked screenshots and `artifacts/playwright/` were restored/removed after the final run; no artifact file is part of the review-fix commit.

## Review Fixes — Shared Primitive Ownership

### Finding addressed

Moved the balance reservoir from the page-local `BalanceGlyph` into the shared `RewardGlyph` implementation. `RewardGlyph kind="balance"` now owns the `Droplets` cue, reservoir, and water-level markup; `BenefitPages.jsx` is declarative again and the page-specific reservoir CSS was removed. This closes the contradictory shared `TicketCheck` mapping and restores the component boundary required by design spec section 9.

### RED evidence

Before production changes, the new unit contract rendering `RewardGlyph kind="balance"` failed because the shared primitive produced `TicketCheck` and contained neither `.reward-glyph__reservoir` nor `.reward-glyph__water-level`.

### GREEN evidence

Fresh command run by the primary agent after taking over the interrupted worker turn:

```bash
node --test tests/unit/glass-system.test.js && npx playwright test tests/e2e/glass-redesign.spec.js --grep "customer nav|points and balance" && npm test && npx playwright test tests/e2e/customer-flows.spec.js tests/e2e/glass-redesign.spec.js tests/e2e/motion.spec.js && git diff --check
```

Exact result: exit code 0; focused glass unit `5 passed`; focused E2E `2 passed`; complete unit suite `31 passed`; complete customer/glass/motion E2E suite `30 passed`; diff check clean. Test-generated tracked screenshots and `artifacts/playwright/` were restored/removed after the run.
