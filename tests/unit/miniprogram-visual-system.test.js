import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const miniRoot = path.join(root, "miniprogram");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function readCommonJs(relativePath) {
  const module = { exports: {} };
  vm.runInNewContext(read(relativePath), { module, exports: module.exports });
  return module.exports;
}

const pageContracts = [
  {
    page: "pages/index/index",
    sceneId: "home",
    requiredComponents: ["lk-glass-surface", "lk-liaoxiaoxing-moment"]
  },
  {
    page: "pages/coupon/list",
    sceneId: "benefits",
    requiredComponents: ["lk-glass-surface", "lk-liquid-lens", "lk-reward-glyph", "lk-liaoxiaoxing-moment"]
  },
  {
    page: "pages/ai-play/index",
    sceneId: "ai",
    requiredComponents: ["lk-glass-surface", "lk-reward-glyph", "lk-liaoxiaoxing-moment"]
  },
  {
    page: "pages/reward/index",
    sceneId: "points",
    requiredComponents: ["lk-glass-surface", "lk-reward-glyph", "lk-liaoxiaoxing-moment"]
  },
  {
    page: "pages/me/index",
    sceneId: "profile",
    requiredComponents: ["lk-glass-surface", "lk-liaoxiaoxing-moment"]
  }
];

test("native customer tab bar uses the locked five-page product language", () => {
  const appJson = readJson("miniprogram/app.json");
  assert.deepEqual(
    appJson.tabBar.list.map(({ text }) => text),
    ["首页", "权益", "AI创作", "积分", "我的"]
  );
});

test("native global styles expose Liquid Glass tokens, fallback, press, and reduced motion", () => {
  const appWxss = read("miniprogram/app.wxss");
  assert.match(appWxss, /--lk-ember-600:\s*#ff4b1b/i);
  assert.match(appWxss, /--lk-radius-hero:\s*56rpx/);
  assert.match(appWxss, /\.lk-glass-acrylic\s*\{/);
  assert.match(appWxss, /\.lk-glass-solid\s*\{/);
  assert.match(appWxss, /\.lk-pressable:active\s*\{[^}]*scale\(\.987\)/s);
  assert.match(appWxss, /\.reduce-motion[\s\S]*animation:\s*none !important/);
});

test("native visual primitives exist with stable public properties", () => {
  const components = [
    ["lk-glass-surface", ["level", "interactive"]],
    ["lk-liquid-lens", ["active"]],
    ["lk-reward-glyph", ["kind", "state", "value"]],
    ["lk-liaoxiaoxing-moment", ["sceneId", "compact", "decorative"]],
    ["lk-spark-motion", ["kind", "active", "reduced"]]
  ];

  for (const [name, properties] of components) {
    const base = path.join(miniRoot, "components", name, name);
    for (const extension of [".js", ".json", ".wxml", ".wxss"]) {
      assert.ok(fs.existsSync(`${base}${extension}`), `${name}${extension} must exist`);
    }
    const source = fs.readFileSync(`${base}.js`, "utf8");
    for (const property of properties) {
      assert.match(source, new RegExp(`${property}\\s*:`), `${name} must expose ${property}`);
    }
  }
});

test("native scene library maps five distinct transparent Liaoxiaoxing moments", () => {
  const manifest = readCommonJs("miniprogram/assets/brand/scenes/manifest.js");
  assert.deepEqual(Object.keys(manifest), ["home", "benefits", "ai", "points", "profile"]);
  assert.equal(new Set(Object.values(manifest)).size, 5);
  for (const asset of Object.values(manifest)) {
    assert.match(asset, /^\/assets\/brand\/scenes\/scene-/);
    assert.ok(fs.existsSync(path.join(miniRoot, asset.slice(1))), asset);
  }
});

test("five native customer pages consume shared primitives and the correct scene", () => {
  for (const contract of pageContracts) {
    const config = readJson(`miniprogram/${contract.page}.json`);
    const markup = read(`miniprogram/${contract.page}.wxml`);
    for (const component of contract.requiredComponents) {
      assert.ok(config.usingComponents?.[component], `${contract.page} must register ${component}`);
    }
    assert.match(markup, new RegExp(`<lk-liaoxiaoxing-moment[^>]*scene-id="${contract.sceneId}"`));
    assert.doesNotMatch(markup, /liaoxiaoxing-standalone-no-star\.png/);
  }
});

test("native hero and hidden watermark contracts preserve size and subtlety", () => {
  const momentWxss = read("miniprogram/components/lk-liaoxiaoxing-moment/lk-liaoxiaoxing-moment.wxss");
  const couponWxss = read("miniprogram/components/coupon-card/coupon-card.wxss");
  const meWxss = read("miniprogram/pages/me/index.wxss");
  assert.match(momentWxss, /width:\s*340rpx/);
  assert.match(momentWxss, /height:\s*340rpx/);
  assert.match(couponWxss, /opacity:\s*0\.0[4-9]/);
  assert.match(meWxss, /opacity:\s*0\.0[4-9]/);
});
