import fs from "node:fs";
import path from "node:path";

const root = path.resolve("miniprogram");
const errors = [];

function exists(file) {
  return fs.existsSync(file);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`JSON 解析失败: ${path.relative(process.cwd(), file)} (${error.message})`);
    return null;
  }
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(target, acc);
    } else {
      acc.push(target);
    }
  }
  return acc;
}

function checkFile(file, label) {
  if (!exists(file)) {
    errors.push(`缺少${label}: ${path.relative(process.cwd(), file)}`);
  }
}

function resolveMiniprogramModule(fromFile, specifier) {
  if (!specifier.startsWith(".")) {
    return null;
  }
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.json`,
    path.join(base, "index.js"),
    path.join(base, "index.json")
  ];
  return candidates.find(exists) || candidates[0];
}

function resolveComponentJson(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    `${base}.json`,
    path.join(base, "index.json")
  ];
  return candidates.find(exists) || candidates[0];
}

const appJsonPath = path.join(root, "app.json");
const appJson = readJson(appJsonPath);

if (appJson) {
  const pageSet = new Set(appJson.pages || []);

  for (const page of appJson.pages || []) {
    const base = path.join(root, page);
    for (const ext of [".js", ".wxml", ".json", ".wxss"]) {
      checkFile(`${base}${ext}`, `页面文件 ${page}${ext}`);
    }
  }

  for (const item of appJson.tabBar?.list || []) {
    if (!pageSet.has(item.pagePath)) {
      errors.push(`tabBar pagePath 未在 pages 中声明: ${item.pagePath}`);
    }
    for (const key of ["iconPath", "selectedIconPath"]) {
      if (!item[key]) {
        errors.push(`tabBar ${item.pagePath} 缺少 ${key}`);
        continue;
      }
      checkFile(path.join(root, item[key]), `tabBar 图标 ${item[key]}`);
    }
  }
}

for (const jsonFile of walk(root).filter((file) => file.endsWith(".json"))) {
  const json = readJson(jsonFile);
  if (!json?.usingComponents) {
    continue;
  }

  for (const [name, specifier] of Object.entries(json.usingComponents)) {
    const resolved = resolveComponentJson(jsonFile, specifier);
    if (!exists(resolved)) {
      errors.push(`组件 ${name} 路径不存在: ${path.relative(process.cwd(), jsonFile)} -> ${specifier}`);
      continue;
    }

    const componentBase = resolved.replace(/\.json$/, "");
    for (const ext of [".js", ".wxml", ".json", ".wxss"]) {
      checkFile(`${componentBase}${ext}`, `组件文件 ${name}${ext}`);
    }
  }
}

for (const jsFile of walk(root).filter((file) => file.endsWith(".js"))) {
  const source = fs.readFileSync(jsFile, "utf8");
  try {
    new Function(source);
  } catch (error) {
    errors.push(`JS 语法解析失败: ${path.relative(process.cwd(), jsFile)} (${error.message})`);
  }

  const requirePattern = /require\(["']([^"']+)["']\)/g;
  let match;
  while ((match = requirePattern.exec(source))) {
    const specifier = match[1];
    const resolved = resolveMiniprogramModule(jsFile, specifier);
    if (resolved && !exists(resolved)) {
      errors.push(`require 路径不存在: ${path.relative(process.cwd(), jsFile)} -> ${specifier}`);
    }
  }
}

for (const markupFile of walk(root).filter((file) => file.endsWith(".wxml"))) {
  const source = fs.readFileSync(markupFile, "utf8");
  const srcPattern = /src=["'](\/assets\/[^"']+)["']/g;
  let match;
  while ((match = srcPattern.exec(source))) {
    const assetPath = path.join(root, match[1].replace(/^\//, ""));
    if (!exists(assetPath)) {
      errors.push(`WXML 资源不存在: ${path.relative(process.cwd(), markupFile)} -> ${match[1]}`);
    }
  }
}

for (const asset of [
  "assets/brand/liaoke-mark.svg",
  "assets/brand/liaoke-logo.svg",
  "assets/brand/liaoxiaoxing.svg",
  "assets/brand/png/liaoke-mark.png",
  "assets/brand/png/liaoke-logo.png",
  "assets/brand/png/liaoxiaoxing.png",
  "assets/brand/png/app-icon-1024.png"
]) {
  checkFile(path.join(root, asset), `品牌资产 ${asset}`);
}

if (errors.length) {
  console.error("小程序结构校验失败:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("小程序结构校验通过。");
console.log(`页面数量: ${appJson?.pages?.length || 0}`);
console.log(`文件数量: ${walk(root).length}`);
