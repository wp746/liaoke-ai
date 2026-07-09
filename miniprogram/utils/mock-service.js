const {
  mockStore,
  mockMember,
  mockCoupons,
  mockRewards,
  aiCopyOptions,
  merchantStats
} = require("./mock");

const state = {
  store: { ...mockStore },
  member: { ...mockMember },
  coupons: mockCoupons.map((item) => ({ ...item })),
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
    }
  ],
  pointsRedemptions: [],
  pointsSignedDates: {},
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
  rewards: mockRewards.map((item) => ({ ...item })),
  posters: []
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ok(data) {
  return Promise.resolve({
    code: 200,
    msg: "success",
    data: clone(data)
  });
}

function fail(code, msg) {
  return Promise.resolve({
    code,
    msg,
    data: null,
    request_id: `mock_${Date.now()}`
  });
}

function createCoupon(data = {}) {
  const existing = state.coupons.find((item) => item.type === "base" && item.status === "unused");
  if (existing) {
    return existing;
  }

  const coupon = {
    id: `CPN${Date.now()}`,
    type: data.coupon_type || "base",
    title: "今日吃肉券",
    benefit: "全单 85 折",
    note: "满 88 元可用",
    expireText: "今日 23:59 前有效",
    status: "unused",
    code: String(Math.floor(1000000000 + Math.random() * 8999999999))
  };
  state.coupons.unshift(coupon);
  return coupon;
}

function generateAiCopy(data = {}) {
  const style = data.style || "高级日常";
  const feeling = data.feeling || "今天肉很新鲜";
  return aiCopyOptions.map((item, index) => ({
    ...item,
    content: index === 0 ? `${feeling} ${item.content}` : item.content,
    style
  }));
}

function createUploadToken(data = {}) {
  const filename = data.filename || `liaoke-${Date.now()}.jpg`;
  return {
    upload_url: "https://mock-upload.liaoke.local/upload",
    form_field: "file",
    form_data: {
      key: `mock/uploads/${filename}`,
      policy: "mock_policy",
      signature: "mock_signature"
    },
    file_url: `mock://uploads/${filename}`,
    object_key: `mock/uploads/${filename}`
  };
}

