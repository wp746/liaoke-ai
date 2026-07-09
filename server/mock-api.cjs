const http = require("node:http");
const { URL } = require("node:url");

const PORT = Number(process.env.LIAOKE_MOCK_API_PORT || process.env.PORT || 5174);
const HOST = process.env.LIAOKE_MOCK_API_HOST || "127.0.0.1";

const state = {
  store: {
    id: "STORE001",
    store_id: "STORE001",
    name: "牛里牛气潮汕牛肉火锅",
    store_name: "牛里牛气潮汕牛肉火锅",
    slogan: "吃肉的人终会相遇",
    tableName: "A12 桌",
    tableIpName: "AI 肉小签",
    table_ip_name: "AI 肉小签",
    brand_keywords: ["潮汕牛肉火锅", "肉好实惠", "朋友聚餐"],
    group_chat_url: "https://example.com/group-guide",
    groupChatUrl: "https://example.com/group-guide",
    group_chat_name: "牛里牛气会员福利群",
    groupChatName: "牛里牛气会员福利群",
    group_join_guide: "进群领隐藏福利、生日券、新品试吃和工作日午市提醒。",
    groupJoinGuide: "进群领隐藏福利、生日券、新品试吃和工作日午市提醒。",
    group_qr_image: "/assets/brand/png/liaoke-mark.png",
    groupQrImage: "/assets/brand/png/liaoke-mark.png",
    poster_template: "hotpot_standard",
    activity_enabled: true
  },
  member: {
    id: "MEM202606270001",
    member_id: "MEM202606270001",
    nickname: "新晋食肉搭子",
    level: "Lv.2 食肉达人",
    points: 128,
    avatarText: "燎"
  },
  pointsAccount: {
    account_id: "PACC202607090001",
    available_points: 1250,
    total_earned_points: 1880,
    total_used_points: 630,
    total_expired_points: 0,
    expire_soon_points: 120,
    expire_soon_date: "2026-08-01",
    rules: {
      points_per_yuan: 1,
      sign_in_value: 5,
      ai_share_value: 50,
      profile_complete_value: 100,
      birthday_value: 200,
      expire_days: 365
    }
  },
  pointsTransactions: [
    {
      transaction_id: "PTX202607090001",
      transaction_type: "earn",
      source_type: "consume_earn",
      points_delta: 80,
      points_after: 1250,
      created_at: "2026-07-09 12:20:00",
      expire_at: "2027-07-09 23:59:59"
    }
  ],
  pointsProducts: [
    {
      product_id: "PPRD202607090001",
      product_name: "酸梅汤一杯",
      product_type: "drink",
      points_price: 300,
      stock_quantity: 99,
      max_redeem_per_member_month: 2,
      can_redeem: true,
      description: "到店堂食可兑换"
    },
    {
      product_id: "PPRD202607090002",
      product_name: "开胃小菜一份",
      product_type: "side_dish",
      points_price: 500,
      stock_quantity: 50,
      max_redeem_per_member_month: 1,
      can_redeem: true,
      description: "每桌限兑一份"
    }
  ],
  pointsRedemptions: [],
  pointsSignedDates: new Set(),
  coupons: [
    {
      id: "CPN202606270001",
      coupon_id: "CPN202606270001",
      type: "base",
      coupon_type: "base",
      title: "今日吃肉券",
      benefit: "全单 85 折",
      discount_rate: 0.85,
      note: "满 88 元可用",
      expireText: "今日 23:59 前有效",
      expire_time: "2026-06-28 23:59:59",
      status: "unused",
      code: "8827639401",
      coupon_code: "8827639401"
    },
    {
      id: "CPN202606270002",
      coupon_id: "CPN202606270002",
      type: "reward",
      coupon_type: "reward",
      title: "老客奖励券",
      benefit: "手切嫩肉一份",
      gift_name: "手切嫩肉一份",
      note: "满 168 元可用",
      expireText: "2026-07-10 前有效",
      expire_time: "2026-07-10 23:59:59",
      status: "unused",
      code: "6739012488",
      coupon_code: "6739012488"
    }
  ],
  referralCoupons: [
    {
      coupon_id: "RFC202607050001",
      face_value: 10,
      min_order_amount: 30,
      effective_time: "2026-07-06 19:30:00",
      expire_time: "2026-08-05 23:59:59",
      trigger_order_id: "ORD202607050088",
      status: "active"
    }
  ],
  posters: [],
  events: []
};

function json(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id, X-Idempotency-Key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(body));
}

function ok(res, data) {
  json(res, 200, { code: 200, msg: "success", data });
}

