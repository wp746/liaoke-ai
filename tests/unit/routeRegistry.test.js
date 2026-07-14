import test from "node:test";
import assert from "node:assert/strict";
import { ROUTES, getRoutesForSurface } from "../../src/prototype/routeRegistry.js";

test("registers exactly 20 customer, 20 merchant, and 16 admin routes", () => {
  assert.equal(getRoutesForSurface("customer").length, 20);
  assert.equal(getRoutesForSurface("merchant").length, 20);
  assert.equal(getRoutesForSurface("admin").length, 16);
  assert.equal(ROUTES.length, 56);
  assert.ok(ROUTES.every((route) => route.title));
});

test("route ids are unique inside each surface", () => {
  for (const surface of ["customer", "merchant", "admin"]) {
    const ids = getRoutesForSurface(surface).map((route) => route.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});
