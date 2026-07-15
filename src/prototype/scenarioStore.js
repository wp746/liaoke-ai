import { fixtures } from "./fixtures.js";

export const EVENTS = [
  "ACCEPT_CONSENT", "CLAIM_COUPON", "START_AI", "ADVANCE_AI", "COMPLETE_AI",
  "HYDRATE_AI_VARIANT",
  "CREATE_REFERRAL_COUPON", "ACTIVATE_REFERRAL_COUPON", "REDEEM_POINTS",
  "VERIFY_CODE", "PAUSE_STORE", "RESUME_STORE", "SET_ROLE",
  "UPDATE_ACTIVITY_DRAFT", "PUBLISH_ACTIVITY", "UPDATE_BENEFIT_POLICY", "SAVE_BENEFIT_POLICY",
  "UPDATE_POINTS_RULE", "SAVE_POINTS_RULES", "UPDATE_POINTS_PRODUCT_DRAFT", "SAVE_POINTS_PRODUCT",
  "UPDATE_PLATFORM_POINTS_GOVERNANCE", "SAVE_PLATFORM_POINTS_GOVERNANCE", "RESET_PLATFORM_POINTS_GOVERNANCE_DRAFT",
  "UPDATE_PRIVATE_GROUP_DRAFT", "SAVE_PRIVATE_GROUP", "RESET_PRIVATE_GROUP_DRAFT", "TRACK_GROUP_EVENT",
  "ADD_EMPLOYEE", "UPDATE_EMPLOYEE_ROLE", "REMOVE_EMPLOYEE", "RENEW_PLAN", "UPGRADE_PLAN",
  "SUBMIT_EXPORT", "PROCESS_EXPORT", "COMPLETE_EXPORT", "FAIL_EXPORT",
  "UPDATE_EXPORT_TYPE", "RETRY_EXPORT", "RESET_BENEFIT_POLICY_DRAFT", "RESET_POINTS_RULES_DRAFT",
];

export const SCENARIOS = [
  { id: "new-customer", label: "新顾客领券" },
  { id: "returning-customer", label: "老顾客复访" },
  { id: "points-verification", label: "积分礼品核销" },
];

function cloneFixtures() {
  return structuredClone(fixtures);
}

const activityTemplateIds = new Set(["referral", "birthday", "weekday", "share"]);
const benefitRanges = {
  cashbackRate: [3, 15, "消费返现比例必须在 3%–15% 之间"],
  referralValue: [5, 20, "老带新抵扣券面值必须在 5–20 元之间"],
  monthlyLimit: [1, 20, "每人每月领取上限必须在 1–20 张之间"],
  newCustomerValue: [0, 30, "新客首单优惠券面值必须在 0–30 元之间"],
  costAlert: [1, 100, "成本预警阈值必须在 1%–100% 之间"],
};
const defaultPointsGovernance = {
  enabled: true,
  defaultSpend: 10,
  defaultCheckIn: 5,
  defaultAiShare: 50,
  defaultProfile: 100,
  defaultBirthday: 200,
  defaultExpiryDays: 365,
  maxSpend: 20,
  maxCheckIn: 20,
  maxAiShare: 100,
  maxProfile: 300,
  maxBirthday: 500,
  minProductPoints: 100,
  maxProductPoints: 5000,
  maxMonthlyLimit: 5,
};
const pointsRuleLimitFields = {
  spend: "maxSpend",
  checkIn: "maxCheckIn",
  aiShare: "maxAiShare",
  profile: "maxProfile",
  birthday: "maxBirthday",
};

function operationsFeedback(state, feedback, feedbackKind = "success") {
  return { ...state, operations: { ...state.operations, feedback, feedbackKind } };
}

function ownerMutation(state, event, mutate) {
  if (event.actorRole !== "owner") return operationsFeedback(state, "仅老板可执行此操作", "error");
  return mutate();
}

function pointsProductMutation(state, event, mutate) {
  if (!["owner", "manager"].includes(event.actorRole)) return operationsFeedback(state, "仅老板或店长可管理积分商品", "error");
  return mutate();
}

function platformFeedback(state, feedback, feedbackKind = "success") {
  return { ...state, platform: { ...state.platform, feedback, feedbackKind } };
}

