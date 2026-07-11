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
