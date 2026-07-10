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