function validatePointsGovernance(governance) {
  const numericFields = Object.entries(governance).filter(([field]) => !["enabled", "defaultExpiryDays"].includes(field));
  if (numericFields.some(([, value]) => !Number.isFinite(Number(value)) || Number(value) < 0)) return "积分治理参数必须是非负数";
  if (![90, 180, 365, "forever"].includes(governance.defaultExpiryDays)) return "请选择有效的默认积分有效期";
  for (const [defaultField, maxField] of [
    ["defaultSpend", "maxSpend"],
    ["defaultCheckIn", "maxCheckIn"],
    ["defaultAiShare", "maxAiShare"],
    ["defaultProfile", "maxProfile"],
    ["defaultBirthday", "maxBirthday"],
  ]) {
    if (Number(governance[defaultField]) > Number(governance[maxField])) return "平台默认值不能高于商家调整上限";
  }
  if (Number(governance.minProductPoints) < 1 || Number(governance.minProductPoints) > Number(governance.maxProductPoints)) return "商品积分下限必须小于或等于上限";
  if (Number(governance.maxMonthlyLimit) < 1) return "每人每月限兑上限不能小于 1";
  return null;
}

function updateExportTask(state, taskId, allowedStatus, status) {
  const current = state.operations.exportTasks.find((task) => task.id === taskId);
  if (!current || current.status !== allowedStatus) return state;
  return {
    ...state,
    operations: {
      ...state.operations,
      exportTasks: state.operations.exportTasks.map((task) => task.id === taskId ? { ...task, status } : task),
    },
  };
}

