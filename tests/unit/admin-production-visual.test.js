import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("admin frame declares high-density role-aware production semantics", () => {
  const frame = read("src/prototype/components/AdminFrame.jsx");
  assert.match(frame, /data-admin-density="high"/);
  assert.match(frame, /data-admin-role-mode=\{readonly \? "readonly" : "writable"\}/);
  assert.match(frame, /aria-live="polite"/);
});

test("overview and store detail expose stable page contracts and restrained glass", () => {
  const overview = read("src/prototype/admin/OverviewPages.jsx");
  const stores = read("src/prototype/admin/StorePages.jsx");
  assert.match(overview, /data-admin-page="overview"/);
  assert.match(stores, /data-admin-page="store-detail"/);
  assert.match(overview, /data-severity="high"/);
  assert.match(overview, /data-severity="medium"/);
  assert.doesNotMatch(overview, /BrandMascot|LiaoxiaoxingMoment/);
  assert.doesNotMatch(stores, /BrandMascot|LiaoxiaoxingMoment/);
});

test("admin data tables declare their default sort and sticky readable headers", () => {
  const overview = read("src/prototype/admin/OverviewPages.jsx");
  const css = read("src/prototype/styles/admin.css");
  assert.match(overview, /data-default-sort="risk-desc"/);
  assert.match(css, /\.admin-store-table th,[\s\S]*position:\s*sticky/);
  assert.match(css, /--admin-row-height:\s*44px/);
});

test("admin production styles preserve focus, reduced motion, and desktop density", () => {
  const css = read("src/prototype/styles/admin.css");
  assert.match(css, /\.admin-frame\s*\{[^}]*--admin-panel-radius:/s);
  assert.match(css, /\.admin-frame button:focus-visible,[\s\S]*outline:/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition:\s*none !important/);
  assert.match(css, /\[data-admin-density="high"\][\s\S]*min-height:\s*var\(--admin-row-height\)/);
});
