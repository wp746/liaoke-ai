const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const examplePath = path.join(root, "miniprogram/config.example.js");
const targetPath = path.join(root, "miniprogram/utils/config.js");
const envName = process.argv[2];

function loadCommonJs(file) {
  const source = fs.readFileSync(file, "utf8");
  const module = { exports: {} };
  const wrapped = `(function(require, module, exports) { ${source}\n})`;
  const fn = vm.runInThisContext(wrapped, { filename: file });
  fn(require, module, module.exports);
  return module.exports;
}

function formatConfig(config) {
  return `const config = ${JSON.stringify(config, null, 2)};\n\nmodule.exports = config;\n`;
}

if (!envName || ["-h", "--help"].includes(envName)) {
  console.log("Usage: node scripts/configure-miniprogram-env.cjs <mock|localHttpMock|test|production>");
  process.exit(envName ? 0 : 1);
}

const configs = loadCommonJs(examplePath);
const selected = configs[envName];

if (!selected) {
  console.error(`未知环境: ${envName}`);
  console.error(`可选环境: ${Object.keys(configs).join(", ")}`);
  process.exit(1);
}

fs.writeFileSync(targetPath, formatConfig(selected));
console.log(`已切换小程序环境: ${envName}`);
console.log(`useMock=${selected.useMock}`);
console.log(`baseUrl=${selected.baseUrl}`);
