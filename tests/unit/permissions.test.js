import test from "node:test";
import assert from "node:assert/strict";
import { merchantTabs, canMerchant, canAdmin } from "../../src/prototype/permissions.js";

test("staff sees only verification, history, and account", () => {
  assert.deepEqual(merchantTabs("staff").map((tab) => tab.id), ["verify-hub", "verify-history", "merchant-export"]);
  assert.equal(canMerchant("staff", "points:products:write"), false);
  assert.equal(canMerchant("staff", "points:rules:write"), false);
});

test("points permissions separate store operations from rule ownership", () => {
  assert.equal(canMerchant("owner", "points:products:write"), true);
  assert.equal(canMerchant("owner", "points:rules:write"), true);
  assert.equal(canMerchant("manager", "points:products:write"), true);
  assert.equal(canMerchant("manager", "points:rules:write"), false);
});

test("private group settings are owner-write and manager-read", () => {
  assert.equal(canMerchant("owner", "group:read"), true);
  assert.equal(canMerchant("owner", "group:write"), true);
  assert.equal(canMerchant("manager", "group:read"), true);
  assert.equal(canMerchant("manager", "group:write"), false);
  assert.equal(canMerchant("staff", "group:read"), false);
});

test("platform admin is read-only while super admin can write", () => {
  assert.equal(canAdmin("platform_admin", "store:update"), false);
  assert.equal(canAdmin("super_admin", "store:update"), true);
});