function fail(res, code, msg, statusCode = 200) {
  json(res, statusCode, {
    code,
    msg,
    data: null,
    request_id: `mock_${Date.now()}`
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function mergeQuery(url, body) {
  const data = { ...body };
  url.searchParams.forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

function makeCoupon(data = {}) {
  const existing = state.coupons.find((item) => item.type === "base" && item.status === "unused");
  if (existing) {
    return existing;
  }
  const id = `CPN${Date.now()}`;
  const code = String(Math.floor(1000000000 + Math.random() * 8999999999));
  const coupon = {
    id,
    coupon_id: id,
    type: data.coupon_type || "base",
    coupon_type: data.coupon_type || "base",
    title: "今日吃肉券",
    benefit: "全单 85 折",
    discount_rate: 0.85,
    note: "满 88 元可用",
    expireText: "今日 23:59 前有效",
    expire_time: "2026-06-28 23:59:59",
    status: "unused",
    code,
    coupon_code: code
  };
  state.coupons.unshift(coupon);
  return coupon;
}

function createAiCopies(data = {}) {
  const feeling = data.feeling || "今天肉很新鲜";
  const style = data.style || "高级日常";
  return [
    {
      id: "copy_1",
      title: style,
      style,
      content: `${feeling} 今天这顿吊龙嫩到离谱，锅气和烟火气都刚刚好。朋友聚餐不用想太多，坐下开吃就对了。`
    },
    {
      id: "copy_2",
      title: "朋友安利",
      style,
      content: "这家偏一点，但肉真的值得跑一趟。点完一轮又追加一轮，属于吃完会认真收藏的火锅。"
    },
    {
      id: "copy_3",
      title: "小红书感",
      style,
      content: "被这口潮汕牛肉治愈了。鲜、嫩、热闹，还有一点刚刚好的松弛感。"
    }
  ];
}

function dailyStats() {
  const verifiedCount = state.coupons.filter((item) => item.status === "used").length;
  return {
    scanCount: 42 + state.events.filter((event) => event.type === "scan").length,
    issuedCount: state.coupons.length,
    verifiedCount,
    aiUsers: 18,
    posters: state.posters.length || 7,
    newCustomers: 3,
    groupClicks: 12,
    pointsRedeemed: state.pointsRedemptions.filter((item) => item.status === "used").length,
    records: [
      { time: "12:31", title: "今日吃肉券", amount: "¥256", status: "已核销" },
      { time: "12:44", title: "老客奖励券", amount: "手切嫩肉", status: "已核销" },
      { time: "13:08", title: "今日吃肉券", amount: "¥188", status: "已核销" }
    ]
  };
}

async function route(req, res) {
  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  let body = {};
  try {
    body = req.method === "GET" ? {} : await readBody(req);
  } catch (error) {
    fail(res, 40000, "请求 JSON 解析失败", 400);
    return;
  }
  const data = mergeQuery(url, body);

  if (url.pathname === "/health") {
    ok(res, { status: "ok", service: "liaoke-mock-api" });
    return;
  }

  if (url.pathname === "/mock-upload" && req.method === "POST") {
    ok(res, { uploaded: true });
    return;
  }

  if (url.pathname === "/api/user/login" && req.method === "POST") {
    ok(res, {
      session_token: "mock_session_token",
      openid: "mock_openid",
      member_id: state.member.id,
      is_new_member: false,
      store: state.store,
      member: state.member,
      coupon_status: {
        base_coupon_issued_today: state.coupons.some((item) => item.type === "base" && item.status === "unused")
      }
    });
    return;
  }

  if ((url.pathname === "/api/store/detail" || url.pathname === "/api/qr/parse") && req.method === "GET") {
    ok(res, state.store);
    return;
  }

  if (url.pathname === "/api/coupon/issue" && req.method === "POST") {
    ok(res, makeCoupon(data));
    return;
  }

  if (url.pathname === "/api/coupon/list" && req.method === "GET") {
    const status = data.status || "unused";
    const list = state.coupons.filter((item) => item.status === status);
    ok(res, { total: list.length, list });
    return;
  }

  if (url.pathname === "/api/coupon/detail" && req.method === "GET") {
    const coupon = state.coupons.find((item) => item.id === data.coupon_id || item.code === data.coupon_code);
    coupon ? ok(res, coupon) : fail(res, 40002, "优惠券不存在");
    return;
  }

  if (url.pathname === "/api/upload/token" && req.method === "POST") {
    const filename = data.filename || `liaoke-${Date.now()}.jpg`;
    ok(res, {
      upload_url: `http://${HOST}:${PORT}/mock-upload`,
      form_field: "file",
      form_data: {
        key: `mock/uploads/${filename}`,
        policy: "mock_policy",
        signature: "mock_signature"
      },
      file_url: `http://${HOST}:${PORT}/mock-static/${filename}`,
      object_key: `mock/uploads/${filename}`
    });
    return;
  }

  if (url.pathname === "/api/ai/text" && req.method === "POST") {
    ok(res, { list: createAiCopies(data) });
    return;
  }

  if (url.pathname === "/api/ai/image" && req.method === "POST") {
    ok(res, { image_url: data.image_url || "", effect: data.effect || "warm" });
    return;
  }

  if (url.pathname === "/api/poster/generate" && req.method === "POST") {
    const postId = `POST${Date.now()}`;
    const poster = {
      post_id: postId,
      title: data.title || "高级日常",
      style: data.style || "高级日常",
      copy: data.copy || "今天这顿吊龙嫩到离谱，锅气和烟火气都刚刚好。",
      image_url: data.image_url || "",
      scene: `s=${state.store.id}&i=${state.member.id}&p=${postId}`,
      qrcode_url: `http://${HOST}:${PORT}/mock-static/qrcode-${postId}.png`
    };
    state.posters.unshift(poster);
    ok(res, poster);
    return;
  }

  if (url.pathname === "/api/merchant/verify/preview" && req.method === "GET") {
    const coupon = state.coupons.find((item) => item.code === data.coupon_code || item.coupon_code === data.coupon_code);
    if (!coupon) {
      fail(res, 40002, "优惠券不存在");
      return;
    }
    ok(res, {
      ...coupon,
      member: {
        member_id: state.member.id,
        nickname: state.member.nickname
      }
    });
    return;
  }

  if (url.pathname === "/api/coupon/verify" && req.method === "POST") {
    const coupon = state.coupons.find((item) => item.code === data.coupon_code || item.coupon_code === data.coupon_code);
    if (!coupon) {
      fail(res, 40002, "优惠券不存在");
      return;
    }
    if (coupon.status !== "unused") {
      fail(res, 40003, "优惠券已使用");
      return;
    }
    const original = Number(data.order_amount || data.amount || 0);
    const discount = Number((original * (1 - (coupon.discount_rate || 0.85))).toFixed(2));
    coupon.status = "used";
    ok(res, {
      coupon_id: coupon.id,
      original_amount: original,
      discount_amount: discount,
      final_amount: Number((original - discount).toFixed(2)),
      verified_time: new Date().toISOString(),
      referral_coupon: {
        triggered: true,
        inviter_member_id: "MEM202606260045",
        coupon_id: `RFC${Date.now()}`,
        status: "pending",
        effective_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
    return;
  }

  if (url.pathname === "/api/user/referral-coupons" && req.method === "GET") {
    ok(res, {
      pending: state.referralCoupons.filter((item) => item.status === "pending"),
      active: state.referralCoupons.filter((item) => item.status === "active"),
      used: state.referralCoupons.filter((item) => item.status === "used"),
      expired: state.referralCoupons.filter((item) => item.status === "expired")
    });
    return;
  }

  if (url.pathname === "/api/store/verify/referral-coupon" && req.method === "POST") {
    const coupon = state.referralCoupons.find((item) => item.coupon_id === data.coupon_id);
    if (!coupon || ["used", "expired", "cancelled"].includes(coupon.status)) {
      fail(res, 8001, "该券不存在或已过期");
      return;
    }
    if (coupon.status === "pending") {
      fail(res, 8004, "该券明日起生效，请明天再来使用");
      return;
    }
    const orderAmount = Number(data.order_amount || 0);
    if (orderAmount < coupon.min_order_amount) {
      fail(res, 8002, `消费满${coupon.min_order_amount}元才可使用此券`);
      return;
    }
    coupon.status = "used";
    coupon.used_order_id = data.order_id || `ORD${Date.now()}`;
    coupon.used_time = new Date().toISOString();
    ok(res, {
      coupon_id: coupon.coupon_id,
      deduction_amount: coupon.face_value,
      order_amount: orderAmount,
      final_amount: Number((orderAmount - coupon.face_value).toFixed(2)),
      status: coupon.status,
      used_time: coupon.used_time
    });
    return;
  }

  if (url.pathname === "/api/points/account" && req.method === "GET") {
    ok(res, state.pointsAccount);
    return;
  }

  if (url.pathname === "/api/points/transactions" && req.method === "GET") {
    ok(res, {
      page: Number(data.page || 1),
      page_size: Number(data.page_size || 20),
      total: state.pointsTransactions.length,
      list: state.pointsTransactions
    });
    return;
  }

  if (url.pathname === "/api/points/products" && req.method === "GET") {
    const type = data.type || "";
    const list = state.pointsProducts
      .filter((item) => !type || item.product_type === type)
      .map((item) => ({
        ...item,
        can_redeem: state.pointsAccount.available_points >= item.points_price && item.stock_quantity !== 0
      }));
    ok(res, {
      available_points: state.pointsAccount.available_points,
      list
    });
    return;
  }

  if (url.pathname === "/api/points/redeem" && req.method === "POST") {
    const product = state.pointsProducts.find((item) => item.product_id === data.product_id);
    if (!product || product.stock_quantity === 0) {
      fail(res, 9003, "积分商品不存在、已下架或售罄");
      return;
    }
    if (state.pointsAccount.available_points < product.points_price) {
      fail(res, 9002, "积分不足");
      return;
    }
    const redemption = {
      redemption_id: `PRDM${Date.now()}`,
      redemption_code: `PNT${Math.floor(100000 + Math.random() * 899999)}`,
      product_id: product.product_id,
      product_name: product.product_name,
      points_cost: product.points_price,
      points_after: state.pointsAccount.available_points - product.points_price,
      status: "pending",
      expire_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    state.pointsAccount.available_points = redemption.points_after;
    state.pointsAccount.total_used_points += product.points_price;
    product.stock_quantity = Math.max(0, product.stock_quantity - 1);
    state.pointsRedemptions.unshift(redemption);
    state.pointsTransactions.unshift({
      transaction_id: `PTX${Date.now()}`,
      transaction_type: "redeem",
      source_type: "redemption",
      points_delta: -product.points_price,
      points_after: state.pointsAccount.available_points,
      created_at: new Date().toISOString(),
      redemption_id: redemption.redemption_id
    });
    ok(res, redemption);
    return;
  }

  if (url.pathname === "/api/points/redemptions" && req.method === "GET") {
    ok(res, {
      pending: state.pointsRedemptions.filter((item) => item.status === "pending"),
      used: state.pointsRedemptions.filter((item) => item.status === "used"),
      expired: state.pointsRedemptions.filter((item) => item.status === "expired")
    });
    return;
  }

  if (url.pathname === "/api/points/sign-in" && req.method === "POST") {
    const key = `${data.store_id || state.store.id}:${data.member_id || state.member.id}:${new Date().toISOString().slice(0, 10)}`;
    if (state.pointsSignedDates.has(key)) {
      fail(res, 9007, "今日已签到");
      return;
    }
    const earned = state.pointsAccount.rules.sign_in_value;
    state.pointsSignedDates.add(key);
    state.pointsAccount.available_points += earned;
    state.pointsAccount.total_earned_points += earned;
    state.pointsTransactions.unshift({
      transaction_id: `PTX${Date.now()}`,
      transaction_type: "earn",
      source_type: "sign_in",
      points_delta: earned,
      points_after: state.pointsAccount.available_points,
      created_at: new Date().toISOString()
    });
    ok(res, {
      earned_points: earned,
      available_points: state.pointsAccount.available_points,
      signed_at: new Date().toISOString()
    });
    return;
  }

  if (url.pathname === "/api/store/verify/points-redemption" && req.method === "POST") {
    const redemption = state.pointsRedemptions.find((item) => item.redemption_code === data.redemption_code);
    if (!redemption || redemption.status !== "pending") {
      fail(res, 9005, "积分兑换码不存在或不可核销");
      return;
    }
    redemption.status = "used";
    redemption.used_time = new Date().toISOString();
    ok(res, {
      redemption_id: redemption.redemption_id,
      redemption_code: redemption.redemption_code,
      product_name: redemption.product_name,
      status: redemption.status,
      used_time: redemption.used_time
    });
    return;
  }

  if (url.pathname === "/api/stats/event" && req.method === "POST") {
    state.events.push({ ...data, created_at: new Date().toISOString() });
    ok(res, { accepted: true });
    return;
  }

  if (url.pathname === "/api/invite/bind" && req.method === "POST") {
    ok(res, { accepted: true });
    return;
  }

  if (url.pathname === "/api/stats/daily" && req.method === "GET") {
    ok(res, dailyStats());
    return;
  }

  if (url.pathname === "/api/merchant/login" && req.method === "POST") {
    ok(res, {
      session_token: "mock_merchant_session",
      operator: {
        operator_id: "STAFF001",
        role: "store_admin",
        store_id: state.store.id
      }
    });
    return;
  }

  fail(res, 40400, `接口不存在: ${url.pathname}`, 404);
}

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    console.error(error);
    fail(res, 50000, "服务器错误", 500);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Liaoke mock API listening on http://${HOST}:${PORT}`);
});
