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

test("AI direct-link variants hydrate coherent scenario state", () => {
  const start = createScenarioState("returning-customer");
  const expected = {
    copy: { status: "processing", stage: "copy", outcome: "done" },
    image: { status: "processing", stage: "image", outcome: "done" },
    fallback: { status: "fallback", stage: "fallback", outcome: "fallback" },
    rejected: { status: "rejected", stage: "rejected", outcome: "rejected" },
  };
  for (const [variant, ai] of Object.entries(expected)) {
    assert.deepEqual(transition(start, { type: "HYDRATE_AI_VARIANT", variant }).ai, ai);
  }
});

test("merchant operation drafts validate ranges and persist published settings", () => {
  const start = createScenarioState("returning-customer");
  const rejected = transition(start, { type: "UPDATE_BENEFIT_POLICY", actorRole: "owner", field: "cashbackRate", value: 16 });
  assert.equal(rejected.operations.benefitPolicy.cashbackRate, 8);
  assert.match(rejected.operations.feedback, /3%–15%/);
  const valid = transition(rejected, { type: "UPDATE_BENEFIT_POLICY", actorRole: "owner", field: "cashbackRate", value: 15 });
  assert.equal(valid.operations.benefitPolicy.cashbackRate, 8);
  assert.equal(valid.operations.benefitPolicyDraft.cashbackRate, 15);
  const reset = transition(valid, { type: "RESET_BENEFIT_POLICY_DRAFT", actorRole: "owner" });
  assert.equal(reset.operations.benefitPolicyDraft.cashbackRate, 8);
  const editedAgain = transition(reset, { type: "UPDATE_BENEFIT_POLICY", actorRole: "owner", field: "cashbackRate", value: 15 });
  const saved = transition(editedAgain, { type: "SAVE_BENEFIT_POLICY", actorRole: "owner" });
  assert.equal(saved.operations.benefitPolicy.cashbackRate, 15);
  assert.equal(saved.operations.feedback, "权益策略已保存");
  const drafted = transition(saved, { type: "UPDATE_ACTIVITY_DRAFT", actorRole: "owner", field: "templateId", value: "weekday" });
  const published = transition(drafted, { type: "PUBLISH_ACTIVITY", actorRole: "owner" });
  assert.equal(published.operations.activities[0].templateId, "weekday");
  assert.equal(published.operations.feedback, "活动已发布");
});

test("points settings and products reject invalid values and persist valid saves", () => {
  const start = createScenarioState("returning-customer");
  const rejected = transition(start, { type: "UPDATE_POINTS_RULE", actorRole: "owner", field: "spend", value: -1 });
  assert.equal(rejected.operations.pointsRules.spend, 10);
  assert.match(rejected.operations.feedback, /不能小于 0/);
  const updated = transition(rejected, { type: "UPDATE_POINTS_RULE", actorRole: "owner", field: "birthday", value: 250 });
  assert.equal(updated.operations.pointsRules.birthday, 200);
  assert.equal(updated.operations.pointsRulesDraft.birthday, 250);
  const resetRules = transition(updated, { type: "RESET_POINTS_RULES_DRAFT", actorRole: "owner" });
  assert.equal(resetRules.operations.pointsRulesDraft.birthday, 200);
  const editedAgain = transition(resetRules, { type: "UPDATE_POINTS_RULE", actorRole: "owner", field: "birthday", value: 250 });
  const saved = transition(editedAgain, { type: "SAVE_POINTS_RULES", actorRole: "owner" });
  assert.equal(saved.operations.pointsRules.birthday, 250);
  assert.equal(saved.operations.feedback, "积分规则已保存");
  const invalidProduct = transition(saved, { type: "UPDATE_POINTS_PRODUCT_DRAFT", actorRole: "owner", field: "stock", value: -2 });
  assert.equal(invalidProduct.operations.pointsProductDraft.stock, 99);
  const named = transition(invalidProduct, { type: "UPDATE_POINTS_PRODUCT_DRAFT", actorRole: "owner", field: "name", value: "新品酸梅汤" });
  const productSaved = transition(named, { type: "SAVE_POINTS_PRODUCT", actorRole: "owner" });
  assert.equal(productSaved.operations.pointsProducts.at(-1).name, "新品酸梅汤");
  assert.equal(productSaved.operations.feedback, "积分商品已保存");
});

