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
