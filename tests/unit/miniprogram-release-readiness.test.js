import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const require = createRequire(import.meta.url);

test("release preflight reports AppID and developer-tool blockers explicitly", () => {
  const preflight = require(path.join(root, "scripts/preflight-wechat-devtools.cjs"));
  const report = preflight.buildReport({
    projectConfig: {
      appid: "touristappid",
      compileType: "miniprogram",
      miniprogramRoot: "./"
    },
    cliPath: null,
    projectPath: path.join(root, "miniprogram")
  });

  assert.equal(report.ready, false);
  assert.deepEqual(report.blockers.map(({ code }) => code), [
    "REAL_APPID_REQUIRED",
    "WECHAT_DEVTOOLS_CLI_MISSING"
  ]);
  assert.equal(report.project.compileType, "miniprogram");
});

test("release preflight accepts a real AppID and an available CLI", () => {
  const preflight = require(path.join(root, "scripts/preflight-wechat-devtools.cjs"));
  const report = preflight.buildReport({
    projectConfig: {
      appid: "wx1234567890abcdef",
      compileType: "miniprogram",
      miniprogramRoot: "./"
    },
    cliPath: "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
    projectPath: path.join(root, "miniprogram")
  });

  assert.equal(report.ready, true);
  assert.deepEqual(report.blockers, []);
});

test("repository contains the device acceptance report template", () => {
  const reportPath = path.join(root, "miniprogram/DEVICE_ACCEPTANCE_REPORT.md");
  assert.ok(fs.existsSync(reportPath));
  const source = fs.readFileSync(reportPath, "utf8");
  for (const phrase of ["iPhone", "Android", "已知偏差", "减少动态效果", "暖白实体玻璃", "签字"]) {
    assert.match(source, new RegExp(phrase));
  }
});
