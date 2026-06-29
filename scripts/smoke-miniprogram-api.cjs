const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const moduleCache = new Map();

function loadCommonJs(file) {
  const filename = file.endsWith(".js") ? file : `${file}.js`;
  const absolute = path.resolve(__dirname, "..", filename);

  if (moduleCache.has(absolute)) {
    return moduleCache.get(absolute).exports;
  }

  const source = fs.readFileSync(absolute, "utf8");
  const module = { exports: {} };
  moduleCache.set(absolute, module);

  const localRequire = (specifier) => {
    if (!specifier.startsWith(".")) {
      return require(specifier);
    }
    return loadCommonJs(path.relative(path.resolve(__dirname, ".."), path.resolve(path.dirname(absolute), specifier)));
  };

  const wrapped = `(function(require, module, exports) { ${source}\n})`;
  const fn = vm.runInThisContext(wrapped, { filename: absolute });
  fn(localRequire, module, module.exports);
  return module.exports;
}

const api = loadCommonJs("miniprogram/utils/api");

async function main() {
  const login = await api.login({
    code: "smoke_wx_code",
    store_id: "STORE001",
    table_id: "A12",
    scene: "s=STORE001&t=A12"
  });

  const issued = await api.issueCoupon({
    member_id: login.member.id,
    store_id: login.store.id,
    coupon_type: "base"
  });

  const coupons = await api.listCoupons({
    member_id: login.member.id,
    status: "unused",
    page: 1,
    page_size: 20
  });

  const uploadToken = await api.getUploadToken({
    filename: "smoke-hotpot.jpg",
    content_type: "image/jpeg",
    purpose: "ai_play"
  });

  const aiImage = await api.enhanceAiImage({
    image_url: uploadToken.file_url,
    effect: "warm"
  });

  const aiText = await api.generateAiText({
    store_id: login.store.id,
    style: "高级日常",
    feeling: "吊龙太嫩了，朋友聚餐很舒服。",
    image_url: aiImage.image_url
  });

  const poster = await api.generatePoster({
    store_id: login.store.id,
    member_id: login.member.id,
    style: "高级日常",
    copy: aiText.list[0].content,
    title: aiText.list[0].title,
    image_url: aiImage.image_url
  });

  const groupClick = await api.trackEvent({
    event_type: "group_join_click",
    page: "home",
    button: "join_group",
    store_id: login.store.id,
    member_id: login.member.id
  });

  const preview = await api.previewVerify(issued.code);
  const verify = await api.verifyCoupon({
    coupon_code: issued.code,
    store_id: login.store.id,
    amount: 256
  });

  const stats = await api.getDailyStats({ store_id: login.store.id });

  const failures = [];
  if (!login.session_token || !login.store || !login.member) failures.push("login");
  if (!issued.code) failures.push("issueCoupon");
  if (!coupons.list.length) failures.push("listCoupons");
  if (!uploadToken.upload_url || !uploadToken.file_url) failures.push("getUploadToken");
  if (!aiImage.image_url) failures.push("enhanceAiImage");
  if (!aiText.list.length) failures.push("generateAiText");
  if (!poster.post_id || !poster.scene || !poster.qrcode_url) failures.push("generatePoster");
  if (!groupClick.accepted) failures.push("trackGroupJoin");
  if (preview.code !== issued.code) failures.push("previewVerify");
  if (!verify.verified_at) failures.push("verifyCoupon");
  if (!stats.scanCount) failures.push("getDailyStats");

  if (failures.length) {
    console.error(`小程序 API smoke test 失败: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("小程序 API smoke test 通过。");
  console.log(`store=${login.store.name}`);
  console.log(`coupon=${issued.title}/${issued.code}`);
  console.log(`upload=${uploadToken.object_key}`);
  console.log(`aiCopies=${aiText.list.length}`);
  console.log(`poster=${poster.post_id}`);
  console.log(`groupJoinTracked=${groupClick.accepted}`);
  console.log(`verifiedAt=${verify.verified_at}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
