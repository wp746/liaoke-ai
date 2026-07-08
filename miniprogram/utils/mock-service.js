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