test("owner administration transitions employees and plan state", () => {
  const start = createScenarioState("returning-customer");
  const denied = transition(start, { type: "ADD_EMPLOYEE", actorRole: "staff" });
  assert.equal(denied.operations.employees.length, start.operations.employees.length);
  const added = transition(start, { type: "ADD_EMPLOYEE", actorRole: "owner" });
  assert.equal(added.operations.employees.length, start.operations.employees.length + 1);
  const employeeId = added.operations.employees.at(-1).id;
  const promoted = transition(added, { type: "UPDATE_EMPLOYEE_ROLE", actorRole: "owner", employeeId, role: "manager" });
  assert.equal(promoted.operations.employees.at(-1).role, "manager");
  const invalidRole = transition(promoted, { type: "UPDATE_EMPLOYEE_ROLE", actorRole: "owner", employeeId, role: "owner" });
  assert.equal(invalidRole.operations.employees.at(-1).role, "manager");
  assert.equal(invalidRole.operations.employees.filter(({ role }) => role === "owner").length, 1);
  const removed = transition(invalidRole, { type: "REMOVE_EMPLOYEE", actorRole: "owner", employeeId });
  assert.equal(removed.operations.employees.some(({ id }) => id === employeeId), false);
  const renewed = transition(start, { type: "RENEW_PLAN", actorRole: "owner" });
  assert.equal(renewed.operations.plan.expireDate, "2028-06-30");
  assert.equal(renewed.operations.plan.remainingDays, 720);
  const upgraded = transition(renewed, { type: "UPGRADE_PLAN", actorRole: "owner" });
  assert.equal(upgraded.operations.plan.name, "旗舰版 Enterprise");
});

test("export tasks capture type, use unique ids, and follow explicit transitions", () => {
  const start = createScenarioState("returning-customer");
  const first = transition(start, { type: "SUBMIT_EXPORT", actorRole: "owner", exportType: "activity" });
  assert.equal(first.operations.exportTasks[0].type, "activity");
  assert.equal(first.operations.exportTasks[0].status, "queued");
  const firstId = first.operations.exportTasks[0].id;
  const processing = transition(first, { type: "PROCESS_EXPORT", actorRole: "owner", taskId: firstId });
  assert.equal(processing.operations.exportTasks[0].status, "processing");
  const ready = transition(processing, { type: "COMPLETE_EXPORT", actorRole: "owner", taskId: firstId });
  assert.equal(ready.operations.exportTasks[0].status, "ready");
  const second = transition(ready, { type: "SUBMIT_EXPORT", actorRole: "owner", exportType: "members" });
  assert.notEqual(second.operations.exportTasks[0].id, firstId);
  const secondProcessing = transition(second, { type: "PROCESS_EXPORT", actorRole: "owner", taskId: second.operations.exportTasks[0].id });
  const failed = transition(secondProcessing, { type: "FAIL_EXPORT", actorRole: "owner", taskId: second.operations.exportTasks[0].id });
  assert.equal(failed.operations.exportTasks[0].status, "failed");
  const retried = transition(failed, { type: "RETRY_EXPORT", actorRole: "owner", taskId: failed.operations.exportTasks[0].id });
  assert.equal(retried.operations.exportTasks[0].status, "queued");
});

test("store availability transitions require the owner role", () => {
  const start = createScenarioState("returning-customer");
  const deniedPause = transition(start, { type: "PAUSE_STORE", actorRole: "manager" });
  assert.equal(deniedPause.store.paused, false);
  const paused = transition(start, { type: "PAUSE_STORE", actorRole: "owner" });
  assert.equal(paused.store.paused, true);
  const deniedResume = transition(paused, { type: "RESUME_STORE", actorRole: "staff" });
  assert.equal(deniedResume.store.paused, true);
  const resumed = transition(paused, { type: "RESUME_STORE", actorRole: "owner" });
  assert.equal(resumed.store.paused, false);
});
