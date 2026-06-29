import {
  BadgePercent,
  Camera,
  Flame,
  Gift,
  Home,
  Image,
  MessageCircle,
  QrCode,
  Sparkles,
  Star,
  Ticket,
  UserRound,
  WandSparkles,
} from "lucide-react";

export const brandTokens = [
  { name: "Ember 600", value: "#FF4B1B" },
  { name: "Ember 500", value: "#FF6B1A" },
  { name: "Gold 400", value: "#F8B84D" },
  { name: "Cream 100", value: "#FFF8EC" },
  { name: "Ivory", value: "#F7F6F3" },
  { name: "Ink 900", value: "#1F1F23" },
  { name: "Ink 600", value: "#5F6068" },
  { name: "AI Cyan", value: "#00C2FF" },
];

export const screenTabs = [
  { id: "home", label: "首页", icon: Home },
  { id: "coupon", label: "吃肉券", icon: Ticket },
  { id: "create", label: "AI 创作", icon: WandSparkles },
  { id: "reward", label: "奖励", icon: Gift },
  { id: "me", label: "我的", icon: UserRound },
];

export const couponCards = [
  {
    title: "招牌五花肉免费券",
    note: "满 88 元可用",
    date: "有效期至 2026.06.01",
    image: "linear-gradient(135deg, #FF4B1B, #F8B84D)",
  },
  {
    title: "澳洲牛肉 8 折券",
    note: "满 128 元可用",
    date: "有效期至 2026.06.03",
    image: "linear-gradient(135deg, #C64122, #FF8A12)",
  },
  {
    title: "雪花肥牛免费券",
    note: "满 168 元可用",
    date: "有效期至 2026.06.05",
    image: "linear-gradient(135deg, #7A2219, #F8B84D)",
  },
];

export const quickActions = [
  { title: "AI 生成海报", icon: Sparkles },
  { title: "每日吃肉券", icon: BadgePercent },
  { title: "专属奖励", icon: Gift },
];

export const styles = [
  { label: "烟火食刻", active: true },
  { label: "质感大片" },
  { label: "漫画趣味" },
  { label: "简约清新" },
];

export const rewardTiles = [
  { label: "每日签到", points: "+10", icon: Star, cta: "去签到" },
  { label: "创作海报", points: "+20", icon: Image, cta: "去创作" },
  { label: "使用吃肉券", points: "+15", icon: Flame, cta: "去使用" },
];

export const viCards = [
  {
    title: "Logo 方向",
    body: "火星符号承接星火燎原，中文主名强化客流增长。",
    icon: Flame,
  },
  {
    title: "系统 IP",
    body: "燎小星是手机里的统一 AI 小助手，负责引导和奖励提醒。",
    icon: Sparkles,
  },
  {
    title: "桌牌 IP",
    body: "每店使用 AI × 小签，牛里牛气试点为 AI 肉小签。",
    icon: QrCode,
  },
  {
    title: "核心体验",
    body: "领券、AI 晒圈、海报保存、邀请奖励组成一条闭环。",
    icon: MessageCircle,
  },
];

export const posterCopy = [
  "今日份快乐，由肉治愈。",
  "这家偏一点，但肉真的值得跑一趟。",
  "吊龙嫩到离谱，钱包也很轻松。",
];
