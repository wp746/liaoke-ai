import test from "node:test";
import assert from "node:assert/strict";
import { ROUTES, getRoutesForSurface } from "../../src/prototype/routeRegistry.js";

test("registers exactly 21 customer, 21 merchant, and 17 admin routes", () => {
  assert.equal(getRoutesForSurface("customer").length, 21);
  assert.equal(getRoutesForSurface("merchant").length, 21);
  assert.equal(getRoutesForSurface("admin").length, 17);
  assert.equal(ROUTES.length, 59);
  assert.ok(ROUTES.every((route) => route.title));
  assert.ok(getRoutesForSurface("admin").some(({ id }) => id === "points-governance"));
  assert.ok(getRoutesForSurface("customer").some(({ id }) => id === "private-group"));
  assert.ok(getRoutesForSurface("merchant").some(({ id }) => id === "private-group-settings"));
});

test("route ids are unique inside each surface", () => {
  for (const surface of ["customer", "merchant", "admin"]) {
    const ids = getRoutesForSurface(surface).map((route) => route.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});
