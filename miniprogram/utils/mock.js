const mockStore = {
  id: "STORE001",
  name: "牛里牛气潮汕牛肉火锅",
  slogan: "吃肉的人终会相遇",
  tableName: "A12 桌",
  tableIpName: "AI 肉小签",
  activityEnabled: true,
  groupChatUrl: "https://example.com/group-guide",
  groupChatName: "牛里牛气会员福利群",
  groupJoinGuide: "进群领隐藏福利、生日券、新品试吃和工作日午市提醒。",
  groupQrImage: "/assets/brand/png/group-guide-demo-qr.png",
  groupEnabled: true,
  groupQrExpiresAt: "2026-12-31",
  groupAssistantName: "牛气群福利助手",
  groupWelcomeMessage: "欢迎进群。群内只发门店福利、新品和生日提醒，不刷屏。",
  keywords: ["潮汕牛肉火锅", "肉好实惠", "朋友聚餐"]
};

const mockMember = {
  id: "MEM202606270001",
  nickname: "新晋食肉搭子",
  level: "Lv.2 食肉达人",
  points: 128,
  avatarText: "燎"
};

const mockCoupons = [
  {
    id: "CPN202606270001",
    type: "base",
    title: "今日吃肉券",
    benefit: "全单 85 折",
    note: "满 88 元可用",
    expireText: "今日 23:59 前有效",
    status: "unused",
    code: "8827639401"
  },
  {
    id: "CPN202606270002",
    type: "reward",
    title: "老客奖励券",
    benefit: "手切嫩肉一份",
    note: "满 168 元可用",
    expireText: "2026-07-10 前有效",
    status: "unused",
    code: "6739012488"
  },
  {
    id: "CPN202606260003",
    type: "used",
    title: "朋友聚餐券",
    benefit: "饮品 2 杯",
    note: "已在 2026-06-26 使用",
    expireText: "已使用",
    status: "used",
    code: "5102387716"
  }
];

const aiCopyOptions = [
  {
    id: "copy_1",
    title: "高级日常",
    content: "今天这顿吊龙嫩到离谱，锅气和烟火气都刚刚好。朋友聚餐不用想太多，坐下开吃就对了。"
  },
  {
    id: "copy_2",
    title: "朋友安利",
    content: "这家偏一点，但肉真的值得跑一趟。点完一轮又追加一轮，属于吃完会认真收藏的火锅。"
  },
  {
    id: "copy_3",
    title: "小红书感",
    content: "被这口潮汕牛肉治愈了。鲜、嫩、热闹，还有一点刚刚好的松弛感。"
  }
];

const styleOptions = ["高级日常", "朋友安利", "小红书感", "烟火食刻"];

const mockRewards = [
  { id: "sign", title: "每日签到", points: "+10", cta: "去签到", done: false },
  { id: "poster", title: "生成海报", points: "+20", cta: "去创作", done: false },
  { id: "coupon", title: "使用吃肉券", points: "+15", cta: "去使用", done: true },
  { id: "invite", title: "邀请好友", points: "+30", cta: "去邀请", done: false }
];

const merchantStats = {
  scanCount: 42,
  issuedCount: 38,
  verifiedCount: 35,
  aiUsers: 18,
  posters: 7,
  newCustomers: 3,
  groupClicks: 12,
  records: [
    { time: "12:31", title: "今日吃肉券", amount: "¥256", status: "已核销" },
    { time: "12:44", title: "老客奖励券", amount: "手切嫩肉", status: "已核销" },
    { time: "13:08", title: "今日吃肉券", amount: "¥188", status: "已核销" }
  ]
};

module.exports = {
  mockStore,
  mockMember,
  mockCoupons,
  aiCopyOptions,
  styleOptions,
  mockRewards,
  merchantStats
};
