import { fixtures } from "./fixtures.js";

export const EVENTS = [
  "ACCEPT_CONSENT", "CLAIM_COUPON", "START_AI", "ADVANCE_AI", "COMPLETE_AI",
  "CREATE_REFERRAL_COUPON", "ACTIVATE_REFERRAL_COUPON", "REDEEM_POINTS",
  "VERIFY_CODE", "PAUSE_STORE", "RESUME_STORE", "SET_ROLE",
];

export const SCENARIOS = [
  { id: "new-customer", label: "新顾客领券" },
  { id: "returning-customer", label: "老顾客复访" },
  { id: "points-verification", label: "积分礼品核销" },
];

function cloneFixtures() {
  return structuredClone(fixtures);
}

export function createScenarioState(scenarioId) {
  const data = cloneFixtures();
  const state = {
    scenarioId,
    role: scenarioId === "points-verification" ? "staff" : "owner",
    store: data.store,
    customer: data.customer,
    coupons: data.coupons,
    referralCoupons: scenarioId === "returning-customer" ? [
      { id: "RC-20260710-PENDING", status: "pending", value: 10 },
      { id: "RC-20260708-ACTIVE", status: "active", value: 10 },
      { id: "RC-20260701-USED", status: "used", value: 10 },
      { id: "RC-20260618-EXPIRED", status: "expired", value: 10 },
    ] : [],
    points: {
      balance: 1250,
      redemptions: [],
    },
    ai: {
      status: "idle",
      stage: "input",
    },
    verification: {
      status: "idle",
      code: null,
    },
    members: data.members,
    riskEvents: data.riskEvents,
  };

  if (scenarioId === "new-customer") {
    return {
      ...state,
      customer: { ...state.customer, consentAccepted: false },
      coupons: state.coupons.map((coupon, index) => index === 0 ? { ...coupon, status: "available" } : coupon),
    };
  }

  if (scenarioId === "points-verification") {
    return {
      ...state,
      verification: {
        status: "ready",
        code: "AB7X3K2Q",
        type: "points_redemption",
        productId: "drink-suanmei",
      },
    };
  }

  return state;
}

export function transition(state, event) {
  switch (event.type) {
    case "ACCEPT_CONSENT":
      return { ...state, customer: { ...state.customer, consentAccepted: true } };
    case "CLAIM_COUPON":
      return { ...state, coupons: state.coupons.map((coupon, index) => index === 0 ? { ...coupon, status: "active" } : coupon) };
    case "START_AI":
      if (event.outcome === "rejected") {
        return { ...state, ai: { status: "rejected", stage: "rejected", outcome: "rejected" } };
      }
      return {
        ...state,
        ai: {
          status: "processing",
          stage: "copy",
          outcome: event.outcome === "fallback" ? "fallback" : "done",
        },
      };
    case "ADVANCE_AI":
      if (state.ai.status !== "processing" || state.ai.stage !== "copy") return state;
      return { ...state, ai: { ...state.ai, stage: "image" } };
    case "COMPLETE_AI": {
      if (state.ai.status !== "processing" || state.ai.stage !== "image") return state;
      const outcome = event.fallback ? "fallback" : state.ai.outcome;
      return {
        ...state,
        ai: {
          status: outcome === "fallback" ? "fallback" : "done",
          stage: outcome === "fallback" ? "fallback" : "select",
          outcome: outcome === "fallback" ? "fallback" : "done",
        },
      };
    }
    case "CREATE_REFERRAL_COUPON":
      return { ...state, referralCoupons: [{ id: "RC-20260710-01", status: "pending", value: 10 }, ...state.referralCoupons] };
    case "ACTIVATE_REFERRAL_COUPON":
      return { ...state, referralCoupons: state.referralCoupons.map((coupon) => coupon.id === event.couponId ? { ...coupon, status: "active" } : coupon) };
    case "REDEEM_POINTS": {
      const product = fixtures.pointsProducts.find((item) => item.id === event.productId);
      if (!product) return { ...state, lastError: "POINTS_PRODUCT_MISSING" };
      const productRedemptions = state.points.redemptions.filter(({ productId }) => productId === product.id);
      if (productRedemptions.length >= product.stock) return { ...state, lastError: "POINTS_SOLD_OUT" };
      if (productRedemptions.length >= product.monthlyLimit) return { ...state, lastError: "POINTS_MONTHLY_LIMIT" };
      if (state.points.balance < product.points) return { ...state, lastError: "POINTS_INSUFFICIENT" };
      const ordinal = state.points.redemptions.length + 1;
      const redemption = {
        id: `PNT-20260710-${String(ordinal).padStart(2, "0")}`,
        code: `AB7X3K2${String.fromCharCode(80 + ordinal)}`,
        productId: product.id,
        status: "active",
      };
      return { ...state, lastError: null, points: { ...state.points, balance: state.points.balance - product.points, redemptions: [redemption, ...state.points.redemptions] } };
    }
    case "VERIFY_CODE":
      return { ...state, verification: { ...state.verification, status: event.result ?? "success", code: event.code } };
    case "PAUSE_STORE":
      return { ...state, store: { ...state.store, paused: true } };
    case "RESUME_STORE":
      return { ...state, store: { ...state.store, paused: false } };
    case "SET_ROLE":
      return { ...state, role: event.role };
    default:
      return state;
  }
}
