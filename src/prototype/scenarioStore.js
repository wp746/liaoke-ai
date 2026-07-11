import { fixtures } from "./fixtures.js";

export const EVENTS = [
  "ACCEPT_CONSENT", "CLAIM_COUPON", "START_AI", "COMPLETE_AI",
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
      return { ...state, ai: { ...state.ai, status: "processing", stage: "copy" } };
    case "COMPLETE_AI":
      return { ...state, ai: { ...state.ai, status: event.fallback ? "fallback" : "done", stage: "poster" } };
    case "CREATE_REFERRAL_COUPON":
      return { ...state, referralCoupons: [{ id: "RC-20260710-01", status: "pending", value: 10 }, ...state.referralCoupons] };
    case "ACTIVATE_REFERRAL_COUPON":
      return { ...state, referralCoupons: state.referralCoupons.map((coupon) => coupon.id === event.couponId ? { ...coupon, status: "active" } : coupon) };
    case "REDEEM_POINTS": {
      const product = fixtures.pointsProducts.find((item) => item.id === event.productId);
      if (!product || state.points.balance < product.points) return { ...state, lastError: "POINTS_INSUFFICIENT" };
      const redemption = { id: "PNT-20260710-01", code: "AB7X3K2Q", productId: product.id, status: "active" };
      return { ...state, points: { ...state.points, balance: state.points.balance - product.points, redemptions: [redemption, ...state.points.redemptions] } };
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
