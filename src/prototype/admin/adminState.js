const stores = [
  { id: "STORE001", name: "牛里牛气潮汕牛肉火锅", city: "广州·天河", type: "潮汕牛肉火锅", tableIp: "燎小星·吃肉星球", averageSpend: "126", plan: "pro", status: "active", logo: "liaoke-nxnq-logo.svg", brandColor: "#FF5A1F", members: "12,680", risk: "2 项", visits: "8,924", codeCount: "48", costRate: "8.6%" },
  { id: "STORE018", name: "薪火小馆·珠江新城", city: "广州·天河", type: "中式正餐", tableIp: "燎小星·小馆系列", averageSpend: "92", plan: "basic", status: "active", logo: "xinhua-logo.svg", brandColor: "#E9672D", members: "4,208", risk: "无", visits: "3,106", codeCount: "26", costRate: "7.2%" },
  { id: "STORE027", name: "岭南清汤牛肉", city: "佛山·禅城", type: "潮汕牛肉火锅", tableIp: "燎小星·清汤系列", averageSpend: "108", plan: "pro", status: "paused", logo: "lingnan-logo.svg", brandColor: "#C95F34", members: "7,916", risk: "1 项", visits: "4,782", codeCount: "32", costRate: "9.1%" },
];

const codes = [
  { table: "A12", id: "NXNQ-A12-0711", status: "active", scans: 286, storeId: "STORE001" },
  { table: "A13", id: "NXNQ-A13-0711", status: "active", scans: 194, storeId: "STORE001" },
  { table: "A14", id: "NXNQ-A14-0711", status: "active", scans: 173, storeId: "STORE001" },
];

export function createAdminState() {
  return {
    stores, selectedStoreId: "STORE001", codes, nextStoreSequence: 28, nextCodeSequence: 1, feedback: null,
    benefitTemplates: [
      { id: "coupon", name: "优惠券预设", rule: "满 100 元赠 20 元到店券", status: "active" },
      { id: "cashback", name: "返现预设", rule: "实付金额返 8% 权益余额", status: "active" },
      { id: "referral", name: "推荐奖励预设", rule: "好友到店后赠 10 元惊喜券", status: "active" },
      { id: "points", name: "积分预设", rule: "每消费 10 元积 1 分", status: "active" },
    ],
    aiQuota: [
      { store: "牛里牛气潮汕牛肉火锅", used: 862, budget: 1200, cost: "¥431.00" },
      { store: "薪火小馆·珠江新城", used: 318, budget: 500, cost: "¥159.00" },
      { store: "岭南清汤牛肉", used: 496, budget: 450, cost: "¥248.00" },
    ],
    aiFailures: [
      { id: "AI-20260710-038", store: "牛里牛气潮汕牛肉火锅", type: "图片生成", status: "failed", detail: "通义万相超时，已降级为文案海报", time: "2026-07-10 11:42" },
      { id: "AI-20260710-041", store: "岭南清汤牛肉", type: "文案生成", status: "failed", detail: "内容安全校验未通过，任务已终止", time: "2026-07-10 12:08" },
    ],
    promptVersions: [
      { version: "v3.3", status: "draft", owner: "王鹏", updatedAt: "2026-07-11 09:20" },
      { version: "v3.2", status: "active", owner: "王鹏", updatedAt: "2026-07-08 18:10" },
      { version: "v3.1", status: "retired", owner: "李然", updatedAt: "2026-06-22 15:30" },
    ],
    storeKeywords: ["鲜切牛肉", "现切现涮", "家庭聚餐"], forbiddenTerms: ["全网最低", "保证瘦身", "无限返现"],
    risks: [
      { kind: "员工自核销", store: "牛里牛气潮汕牛肉火锅", level: "高", status: "待处理" },
      { kind: "核销频率突增", store: "牛里牛气潮汕牛肉火锅", level: "高", status: "调查中" },
      { kind: "核销金额异常", store: "岭南清汤牛肉", level: "中", status: "待处理" },
      { kind: "AI 超预算", store: "岭南清汤牛肉", level: "中", status: "已通知" },
      { kind: "定时任务失败", store: "平台任务", level: "低", status: "等待重试" },
    ],
    contracts: [
      { store: "牛里牛气潮汕牛肉火锅", plan: "成长版 Pro", start: "2026-07-01", end: "2027-06-30", renewal: "已续费", owner: "陈佳", amount: "¥19,800" },
      { store: "薪火小馆·珠江新城", plan: "基础版", start: "2026-03-15", end: "2027-03-14", renewal: "待跟进", owner: "林远", amount: "¥9,800" },
    ],
    exportAudits: [
      { id: "EXP-0711-006", scope: "平台经营日报", actor: "王鹏", result: "已完成", time: "2026-07-11 10:15" },
      { id: "EXP-0710-018", scope: "STORE001 会员数据", actor: "陈佳", result: "已脱敏导出", time: "2026-07-10 17:42" },
    ],
    platformAccounts: [
      { name: "王鹏", role: "super_admin", scope: "全平台", status: "正常" },
      { name: "李然", role: "platform_admin", scope: "跨门店只读", status: "正常" },
    ],
    systemLogs: [
      { actor: "王鹏", role: "super_admin", store: "STORE001", operation: "更新门店套餐", result: "成功", time: "2026-07-11 10:26" },
      { actor: "李然", role: "platform_admin", store: "STORE027", operation: "查看风险详情", result: "成功", time: "2026-07-11 10:08" },
      { actor: "李然", role: "platform_admin", store: "STORE001", operation: "尝试更新 AI 配额", result: "权限拦截", time: "2026-07-11 09:54" },
    ],
  };
}

