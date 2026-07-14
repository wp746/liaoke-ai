export const SURFACES = ["customer", "merchant", "admin"];

const customer = [
  "entry-consent", "entry-unavailable", "home", "coupon-claim", "benefits",
  "coupon-code", "ai-create", "ai-progress", "ai-select", "poster-preview",
  "balance", "deduction-code", "points", "points-store", "points-product",
  "points-redemption", "referrals", "member-level", "me", "privacy-data",
];
const merchant = [
  "merchant-login", "merchant-dashboard", "verify-hub", "verify-scan", "verify-manual",
  "verify-confirm", "verify-result", "verify-history", "members", "member-detail",
  "activities", "activity-editor", "benefit-policy", "points-products", "points-product-editor",
  "points-rules", "employees", "store-settings", "merchant-plan", "merchant-export",
];
const admin = [
  "admin-login", "admin-overview", "stores", "store-editor", "store-detail", "table-codes",
  "benefit-templates", "ai-quota", "ai-failures", "prompt-versions", "keywords",
  "risk-center", "contracts", "export-audit", "platform-accounts", "system-logs",
];

const titles = {
  "entry-consent": "登录与协议", "entry-unavailable": "门店不可用", home: "首页",
  "coupon-claim": "领取权益", benefits: "权益中心", "coupon-code": "券码详情",
  "ai-create": "AI 创作", "ai-progress": "AI 生成中", "ai-select": "选择效果",
  "poster-preview": "海报预览", balance: "返现余额", "deduction-code": "余额抵扣码",
  points: "我的积分", "points-store": "积分商城", "points-product": "商品详情",
  "points-redemption": "兑换码", referrals: "邀请记录", "member-level": "等级权益",
  me: "我的", "privacy-data": "隐私与数据权利",
  "merchant-login": "商家登录", "merchant-dashboard": "今日经营", "verify-hub": "核销工作台",
  "verify-scan": "扫码核销", "verify-manual": "手动核销", "verify-confirm": "核销确认",
  "verify-result": "核销结果", "verify-history": "核销记录", members: "会员列表",
  "member-detail": "会员 360°详情", activities: "活动列表", "activity-editor": "活动编辑",
  "benefit-policy": "返现与推荐策略", "points-products": "积分商品", "points-product-editor": "积分商品编辑",
  "points-rules": "积分规则", employees: "员工与权限", "store-settings": "门店设置",
  "merchant-plan": "套餐与续费", "merchant-export": "导出与商家账号",
  "admin-login": "后台登录", "admin-overview": "平台总览", stores: "门店列表",
  "store-editor": "创建与编辑门店", "store-detail": "门店 360°详情", "table-codes": "桌码中心",
  "benefit-templates": "权益预设模板", "ai-quota": "AI 配额", "ai-failures": "AI 失败任务",
  "prompt-versions": "提示词版本", keywords: "关键词与禁用词", "risk-center": "风险中心",
  contracts: "合同套餐与续费", "export-audit": "数据导出与审计", "platform-accounts": "平台账号",
  "system-logs": "管理日志与系统任务",
};

function definitions(surface, ids) {
  return ids.map((id) => ({ id, surface, title: titles[id], group: id.split("-")[0] }));
}

export const ROUTES = [
  ...definitions("customer", customer),
  ...definitions("merchant", merchant),
  ...definitions("admin", admin),
];
export const getRoutesForSurface = (surface) => ROUTES.filter((route) => route.surface === surface);
export const getRoute = (surface, routeId) => ROUTES.find((route) => route.surface === surface && route.id === routeId);
