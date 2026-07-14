const fs = require("node:fs");
const path = require("node:path");

const devtoolsCliCandidates = [
  "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
  "/Applications/微信开发者工具.app/Contents/MacOS/cli",
  "/Applications/WeChatDevTools.app/Contents/MacOS/cli",
  "/Applications/wechatdevtools.app/Contents/MacOS/cli"
];

function findDevtoolsCli(candidates = devtoolsCliCandidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function isRealAppId(appid) {
  return /^wx[a-f0-9]{16}$/i.test(appid || "") && appid !== "touristappid";
}

function buildReport({ projectConfig, cliPath, projectPath }) {
  const blockers = [];
  if (!isRealAppId(projectConfig.appid)) {
    blockers.push({
      code: "REAL_APPID_REQUIRED",
      message: "project.config.json 仍使用 touristappid，上传、预览和真机联调前必须替换为真实小程序 AppID。"
    });
  }
  if (!cliPath) {
    blockers.push({
      code: "WECHAT_DEVTOOLS_CLI_MISSING",
      message: "未找到微信开发者工具 CLI；请安装微信开发者工具并开启服务端口。"
    });
  }
  if (projectConfig.compileType !== "miniprogram") {
    blockers.push({
      code: "INVALID_COMPILE_TYPE",
      message: `compileType 必须为 miniprogram，当前为 ${projectConfig.compileType || "未配置"}。`
    });
  }
  if (!fs.existsSync(projectPath)) {
    blockers.push({
      code: "PROJECT_PATH_MISSING",
      message: `小程序目录不存在：${projectPath}`
    });
  }

  return {
    ready: blockers.length === 0,
    checkedAt: new Date().toISOString(),
    project: {
      path: projectPath,
      appid: projectConfig.appid,
      compileType: projectConfig.compileType,
      miniprogramRoot: projectConfig.miniprogramRoot
    },
    devtoolsCli: cliPath,
    blockers
  };
}

function printHuman(report) {
  console.log(report.ready ? "微信开发者工具发布前检查：READY" : "微信开发者工具发布前检查：BLOCKED");
  console.log(`项目目录: ${report.project.path}`);
  console.log(`AppID: ${report.project.appid}`);
  console.log(`开发者工具 CLI: ${report.devtoolsCli || "未安装或未找到"}`);
  if (report.blockers.length) {
    for (const blocker of report.blockers) {
      console.log(`- [${blocker.code}] ${blocker.message}`);
    }
  } else {
    console.log("下一步可执行微信开发者工具 CLI 的 open / preview / upload。");
  }
}

function main() {
  const root = path.resolve(__dirname, "..");
  const projectPath = path.join(root, "miniprogram");
  const projectConfig = JSON.parse(fs.readFileSync(path.join(projectPath, "project.config.json"), "utf8"));
  const report = buildReport({
    projectConfig,
    cliPath: findDevtoolsCli(),
    projectPath
  });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report);
  }
  if (process.argv.includes("--require-ready") && !report.ready) {
    process.exitCode = 2;
  }
}

module.exports = {
  buildReport,
  findDevtoolsCli,
  isRealAppId
};

if (require.main === module) {
  main();
}
