const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const kit = path.join(root, "brand-kit");

const assets = [
  {
    id: "logo-primary",
    source: "brand-kit/assets/svg/liaoke-logo.svg",
    out: "brand-kit/exports/liaoke-logo-primary.png",
    max: 1600,
    usage: "PPT, website, document header"
  },
  {
    id: "logo-mark",
    source: "brand-kit/assets/svg/liaoke-mark.svg",
    out: "brand-kit/exports/liaoke-mark-1024.png",
    max: 1024,
    usage: "app icon source, avatar, corner mark"
  },
  {
    id: "mascot-liaoxiaoxing",
    source: "brand-kit/ip-liaoxiaoxing/assets/standard/liaoxiaoxing-standalone-no-star.png",
    out: "brand-kit/exports/liaoxiaoxing-1024.png",
    max: 1024,
    usage: "caped 3D assistant illustration, reward card, onboarding"
  },
  {
    id: "app-icon-1024",
    source: "brand-kit/templates/app-icon-1024.svg",
    out: "brand-kit/exports/app-icon-1024.png",
    max: 1024,
    usage: "WeChat mini program icon draft"
  },
  {
    id: "table-tent-ai-rouxiaoqian",
    source: "brand-kit/templates/table-tent-ai-rouxiaoqian.svg",
    out: "brand-kit/exports/table-tent-ai-rouxiaoqian.png",
    max: 1600,
    usage: "table tent print preview"
  },
  {
    id: "share-poster-template",
    source: "brand-kit/templates/share-poster-template.svg",
    out: "brand-kit/exports/share-poster-template.png",
    max: 1600,
    usage: "generated poster visual template"
  },
  {
    id: "logo-clearspace-spec",
    source: "brand-kit/templates/logo-clearspace-spec.svg",
    out: "brand-kit/exports/logo-clearspace-spec.png",
    max: 1400,
    usage: "brand usage guide"
  }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfNeeded(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function exportPng(asset) {
  const source = path.join(root, asset.source);
  const out = path.join(root, asset.out);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing source: ${asset.source}`);
  }

  ensureDir(path.dirname(out));
  execFileSync("sips", ["-s", "format", "png", source, "--out", out], { stdio: "pipe" });
  execFileSync("sips", ["-Z", String(asset.max), out], { stdio: "pipe" });

  const info = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", out], {
    encoding: "utf8"
  });
  const width = Number((info.match(/pixelWidth:\s*(\d+)/) || [])[1] || 0);
  const height = Number((info.match(/pixelHeight:\s*(\d+)/) || [])[1] || 0);

  return {
    id: asset.id,
    source: asset.source,
    png: asset.out,
    width,
    height,
    usage: asset.usage
  };
}

function main() {
  copyIfNeeded(path.join(root, "public/brand/liaoke-logo.svg"), path.join(kit, "assets/svg/liaoke-logo.svg"));
  copyIfNeeded(path.join(root, "public/brand/liaoke-mark.svg"), path.join(kit, "assets/svg/liaoke-mark.svg"));
  copyIfNeeded(path.join(root, "public/brand/liaoxiaoxing.svg"), path.join(kit, "assets/svg/liaoxiaoxing.svg"));

  const exported = assets.map(exportPng);
  const mascotPng = path.join(root, "brand-kit/exports/liaoxiaoxing-1024.png");
  if (fs.existsSync(mascotPng)) {
    copyIfNeeded(mascotPng, path.join(root, "public/brand/liaoxiaoxing.png"));
    copyIfNeeded(mascotPng, path.join(root, "miniprogram/assets/brand/png/liaoxiaoxing.png"));
  }

  const ipAssetMap = [
    ["brand-kit/ip-liaoxiaoxing/assets/standard/liaoxiaoxing-standalone-no-star.png", "miniprogram/assets/brand/ip/liaoxiaoxing-standalone-no-star.png"],
    ["brand-kit/ip-liaoxiaoxing/assets/product-poses/liaoxiaoxing-welcome-table.png", "miniprogram/assets/brand/ip/liaoxiaoxing-welcome-table.png"],
    ["brand-kit/ip-liaoxiaoxing/assets/product-poses/liaoxiaoxing-coupon-wallet.png", "miniprogram/assets/brand/ip/liaoxiaoxing-coupon-wallet.png"],
    ["brand-kit/ip-liaoxiaoxing/assets/product-poses/liaoxiaoxing-upload-photo.png", "miniprogram/assets/brand/ip/liaoxiaoxing-upload-photo.png"],
    ["brand-kit/ip-liaoxiaoxing/assets/product-poses/liaoxiaoxing-ai-magic.png", "miniprogram/assets/brand/ip/liaoxiaoxing-ai-magic.png"],
    ["brand-kit/ip-liaoxiaoxing/assets/product-poses/liaoxiaoxing-poster-saved.png", "miniprogram/assets/brand/ip/liaoxiaoxing-poster-saved.png"],
    ["brand-kit/ip-liaoxiaoxing/assets/product-poses/liaoxiaoxing-reward-points.png", "miniprogram/assets/brand/ip/liaoxiaoxing-reward-points.png"],
    ["brand-kit/ip-liaoxiaoxing/assets/stickers/liaoxiaoxing-gift.png", "miniprogram/assets/brand/ip/liaoxiaoxing-gift.png"]
  ];
  for (const [from, to] of ipAssetMap) {
    const source = path.join(root, from);
    if (fs.existsSync(source)) {
      copyIfNeeded(source, path.join(root, to));
    }
  }

  const sceneAssetMap = [
    ["public/brand/ip-liaoxiaoxing/scene-library/display/scene-home-welcome-transparent-v1-display.png", "miniprogram/assets/brand/scenes/scene-home-welcome.png"],
    ["public/brand/ip-liaoxiaoxing/scene-library/display/scene-benefits-wallet-transparent-v1-display.png", "miniprogram/assets/brand/scenes/scene-benefits-wallet.png"],
    ["public/brand/ip-liaoxiaoxing/scene-library/display/scene-ai-magic-transparent-v1-display.png", "miniprogram/assets/brand/scenes/scene-ai-magic.png"],
    ["public/brand/ip-liaoxiaoxing/scene-library/display/scene-points-reward-transparent-v1-display.png", "miniprogram/assets/brand/scenes/scene-points-reward.png"],
    ["public/brand/ip-liaoxiaoxing/scene-library/display/scene-profile-phone-cape-transparent-v2-display.png", "miniprogram/assets/brand/scenes/scene-profile-phone.png"]
  ];
  for (const [from, to] of sceneAssetMap) {
    const source = path.join(root, from);
    if (!fs.existsSync(source)) {
      throw new Error(`Missing scene source: ${from}`);
    }
    copyIfNeeded(source, path.join(root, to));
  }

  const appIcon = path.join(root, "brand-kit/exports/app-icon-1024.png");
  if (fs.existsSync(appIcon)) {
    copyIfNeeded(appIcon, path.join(root, "miniprogram/assets/brand/png/app-icon-1024.png"));
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    brand: "燎客 AI / SparkFlow AI",
    assets: exported
  };

  fs.writeFileSync(path.join(kit, "exports/manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("品牌资产导出完成。");
  for (const item of exported) {
    console.log(`${item.id}: ${item.width}x${item.height} -> ${item.png}`);
  }
}

main();
