const { spawn } = require("node:child_process");

const PORT = 5174;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method, path, data) {
  const url = new URL(path, BASE_URL);
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": `smoke_${Date.now()}`,
      "X-Idempotency-Key": `idem_${Date.now()}`
    }
  };

  if (method === "GET" && data) {
    Object.entries(data).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  if (method !== "GET" && data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok || body.code !== 200) {
    throw new Error(`${method} ${path} failed: ${JSON.stringify(body)}`);
  }
  return body.data;
}

async function waitForHealth() {
  for (let i = 0; i < 30; i += 1) {
    try {
      return await request("GET", "/health");
    } catch {
      await sleep(100);
    }
  }
  throw new Error("mock API did not become healthy");
}

async function main() {
  const child = spawn(process.execPath, ["server/mock-api.cjs"], {
    cwd: process.cwd(),
    env: { ...process.env, LIAOKE_MOCK_API_PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let serverOutput = "";
  child.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForHealth();

    const login = await request("POST", "/api/user/login", {
      code: "http_smoke_code",
      store_id: "STORE001",
      table_id: "A12",
      scene: "s=STORE001&t=A12"
    });

    const coupon = await request("POST", "/api/coupon/issue", {
      member_id: login.member.id,
      store_id: login.store.id,
      coupon_type: "base"
    });

    const coupons = await request("GET", "/api/coupon/list", {
      member_id: login.member.id,
      status: "unused",
      page: "1",
      page_size: "20"
    });

    const upload = await request("POST", "/api/upload/token", {
      filename: "http-smoke-hotpot.jpg",
      content_type: "image/jpeg",
      purpose: "ai_play"
    });

    const aiText = await request("POST", "/api/ai/text", {
      store_id: login.store.id,
      style: "高级日常",
      feeling: "吊龙太嫩了，朋友聚餐很舒服。",
      image_url: upload.file_url
    });

    const poster = await request("POST", "/api/poster/generate", {
      store_id: login.store.id,
      member_id: login.member.id,
      title: aiText.list[0].title,
      style: "高级日常",
      copy: aiText.list[0].content,
      image_url: upload.file_url
    });

    const groupEvent = await request("POST", "/api/stats/event", {
      event_type: "group_join_click",
      page: "home",
      button: "join_group",
      store_id: login.store.id,
      member_id: login.member.id
    });

    const preview = await request("GET", "/api/merchant/verify/preview", {
      coupon_code: coupon.code,
      store_id: login.store.id
    });

    const verify = await request("POST", "/api/coupon/verify", {
      coupon_code: coupon.code,
      store_id: login.store.id,
      operator_id: "STAFF001",
      order_amount: 256
    });

    const referralCoupons = await request("GET", "/api/user/referral-coupons", {
      store_id: login.store.id,
      member_id: login.member.id
    });

    const referralCoupon = referralCoupons.active[0];
    const referralVerify = await request("POST", "/api/store/verify/referral-coupon", {
      store_id: login.store.id,
      operator_id: "STAFF001",
      coupon_id: referralCoupon.coupon_id,
      order_id: "ORD_HTTP_SMOKE_REFERRAL",
      order_amount: 88
    });

    const pointsAccount = await request("GET", "/api/points/account", {
      store_id: login.store.id,
      member_id: login.member.id
    });

    const pointsProducts = await request("GET", "/api/points/products", {
      store_id: login.store.id,
      member_id: login.member.id
    });

    const signIn = await request("POST", "/api/points/sign-in", {
      store_id: login.store.id,
      member_id: login.member.id
    });

    const pointsRedemption = await request("POST", "/api/points/redeem", {
      store_id: login.store.id,
      member_id: login.member.id,
      product_id: pointsProducts.list[0].product_id
    });

    const pointsRedemptions = await request("GET", "/api/points/redemptions", {
      store_id: login.store.id,
      member_id: login.member.id
    });

    const pointsVerify = await request("POST", "/api/store/verify/points-redemption", {
      store_id: login.store.id,
      operator_id: "STAFF001",
      redemption_code: pointsRedemption.redemption_code
    });

    const pointsTransactions = await request("GET", "/api/points/transactions", {
      store_id: login.store.id,
      member_id: login.member.id
    });

    const stats = await request("GET", "/api/stats/daily", {
      store_id: login.store.id
    });

    const failures = [];
    if (!login.session_token) failures.push("login");
    if (!coupon.code) failures.push("coupon issue");
    if (!coupons.list.length) failures.push("coupon list");
    if (!upload.upload_url || !upload.file_url) failures.push("upload token");
    if (!aiText.list.length) failures.push("ai text");
    if (!poster.post_id || !poster.qrcode_url) failures.push("poster");
    if (!groupEvent.accepted) failures.push("group event");
    if (preview.code !== coupon.code) failures.push("verify preview");
    if (!verify.verified_time) failures.push("verify coupon");
    if (!verify.referral_coupon?.triggered) failures.push("referral coupon trigger");
    if (!referralCoupons.active.length) failures.push("referral coupon list");
    if (referralVerify.status !== "used") failures.push("referral coupon verify");
    if (!pointsAccount.account_id) failures.push("points account");
    if (!pointsProducts.list.length) failures.push("points products");
    if (!signIn.earned_points) failures.push("points sign in");
    if (!pointsRedemption.redemption_code) failures.push("points redeem");
    if (!pointsRedemptions.pending.length) failures.push("points redemptions");
    if (pointsVerify.status !== "used") failures.push("points verify");
    if (!pointsTransactions.list.length) failures.push("points transactions");
    if (!stats.issuedCount) failures.push("daily stats");

    if (failures.length) {
      throw new Error(`HTTP smoke assertions failed: ${failures.join(", ")}`);
    }

    console.log("HTTP mock API smoke test 通过。");
    console.log(`baseUrl=${BASE_URL}`);
    console.log(`store=${login.store.name}`);
    console.log(`coupon=${coupon.title}/${coupon.code}`);
    console.log(`poster=${poster.post_id}`);
    console.log(`groupJoinTracked=${groupEvent.accepted}`);
    console.log(`finalAmount=${verify.final_amount}`);
    console.log(`referralCouponFinalAmount=${referralVerify.final_amount}`);
    console.log(`pointsAfterRedeem=${pointsRedemption.points_after}`);
    console.log(`pointsRedemption=${pointsVerify.product_name}/${pointsVerify.status}`);
  } finally {
    child.kill();
    if (process.env.DEBUG_SMOKE_API) {
      console.log(serverOutput);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