function mockRequest({ url, data = {} }) {
  switch (url) {
    case "/api/user/login":
      return ok({
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

    case "/api/store/detail":
    case "/api/qr/parse":
      return ok(state.store);

    case "/api/coupon/issue":
      return ok(createCoupon(data));

    case "/api/coupon/list": {
      const status = data.status || "unused";
      const list = state.coupons.filter((item) => item.status === status);
      return ok({ total: list.length, list });
    }

    case "/api/coupon/detail": {
      const coupon = state.coupons.find((item) => item.id === data.coupon_id || item.code === data.coupon_code);
      return coupon ? ok(coupon) : fail(40002, "优惠券不存在");
    }

    case "/api/upload/token":
      return ok(createUploadToken(data));

    case "/api/ai/text":
      return ok({ list: generateAiCopy(data) });

    case "/api/ai/image":
      return ok({ image_url: data.image_url || "", effect: data.effect || "warm" });

    case "/api/poster/generate": {
      const poster = {
        post_id: `POST${Date.now()}`,
        title: data.title || "高级日常",
        style: data.style || "高级日常",
        copy: data.copy || "今天这顿吊龙嫩到离谱，锅气和烟火气都刚刚好。",
        image_url: data.image_url || "",
        scene: `s=${state.store.id}&i=${state.member.id}&p=POST${Date.now()}`,
        qrcode_url: data.qrcode_url || "/assets/brand/png/liaoke-mark.png"
      };
      state.posters.unshift(poster);
      return ok(poster);
    }

    case "/api/merchant/verify/preview": {
      const coupon = state.coupons.find((item) => item.code === data.coupon_code);
      return coupon ? ok(coupon) : fail(40002, "优惠券不存在");
    }

    case "/api/coupon/verify": {
      const coupon = state.coupons.find((item) => item.code === data.coupon_code);
      if (!coupon) {
        return fail(40002, "优惠券不存在");
      }
      if (coupon.status !== "unused") {
        return fail(40003, "优惠券已使用");
      }
      coupon.status = "used";
      return ok({
        coupon,
        verified_at: new Date().toISOString(),
        referral_coupon: {
          triggered: true,
          coupon_id: `RFC${Date.now()}`,
          status: "pending",
          effective_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }

    case "/api/user/referral-coupons":
      return ok({
        pending: state.referralCoupons.filter((item) => item.status === "pending"),
        active: state.referralCoupons.filter((item) => item.status === "active"),
        used: state.referralCoupons.filter((item) => item.status === "used"),
        expired: state.referralCoupons.filter((item) => item.status === "expired")
      });

    case "/api/store/verify/referral-coupon": {
      const coupon = state.referralCoupons.find((item) => item.coupon_id === data.coupon_id);
      if (!coupon || ["used", "expired", "cancelled"].includes(coupon.status)) {
        return fail(8001, "该券不存在或已过期");
      }
      if (coupon.status === "pending") {
        return fail(8004, "该券明日起生效，请明天再来使用");
      }
      if (Number(data.order_amount || 0) < coupon.min_order_amount) {
        return fail(8002, `消费满${coupon.min_order_amount}元才可使用此券`);
      }
      coupon.status = "used";
      coupon.used_order_id = data.order_id || `ORD${Date.now()}`;
      coupon.used_time = new Date().toISOString();
      return ok({
        coupon_id: coupon.coupon_id,
        deduction_amount: coupon.face_value,
        order_amount: Number(data.order_amount || 0),
        final_amount: Number((Number(data.order_amount || 0) - coupon.face_value).toFixed(2)),
        status: coupon.status,
        used_time: coupon.used_time
      });
    }

    case "/api/points/account":
      return ok(state.pointsAccount);

    case "/api/points/transactions":
      return ok({
        page: data.page || 1,
        page_size: data.page_size || 20,
        total: state.pointsTransactions.length,
        list: state.pointsTransactions
      });

    case "/api/points/products":
      return ok({
        available_points: state.pointsAccount.available_points,
        list: state.pointsProducts.map((item) => ({
          ...item,
          can_redeem: state.pointsAccount.available_points >= item.points_price && item.stock_quantity !== 0
        }))
      });

    case "/api/points/redeem": {
      const product = state.pointsProducts.find((item) => item.product_id === data.product_id);
      if (!product || product.stock_quantity === 0) {
        return fail(9003, "积分商品不存在、已下架或售罄");
      }
      if (state.pointsAccount.available_points < product.points_price) {
        return fail(9002, "积分不足");
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
      return ok(redemption);
    }

    case "/api/points/redemptions":
      return ok({
        pending: state.pointsRedemptions.filter((item) => item.status === "pending"),
        used: state.pointsRedemptions.filter((item) => item.status === "used"),
        expired: state.pointsRedemptions.filter((item) => item.status === "expired")
      });

    case "/api/points/sign-in": {
      const key = `${data.store_id || state.store.id}:${data.member_id || state.member.id}:${new Date().toISOString().slice(0, 10)}`;
      if (state.pointsSignedDates[key]) {
        return fail(9007, "今日已签到");
      }
      const earned = state.pointsAccount.rules.sign_in_value;
      state.pointsSignedDates[key] = true;
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
      return ok({
        earned_points: earned,
        available_points: state.pointsAccount.available_points,
        signed_at: new Date().toISOString()
      });
    }

    case "/api/store/verify/points-redemption": {
      const redemption = state.pointsRedemptions.find((item) => item.redemption_code === data.redemption_code);
      if (!redemption || redemption.status !== "pending") {
        return fail(9005, "积分兑换码不存在或不可核销");
      }
      redemption.status = "used";
      redemption.used_time = new Date().toISOString();
      return ok({
        redemption_id: redemption.redemption_id,
        redemption_code: redemption.redemption_code,
        product_name: redemption.product_name,
        status: redemption.status,
        used_time: redemption.used_time
      });
    }

    case "/api/stats/daily":
      return ok(merchantStats);

    case "/api/stats/event":
    case "/api/invite/bind":
      return ok({ accepted: true });

    default:
      return fail(40400, `mock endpoint not found: ${url}`);
  }
}

function getState() {
  return clone(state);
}

module.exports = {
  mockRequest,
  getState
};
