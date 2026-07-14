import test from "node:test";
import assert from "node:assert/strict";
import { adminReducer, createAdminState } from "../../src/prototype/admin/adminState.js";

test("AI retries mutate state only for super admins", () => {
  const start = createAdminState();
  const denied = adminReducer(start, { type: "RETRY_AI_FAILURE", actorRole: "platform_admin", taskId: "AI-20260710-038" });
  assert.equal(denied, start);
  const retried = adminReducer(start, { type: "RETRY_AI_FAILURE", actorRole: "super_admin", taskId: "AI-20260710-038" });
  assert.equal(retried.aiFailures[0].status, "retrying");
  assert.equal(retried.feedback, "任务 AI-20260710-038 已进入重试队列。");
});

test("prompt lifecycle and keyword writes are guarded at the state layer", () => {
  const start = createAdminState();
  const denied = adminReducer(start, { type: "ACTIVATE_PROMPT", actorRole: "platform_admin", version: "v3.3" });
  assert.equal(denied, start);
  const active = adminReducer(start, { type: "ACTIVATE_PROMPT", actorRole: "super_admin", version: "v3.3" });
  assert.equal(active.promptVersions.find(({ version }) => version === "v3.3").status, "active");
  assert.equal(active.promptVersions.find(({ version }) => version === "v3.2").status, "retired");
  const keyword = adminReducer(active, { type: "ADD_KEYWORD", actorRole: "super_admin", kind: "forbidden", value: "夸大承诺" });
  assert.equal(keyword.forbiddenTerms.at(-1), "夸大承诺");
});

test("AI quota budgets validate and mutate only for super admins", () => {
  const start = createAdminState();
  const denied = adminReducer(start, { type: "SAVE_AI_QUOTA", actorRole: "platform_admin", store: "牛里牛气潮汕牛肉火锅", budget: 1500 });
  assert.equal(denied, start);
  for (const budget of [0, -1, 100001, 10.5, "not-a-number"]) {
    const invalid = adminReducer(start, { type: "SAVE_AI_QUOTA", actorRole: "super_admin", store: "牛里牛气潮汕牛肉火锅", budget });
    assert.equal(invalid.aiQuota[0].budget, 1200);
    assert.equal(invalid.feedback, "月度预算须为 1–100000 次的整数。");
  }
  const saved = adminReducer(start, { type: "SAVE_AI_QUOTA", actorRole: "super_admin", store: "牛里牛气潮汕牛肉火锅", budget: 1500 });
  assert.equal(saved.aiQuota[0].budget, 1500);
  assert.equal(saved.feedback, "牛里牛气潮汕牛肉火锅月度预算已保存为 1500 次。");
});

test("repeated prompt copies receive unique version identities", () => {
  const start = createAdminState();
  const first = adminReducer(start, { type: "COPY_PROMPT", actorRole: "super_admin", version: "v3.2" });
  const second = adminReducer(first, { type: "COPY_PROMPT", actorRole: "super_admin", version: "v3.2" });
  assert.deepEqual(second.promptVersions.slice(0, 2).map(({ version }) => version), ["v3.2-copy-002", "v3.2-copy-001"]);
  assert.equal(new Set(second.promptVersions.map(({ version }) => version)).size, second.promptVersions.length);
});

test("prompt publishing accepts drafts only and preserves exactly one active version", () => {
  const start = createAdminState();
  for (const version of ["v9.9", "v3.1", "v3.2"]) {
    const invalid = adminReducer(start, { type: "ACTIVATE_PROMPT", actorRole: "super_admin", version });
    assert.equal(invalid, start);
    assert.equal(invalid.promptVersions.filter(({ status }) => status === "active").length, 1);
    assert.equal(invalid.promptVersions.find(({ version: itemVersion }) => itemVersion === "v3.2").status, "active");
  }
  const published = adminReducer(start, { type: "ACTIVATE_PROMPT", actorRole: "super_admin", version: "v3.3" });
  assert.equal(published.promptVersions.filter(({ status }) => status === "active").length, 1);
  assert.equal(published.promptVersions.find(({ version }) => version === "v3.3").status, "active");
});
