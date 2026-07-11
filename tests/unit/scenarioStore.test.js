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

test("repeated eligible redemptions create distinct coherent transactions", () => {
  const start = { ...createScenarioState("returning-customer"), points: { balance: 2000, redemptions: [] } };
  const first = transition(start, { type: "REDEEM_POINTS", productId: "drink-suanmei" });
  const second = transition(first, { type: "REDEEM_POINTS", productId: "drink-suanmei" });
  assert.equal(second.points.balance, 1000);
  assert.deepEqual(second.points.redemptions.map(({ id, code }) => [id, code]), [
    ["PNT-20260710-02", "AB7X3K2R"],
    ["PNT-20260710-01", "AB7X3K2Q"],
  ]);
});

test("points redemption rejects monthly-limit, sold-out, and insufficient states", () => {
  const start = createScenarioState("returning-customer");
  const prior = (count) => Array.from({ length: count }, (_, index) => ({
    id: `OLD-${index}`, productId: "drink-suanmei", status: "active", code: `CODE-${index}`,
  }));
  const limited = transition({ ...start, points: { balance: 5000, redemptions: prior(2) } }, { type: "REDEEM_POINTS", productId: "drink-suanmei" });
  const soldOut = transition({ ...start, points: { balance: 50000, redemptions: prior(99) } }, { type: "REDEEM_POINTS", productId: "drink-suanmei" });
  const insufficient = transition({ ...start, points: { balance: 10, redemptions: [] } }, { type: "REDEEM_POINTS", productId: "drink-suanmei" });
  assert.equal(limited.lastError, "POINTS_MONTHLY_LIMIT");
  assert.equal(soldOut.lastError, "POINTS_SOLD_OUT");
  assert.equal(insufficient.lastError, "POINTS_INSUFFICIENT");
  assert.equal(limited.points.balance, 5000);
  assert.equal(soldOut.points.redemptions.length, 99);
});

test("AI generation advances from copy to image before completing", () => {
  const start = createScenarioState("returning-customer");
  const copy = transition(start, { type: "START_AI", outcome: "done" });
  const image = transition(copy, { type: "ADVANCE_AI" });
  const done = transition(image, { type: "COMPLETE_AI" });

  assert.deepEqual(copy.ai, { status: "processing", stage: "copy", outcome: "done" });
  assert.deepEqual(image.ai, { status: "processing", stage: "image", outcome: "done" });
  assert.deepEqual(done.ai, { status: "done", stage: "select", outcome: "done" });
});

test("AI generation exposes upstream fallback and rejection outcomes", () => {
  const start = createScenarioState("returning-customer");
  const fallbackCopy = transition(start, { type: "START_AI", outcome: "fallback" });
  const fallbackImage = transition(fallbackCopy, { type: "ADVANCE_AI" });
  const fallback = transition(fallbackImage, { type: "COMPLETE_AI" });
  const rejected = transition(start, { type: "START_AI", outcome: "rejected" });

  assert.deepEqual(fallback.ai, { status: "fallback", stage: "fallback", outcome: "fallback" });
  assert.deepEqual(rejected.ai, { status: "rejected", stage: "rejected", outcome: "rejected" });
});
