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
