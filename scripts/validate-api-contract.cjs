const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const endpoints = [
  { method: "POST", path: "/api/user/login", client: true, server: true },
  { method: "GET", path: "/api/store/detail", client: true, server: true },
  { method: "GET", path: "/api/qr/parse", client: true, server: true },
  { method: "POST", path: "/api/coupon/issue", client: true, server: true },
  { method: "GET", path: "/api/coupon/list", client: true, server: true },
  { method: "GET", path: "/api/coupon/detail", client: true, server: true },
  { method: "POST", path: "/api/coupon/verify", client: true, server: true },
  { method: "POST", path: "/api/upload/token", client: true, server: true },
  { method: "POST", path: "/api/ai/text", client: true, server: true },
  { method: "POST", path: "/api/ai/image", client: true, server: true },
  { method: "POST", path: "/api/poster/generate", client: true, server: true },
  { method: "POST", path: "/api/invite/bind", client: true, server: true },
  { method: "GET", path: "/api/user/referral-coupons", client: true, server: true },
  { method: "POST", path: "/api/store/verify/referral-coupon", client: true, server: true },
  { method: "GET", path: "/api/points/account", client: true, server: true },
  { method: "GET", path: "/api/points/transactions", client: true, server: true },
  { method: "GET", path: "/api/points/products", client: true, server: true },
  { method: "POST", path: "/api/points/redeem", client: true, server: true },
  { method: "GET", path: "/api/points/redemptions", client: true, server: true },
  { method: "POST", path: "/api/points/sign-in", client: true, server: true },
  { method: "POST", path: "/api/store/verify/points-redemption", client: true, server: true },
  { method: "POST", path: "/api/stats/event", client: true, server: true },
  { method: "GET", path: "/api/stats/daily", client: true, server: true },
  { method: "POST", path: "/api/merchant/login", client: true, server: true },
  { method: "GET", path: "/api/merchant/verify/preview", client: true, server: true }
];

const files = {
  docs: fs.readFileSync(path.join(root, "docs/standard-mvp/10-api-contract.md"), "utf8"),
  client: fs.readFileSync(path.join(root, "miniprogram/utils/api.js"), "utf8"),
  server: fs.readFileSync(path.join(root, "server/mock-api.cjs"), "utf8")
};

const failures = [];

for (const endpoint of endpoints) {
  if (!files.docs.includes(endpoint.path)) {
    failures.push(`文档缺少 endpoint: ${endpoint.method} ${endpoint.path}`);
  }
  if (endpoint.client && !files.client.includes(`url: "${endpoint.path}"`)) {
    failures.push(`小程序 api.js 缺少 endpoint: ${endpoint.method} ${endpoint.path}`);
  }
  if (endpoint.server && !files.server.includes(`url.pathname === "${endpoint.path}"`)) {
    failures.push(`mock server 缺少 endpoint: ${endpoint.method} ${endpoint.path}`);
  }
}

if (failures.length) {
  console.error("接口契约校验失败:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("接口契约校验通过。");
console.log(`endpoint 数量: ${endpoints.length}`);
