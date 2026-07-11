import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { sparkSuccessScene } from "../../src/prototype/motion/sparkSuccessScene.js";

const sceneUrl = new URL("../../src/prototype/motion/sparkSuccessScene.js", import.meta.url);
const stageUrl = new URL("../../src/prototype/motion/GalaceanStage.jsx", import.meta.url);
const prototypeUrl = new URL("../../src/prototype/", import.meta.url);

test("spark success scene is provided as a local module", () => {
  assert.equal(existsSync(fileURLToPath(sceneUrl)), true);
});

test("spark success scene contains no remote assets", () => {
  assert.deepEqual(sparkSuccessScene.images, []);
  assert.deepEqual(sparkSuccessScene.textures, []);
  assert.deepEqual(sparkSuccessScene.bins, []);
  assert.equal(sparkSuccessScene.compositions[0].items.length, 6);
  assert.doesNotMatch(JSON.stringify(sparkSuccessScene), /https?:\/\//);
});

test("Galacean stage owns a lazy disposable player lifecycle", () => {
  const stagePath = fileURLToPath(stageUrl);
  assert.equal(existsSync(stagePath), true);
  const source = readFileSync(stagePath, "utf8");
  assert.match(source, /import\("@galacean\/effects"\)/);
  assert.doesNotMatch(source, /import\s+.*from\s+["']@galacean\/effects["']/);
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /loadScene\(sparkSuccessScene/);
  assert.match(source, /dispose\(\)/);
  assert.match(source, /catch/);
});

test("motion stages are mounted once at each approved customer node only", () => {
  const customerFiles = [
    "customer/EntryPages.jsx",
    "customer/AiPages.jsx",
    "customer/BenefitPages.jsx",
    "customer/PointsProfilePages.jsx",
  ].map((path) => readFileSync(fileURLToPath(new URL(path, prototypeUrl)), "utf8")).join("\n");
  const mountedKinds = [...customerFiles.matchAll(/<GalaceanStage\s+kind="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(mountedKinds.sort(), ["ai", "claim", "entry", "poster", "redeem", "upgrade"]);

  for (const path of ["merchant", "admin"]) {
    const appSource = readFileSync(fileURLToPath(new URL(`${path}/${path === "merchant" ? "MerchantApp" : "AdminApp"}.jsx`, prototypeUrl)), "utf8");
    assert.doesNotMatch(appSource, /GalaceanStage/);
  }
});

test("an inactive Galacean stage renders inactive on its initial frame", async () => {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const vite = await createServer({ root, configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
  try {
    const { GalaceanStage } = await vite.ssrLoadModule("/src/prototype/motion/GalaceanStage.jsx");
    const html = renderToStaticMarkup(React.createElement(GalaceanStage, { kind: "claim", active: false }));
    assert.match(html, /data-motion-mode="inactive"/);
  } finally {
    await vite.close();
  }
});