function addPlanYear(expireDate) {
  const [year, month, day] = expireDate.split("-").map(Number);
  return `${year + 1}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysFromPrototypeDate(expireDate) {
  const prototypeToday = Date.UTC(2026, 6, 11);
  const [year, month, day] = expireDate.split("-").map(Number);
  return Math.ceil((Date.UTC(year, month - 1, day) - prototypeToday) / 86_400_000);
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
    platform: {
      pointsGovernance: structuredClone(defaultPointsGovernance),
      pointsGovernanceDraft: structuredClone(defaultPointsGovernance),
      feedback: null,
      feedbackKind: null,
    },
    points: {
      balance: 1250,
      redemptions: [],
      transactions: [
        { id: "PTX-SIGN-20260710", type: "sign_in", title: "每日签到", amount: 5, balanceBefore: 1245, balanceAfter: 1250, occurredAt: "今天 09:18" },
        { id: "PTX-ORDER-20260709", type: "consume_earn", title: "到店消费", amount: 120, balanceBefore: 1125, balanceAfter: 1245, occurredAt: "07-09" },
      ],
    },
    ai: {
      status: "idle",
      stage: "input",
    },
    verification: {
      status: "idle",
      code: null,
      records: [
        { code: "AB7X3K2H", type: "points_redemption", item: "酸梅汤一杯", value: "500 积分", verifierRole: "staff", verifierName: "李店员", timestamp: "2026-07-11 14:32:08", status: "success" },
        { code: "RC-20260711-0019", type: "referral_coupon", item: "老带新抵扣券", value: "¥10", verifierRole: "manager", verifierName: "陈店长", timestamp: "2026-07-11 13:18:22", status: "success" },
      ],
    },
    members: data.members,
    riskEvents: data.riskEvents,
    operations: {
      activityDraft: { templateId: "referral", title: "老带新奖励", description: "配置抵扣券面值、有效期和每月上限" },
      activities: [],
      benefitPolicy: { cashbackRate: 8, referralValue: 10, validityDays: 30, monthlyLimit: 10, newCustomerValue: 10, costAlert: 12 },
      benefitPolicyDraft: { cashbackRate: 8, referralValue: 10, validityDays: 30, monthlyLimit: 10, newCustomerValue: 10, costAlert: 12 },
      pointsRules: { enabled: true, spend: 10, checkIn: 5, aiShare: 50, profile: 100, birthday: 200, expiryDays: 365 },
      pointsRulesDraft: { enabled: true, spend: 10, checkIn: 5, aiShare: 50, profile: 100, birthday: 200, expiryDays: 365 },
      pointsProductDraft: { name: "酸梅汤一杯", image: "https://example.com/suanmei.jpg", category: "饮品", points: 500, stock: 99, monthlyLimit: 2, active: true },
      pointsProducts: data.pointsProducts.map((product) => ({ ...product, active: true })),
      privateGroup: structuredClone(data.store.privateGroup),
      privateGroupDraft: structuredClone(data.store.privateGroup),
      groupStats: { pageViews: 18, joinClicks: 12, linkCopies: 7, assistantRequests: 2, confirmedJoins: 8 },
      employees: [
        { id: "EMP-OWNER", name: "王老板", role: "owner", lastLogin: "2026-07-11 09:08" },
        { id: "EMP-MANAGER", name: "陈店长", role: "manager", lastLogin: "2026-07-11 13:18" },
        { id: "EMP-STAFF", name: "李店员", role: "staff", lastLogin: "2026-07-11 14:32" },
      ],
      plan: { name: "成长版 Pro", price: 399, expireDate: "2027-06-30", remainingDays: 354 },
      exportTasks: [{ id: "EXP-20260711-000", type: "operation", status: "failed", createdAt: "2026-07-11 14:20:00" }],
      exportDraftType: "operation",
      nextExportSequence: 1,
      feedback: null,
      feedbackKind: null,
    },
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
        ...state.verification,
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
    case "HYDRATE_AI_VARIANT": {
      const variants = {
        copy: { status: "processing", stage: "copy", outcome: "done" },
        image: { status: "processing", stage: "image", outcome: "done" },
        fallback: { status: "fallback", stage: "fallback", outcome: "fallback" },
        rejected: { status: "rejected", stage: "rejected", outcome: "rejected" },
      };
      return variants[event.variant] ? { ...state, ai: variants[event.variant] } : state;
    }
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
      if (!state.platform.pointsGovernance.enabled) return { ...state, lastError: "POINTS_PLATFORM_PAUSED" };
      if (!state.operations.pointsRules.enabled) return { ...state, lastError: "POINTS_STORE_PAUSED" };
      const product = state.operations.pointsProducts.find((item) => item.id === event.productId);
      if (!product) return { ...state, lastError: "POINTS_PRODUCT_MISSING" };
      if (!product.active) return { ...state, lastError: "POINTS_PRODUCT_INACTIVE" };
      const productRedemptions = state.points.redemptions.filter(({ productId, status }) => productId === product.id && ["active", "used"].includes(status));
      if (product.stock <= 0) return { ...state, lastError: "POINTS_SOLD_OUT" };
      if (productRedemptions.length >= product.monthlyLimit) return { ...state, lastError: "POINTS_MONTHLY_LIMIT" };
      if (state.points.balance < product.points) return { ...state, lastError: "POINTS_INSUFFICIENT" };
      const ordinal = state.points.redemptions.length + 1;
      const balanceAfter = state.points.balance - product.points;
      const redemption = {
        id: `PNT-20260710-${String(ordinal).padStart(2, "0")}`,
        code: `AB7X3K2${String.fromCharCode(80 + ordinal)}`,
        productId: product.id,
        status: "active",
      };
      const transaction = {
        id: `PTX-${redemption.id}`,
        type: "redemption",
        title: `兑换${product.name}`,
        amount: -product.points,
        balanceBefore: state.points.balance,
        balanceAfter,
        redemptionId: redemption.id,
        occurredAt: "2026-07-10 14:32",
      };
      return {
        ...state,
        lastError: null,
        operations: {
          ...state.operations,
          pointsProducts: state.operations.pointsProducts.map((item) => item.id === product.id ? { ...item, stock: item.stock - 1 } : item),
        },
        points: {
          ...state.points,
          balance: balanceAfter,
          redemptions: [redemption, ...state.points.redemptions],
          transactions: [transaction, ...(state.points.transactions ?? [])],
        },
      };
    }
    case "VERIFY_CODE": {
      const records = state.verification.records ?? [];
      const matchingRedemption = state.points.redemptions.find(({ code }) => code === event.code);
      const duplicate = (event.result ?? "success") === "success" && (
        records.some((record) => record.code === event.code && record.status === "success")
        || (event.verificationType === "points_redemption" && matchingRedemption?.status === "used")
      );
      const status = duplicate ? "duplicate" : event.result ?? "success";
      const record = status === "success" ? {
        code: event.code,
        type: event.verificationType,
        item: event.item,
        value: event.value,
        verifierRole: event.verifierRole,
        verifierName: event.verifierName,
        timestamp: event.timestamp,
        status,
      } : null;
      const redemptions = event.verificationType === "points_redemption" && status === "success"
        ? state.points.redemptions.map((redemption) => redemption.code === event.code && redemption.status === "active"
          ? { ...redemption, status: "used", verifierRole: event.verifierRole, verifierName: event.verifierName, usedAt: event.timestamp }
          : redemption)
        : state.points.redemptions;
      return {
        ...state,
        points: { ...state.points, redemptions },
        verification: { ...state.verification, status, code: event.code, records: record ? [record, ...records] : records },
      };
    }
    case "UPDATE_ACTIVITY_DRAFT":
      return ownerMutation(state, event, () => {
        if (event.field === "templateId" && !activityTemplateIds.has(event.value)) return operationsFeedback(state, "请选择有效的活动模板", "error");
        return { ...state, operations: { ...state.operations, activityDraft: { ...state.operations.activityDraft, [event.field]: event.value }, feedback: null, feedbackKind: null } };
      });
    case "PUBLISH_ACTIVITY":
      return ownerMutation(state, event, () => {
        const draft = state.operations.activityDraft;
        if (!draft.title.trim() || !draft.description.trim()) return operationsFeedback(state, "活动标题和配置说明不能为空", "error");
        const activity = { ...draft, id: `ACT-${String(state.operations.activities.length + 1).padStart(3, "0")}`, status: "published" };
        return { ...state, operations: { ...state.operations, activities: [activity, ...state.operations.activities], feedback: "活动已发布", feedbackKind: "success" } };
      });
    case "UPDATE_BENEFIT_POLICY":
      return ownerMutation(state, event, () => {
        if (event.field === "validityDays") {
          if (![30, 45, 60].includes(Number(event.value))) return operationsFeedback(state, "抵扣券有效期只能选择 30/45/60 天", "error");
        } else {
          const [min, max, message] = benefitRanges[event.field] ?? [];
          if (!Number.isFinite(Number(event.value)) || Number(event.value) < min || Number(event.value) > max) return operationsFeedback(state, message ?? "权益策略参数无效", "error");
        }
        return { ...state, operations: { ...state.operations, benefitPolicyDraft: { ...state.operations.benefitPolicyDraft, [event.field]: Number(event.value) }, feedback: null, feedbackKind: null } };
      });
    case "SAVE_BENEFIT_POLICY":
      return ownerMutation(state, event, () => ({ ...state, operations: { ...state.operations, benefitPolicy: { ...state.operations.benefitPolicyDraft }, feedback: "权益策略已保存", feedbackKind: "success" } }));
    case "RESET_BENEFIT_POLICY_DRAFT":
      return ownerMutation(state, event, () => ({ ...state, operations: { ...state.operations, benefitPolicyDraft: { ...state.operations.benefitPolicy }, feedback: null, feedbackKind: null } }));
    case "UPDATE_POINTS_RULE":
      return ownerMutation(state, event, () => {
        if (event.field === "enabled") {
          if (typeof event.value !== "boolean") return operationsFeedback(state, "积分开关状态无效", "error");
          return { ...state, operations: { ...state.operations, pointsRulesDraft: { ...state.operations.pointsRulesDraft, enabled: event.value }, feedback: null, feedbackKind: null } };
        }
        if (event.field === "expiryDays") {
          if (![90, 180, 365, "forever"].includes(event.value)) return operationsFeedback(state, "请选择有效的积分有效期", "error");
        } else {
          if (!Number.isFinite(Number(event.value)) || Number(event.value) < 0) return operationsFeedback(state, "积分值不能小于 0", "error");
          const limit = state.platform.pointsGovernance[pointsRuleLimitFields[event.field]];
          if (limit !== undefined && Number(event.value) > Number(limit)) return operationsFeedback(state, `该积分值不能高于平台上限 ${limit}`, "error");
        }
        const value = event.field === "expiryDays" ? event.value : Number(event.value);
        return { ...state, operations: { ...state.operations, pointsRulesDraft: { ...state.operations.pointsRulesDraft, [event.field]: value }, feedback: null, feedbackKind: null } };
      });
    case "SAVE_POINTS_RULES":
      return ownerMutation(state, event, () => ({ ...state, operations: { ...state.operations, pointsRules: { ...state.operations.pointsRulesDraft }, feedback: "积分规则已保存", feedbackKind: "success" } }));
    case "RESET_POINTS_RULES_DRAFT":
      return ownerMutation(state, event, () => ({ ...state, operations: { ...state.operations, pointsRulesDraft: { ...state.operations.pointsRules }, feedback: null, feedbackKind: null } }));
    case "UPDATE_POINTS_PRODUCT_DRAFT":
      return pointsProductMutation(state, event, () => {
        const minimums = { points: 1, stock: 0, monthlyLimit: 1 };
        if (event.field in minimums && (!Number.isFinite(Number(event.value)) || Number(event.value) < minimums[event.field])) return operationsFeedback(state, `${event.field === "points" ? "所需积分" : event.field === "stock" ? "库存" : "每人每月上限"}不能小于 ${minimums[event.field]}`, "error");
        if (event.field === "points" && (Number(event.value) < state.platform.pointsGovernance.minProductPoints || Number(event.value) > state.platform.pointsGovernance.maxProductPoints)) return operationsFeedback(state, `所需积分必须在平台范围 ${state.platform.pointsGovernance.minProductPoints}–${state.platform.pointsGovernance.maxProductPoints}`, "error");
        if (event.field === "monthlyLimit" && Number(event.value) > state.platform.pointsGovernance.maxMonthlyLimit) return operationsFeedback(state, `每人每月上限不能高于平台上限 ${state.platform.pointsGovernance.maxMonthlyLimit}`, "error");
        const value = event.field in minimums ? Number(event.value) : event.value;
        return { ...state, operations: { ...state.operations, pointsProductDraft: { ...state.operations.pointsProductDraft, [event.field]: value }, feedback: null, feedbackKind: null } };
      });
    case "SAVE_POINTS_PRODUCT":
      return pointsProductMutation(state, event, () => {
        const draft = state.operations.pointsProductDraft;
        if (!draft.name.trim() || !draft.image.trim()) return operationsFeedback(state, "商品名称和图片不能为空", "error");
        const product = { ...draft, id: `merchant-product-${state.operations.pointsProducts.length + 1}` };
        return { ...state, operations: { ...state.operations, pointsProducts: [...state.operations.pointsProducts, product], feedback: "积分商品已保存", feedbackKind: "success" } };
      });
    case "UPDATE_PLATFORM_POINTS_GOVERNANCE":
      if (event.actorRole !== "super_admin") return state;
      return {
        ...state,
        platform: {
          ...state.platform,
          pointsGovernanceDraft: { ...state.platform.pointsGovernanceDraft, [event.field]: event.value },
          feedback: null,
          feedbackKind: null,
        },
      };
    case "SAVE_PLATFORM_POINTS_GOVERNANCE": {
      if (event.actorRole !== "super_admin") return state;
      const error = validatePointsGovernance(state.platform.pointsGovernanceDraft);
      if (error) return platformFeedback(state, error, "error");
      return {
        ...state,
        platform: {
          ...state.platform,
          pointsGovernance: { ...state.platform.pointsGovernanceDraft },
          feedback: "积分治理规则已发布",
          feedbackKind: "success",
        },
      };
    }
    case "RESET_PLATFORM_POINTS_GOVERNANCE_DRAFT":
      if (event.actorRole !== "super_admin") return state;
      return {
        ...state,
        platform: {
          ...state.platform,
          pointsGovernanceDraft: { ...state.platform.pointsGovernance },
          feedback: null,
          feedbackKind: null,
        },
      };
    case "UPDATE_PRIVATE_GROUP_DRAFT":
      return ownerMutation(state, event, () => {
        const value = event.field === "enabled" ? Boolean(event.value) : String(event.value ?? "");
        return {
          ...state,
          operations: {
            ...state.operations,
            privateGroupDraft: { ...state.operations.privateGroupDraft, [event.field]: value },
            feedback: null,
            feedbackKind: null,
          },
        };
      });
    case "SAVE_PRIVATE_GROUP":
      return ownerMutation(state, event, () => {
        const draft = state.operations.privateGroupDraft;
        if (!draft.name.trim() || !draft.guide.trim()) return operationsFeedback(state, "群名称和入群说明不能为空", "error");
        if (draft.name.trim().length > 24 || draft.guide.trim().length > 60) return operationsFeedback(state, "群名称最多 24 字，入群说明最多 60 字", "error");
        if (draft.enabled && (!/^https:\/\//.test(draft.joinUrl) || !draft.qrExpiresAt.trim())) return operationsFeedback(state, "启用私域群前请配置 HTTPS 入群链接和活码有效期", "error");
        if (draft.qrImage && !/^(https:\/\/|\/)/.test(draft.qrImage)) return operationsFeedback(state, "群二维码必须使用 HTTPS 地址或站内资源", "error");
        return {
          ...state,
          operations: {
            ...state.operations,
            privateGroup: { ...draft },
            feedback: "私域群配置已保存",
            feedbackKind: "success",
          },
        };
      });
    case "RESET_PRIVATE_GROUP_DRAFT":
      return ownerMutation(state, event, () => ({
        ...state,
        operations: {
          ...state.operations,
          privateGroupDraft: { ...state.operations.privateGroup },
          feedback: null,
          feedbackKind: null,
        },
      }));
    case "TRACK_GROUP_EVENT": {
      const fieldByEvent = {
        page_view: "pageViews",
        join_click: "joinClicks",
        link_copy: "linkCopies",
        assistant_request: "assistantRequests",
        join_confirmed: "confirmedJoins",
      };
      const field = fieldByEvent[event.eventName];
      if (!field) return state;
      return {
        ...state,
        operations: {
          ...state.operations,
          groupStats: { ...state.operations.groupStats, [field]: state.operations.groupStats[field] + 1 },
        },
      };
    }
    case "ADD_EMPLOYEE":
      return ownerMutation(state, event, () => {
        const employee = { id: `EMP-INVITE-${state.operations.employees.length + 1}`, name: "待绑定员工", role: "staff", lastLogin: "尚未登录" };
        return { ...state, operations: { ...state.operations, employees: [...state.operations.employees, employee], feedback: "员工邀请已创建", feedbackKind: "success" } };
      });
    case "UPDATE_EMPLOYEE_ROLE":
      return ownerMutation(state, event, () => {
        if (!["manager", "staff"].includes(event.role)) return operationsFeedback(state, "员工角色只能设为店长或店员", "error");
        const target = state.operations.employees.find(({ id }) => id === event.employeeId);
        if (!target || target.role === "owner") return operationsFeedback(state, "老板账号受保护，不能修改角色", "error");
        return { ...state, operations: { ...state.operations, employees: state.operations.employees.map((employee) => employee.id === event.employeeId ? { ...employee, role: event.role } : employee), feedback: "员工角色已更新", feedbackKind: "success" } };
      });
    case "REMOVE_EMPLOYEE":
      return ownerMutation(state, event, () => ({ ...state, operations: { ...state.operations, employees: state.operations.employees.filter((employee) => employee.id !== event.employeeId || employee.role === "owner"), feedback: "员工已移除", feedbackKind: "success" } }));
    case "RENEW_PLAN":
      return ownerMutation(state, event, () => {
        const expireDate = addPlanYear(state.operations.plan.expireDate);
        return { ...state, operations: { ...state.operations, plan: { ...state.operations.plan, expireDate, remainingDays: daysFromPrototypeDate(expireDate) }, feedback: "已续费 1 年", feedbackKind: "success" } };
      });
    case "UPGRADE_PLAN":
      return ownerMutation(state, event, () => ({ ...state, operations: { ...state.operations, plan: { ...state.operations.plan, name: "旗舰版 Enterprise", price: 699 }, feedback: "套餐已升级", feedbackKind: "success" } }));
    case "SUBMIT_EXPORT":
      return ownerMutation(state, event, () => {
        if (!["members", "activity", "operation"].includes(event.exportType)) return operationsFeedback(state, "请选择有效的报表类型", "error");
        const sequence = state.operations.nextExportSequence;
        const task = { id: `EXP-20260711-${String(sequence).padStart(3, "0")}`, type: event.exportType, status: "queued", createdAt: "2026-07-11 14:40:00" };
        return { ...state, operations: { ...state.operations, exportTasks: [task, ...state.operations.exportTasks], nextExportSequence: sequence + 1, feedback: null, feedbackKind: null } };
      });
    case "UPDATE_EXPORT_TYPE":
      return ownerMutation(state, event, () => ["members", "activity", "operation"].includes(event.exportType)
        ? { ...state, operations: { ...state.operations, exportDraftType: event.exportType, feedback: null, feedbackKind: null } }
        : operationsFeedback(state, "请选择有效的报表类型", "error"));
    case "PROCESS_EXPORT":
      return ownerMutation(state, event, () => updateExportTask(state, event.taskId, "queued", "processing"));
    case "COMPLETE_EXPORT":
      return ownerMutation(state, event, () => updateExportTask(state, event.taskId, "processing", "ready"));
    case "FAIL_EXPORT":
      return ownerMutation(state, event, () => updateExportTask(state, event.taskId, "processing", "failed"));
    case "RETRY_EXPORT":
      return ownerMutation(state, event, () => updateExportTask(state, event.taskId, "failed", "queued"));
    case "PAUSE_STORE":
      return event.actorRole === "owner" ? { ...state, store: { ...state.store, paused: true } } : state;
    case "RESUME_STORE":
      return event.actorRole === "owner" ? { ...state, store: { ...state.store, paused: false } } : state;
    case "SET_ROLE":
      return { ...state, role: event.role };
    default:
      return state;
  }
}