export function adminReducer(state, event) {
  if (event.type === "SELECT_STORE") return { ...state, selectedStoreId: event.storeId, feedback: null };
  if (event.actorRole !== "super_admin") return state;
  switch (event.type) {
    case "SAVE_STORE": {
      if (event.store.id) return { ...state, selectedStoreId: event.store.id, stores: state.stores.map((store) => store.id === event.store.id ? { ...store, ...event.store } : store), feedback: "门店资料已保存到当前原型会话。" };
      const id = `STORE${String(state.nextStoreSequence).padStart(3, "0")}`;
      const store = { ...event.store, id, city: event.store.city || "深圳·福田", members: "0", risk: "无", visits: "0", codeCount: "0", costRate: "0%" };
      return { ...state, stores: [...state.stores, store], selectedStoreId: id, nextStoreSequence: state.nextStoreSequence + 1, feedback: "门店资料已保存到当前原型会话。" };
    }
    case "GENERATE_CODES": {
      const existing = state.codes.filter((code) => code.storeId === event.storeId);
      const highestTable = existing.reduce((highest, code) => Math.max(highest, Number(code.table.replace(/\D/g, "")) || 0), 0);
      const additions = Array.from({ length: event.count }, (_, index) => {
        const table = `A${highestTable + index + 1}`;
        const sequence = state.nextCodeSequence + index;
        return { table, id: `NXNQ-${table}-NEW-${String(sequence).padStart(3, "0")}`, status: "active", scans: 0, storeId: event.storeId };
      });
      return { ...state, codes: [...state.codes, ...additions], nextCodeSequence: state.nextCodeSequence + event.count };
    }
    case "DEACTIVATE_CODE": return { ...state, codes: state.codes.map((code) => code.id === event.codeId ? { ...code, status: "disabled" } : code) };
    case "RETRY_AI_FAILURE": return { ...state, aiFailures: state.aiFailures.map((task) => task.id === event.taskId ? { ...task, status: "retrying" } : task), feedback: `任务 ${event.taskId} 已进入重试队列。` };
    case "TOGGLE_TEMPLATE": return { ...state, benefitTemplates: state.benefitTemplates.map((template) => template.id === event.templateId ? { ...template, status: template.status === "active" ? "paused" : "active" } : template), feedback: "权益预设状态已更新。" };
    case "ACTIVATE_PROMPT": return { ...state, promptVersions: state.promptVersions.map((prompt) => ({ ...prompt, status: prompt.version === event.version ? "active" : prompt.status === "active" ? "retired" : prompt.status })), feedback: `提示词 ${event.version} 已发布。` };
    case "COPY_PROMPT": {
      const source = state.promptVersions.find(({ version }) => version === event.version);
      if (!source) return state;
      return { ...state, promptVersions: [{ ...source, version: `${event.version}-副本`, status: "draft", updatedAt: "2026-07-11 14:40" }, ...state.promptVersions], feedback: `提示词 ${event.version} 已复制为草稿。` };
    }
    case "ADD_KEYWORD": {
      const value = event.value?.trim();
      if (!value) return state;
      const field = event.kind === "forbidden" ? "forbiddenTerms" : "storeKeywords";
      return { ...state, [field]: [...state[field], value], feedback: `${event.kind === "forbidden" ? "禁用词" : "门店关键词"}已添加。` };
    }
    default: return state;
  }
}
