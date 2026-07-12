import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

const merchantPages = [
  {
    page: "miniprogram/pages/merchant/verify",
    components: ["lk-glass-surface", "lk-reward-glyph", "lk-spark-motion"]
  },
  {
    page: "miniprogram/pages/merchant/dashboard",
    components: ["lk-glass-surface", "lk-reward-glyph"]
  }
];

test("merchant native pages reuse the locked visual primitives", () => {
  for (const contract of merchantPages) {
    const config = readJson(`${contract.page}.json`);
    const markup = read(`${contract.page}.wxml`);
    for (const component of contract.components) {
      assert.ok(config.usingComponents?.[component], `${contract.page} must register ${component}`);
      assert.match(markup, new RegExp(`<${component}`), `${contract.page} must render ${component}`);
    }
  }
});

test("merchant pages stay restrained and do not place mascot scenes in forms or records", () => {
  for (const contract of merchantPages) {
    const markup = read(`${contract.page}.wxml`);
    assert.doesNotMatch(markup, /lk-liaoxiaoxing-moment/);
    assert.doesNotMatch(markup, /scene-(home|benefits|ai|points|profile)/);
    assert.match(markup, /level="solid"/);
  }
});

test("merchant verification exposes query, ready, verifying, success, and error states", () => {
  const source = read("miniprogram/pages/merchant/verify.js");
  const markup = read("miniprogram/pages/merchant/verify.wxml");
  for (const state of ["querying", "ready", "verifying", "success", "error"]) {
    assert.match(source, new RegExp(`"${state}"`), `verify page must model ${state}`);
  }
  assert.match(markup, /verifyState === 'success'/);
  assert.match(markup, /verifyState === 'error'/);
  assert.match(markup, /disabled="\{\{verifyState === 'verifying'/);
});

test("merchant dashboard exposes loading, ready, empty, and error states without layout drift", () => {
  const source = read("miniprogram/pages/merchant/dashboard.js");
  const markup = read("miniprogram/pages/merchant/dashboard.wxml");
  for (const state of ["loading", "ready", "empty", "error"]) {
    assert.match(source, new RegExp(`"${state}"`), `dashboard must model ${state}`);
  }
  assert.match(markup, /pageState === 'loading'/);
  assert.match(markup, /pageState === 'empty'/);
  assert.match(markup, /pageState === 'error'/);
});

test("merchant pages inherit reduced motion and keep operational tap targets rounded", () => {
  for (const contract of merchantPages) {
    const source = read(`${contract.page}.js`);
    const markup = read(`${contract.page}.wxml`);
    const styles = read(`${contract.page}.wxss`);
    assert.match(source, /reduceMotion/);
    assert.match(markup, /reduce-motion/);
    assert.match(styles, /border-radius:\s*var\(--lk-radius-/);
  }
});
