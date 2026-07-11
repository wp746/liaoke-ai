import React, { useState } from "react";
import { ChevronRight, Coins, Gift, ShieldCheck, UserRound } from "lucide-react";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";

const categories = ["热门", "饮品", "小菜", "小吃", "服务"];
const ledger = [
  ["每日签到", "+5", "今天 09:18"],
  ["到店消费", "+120", "07-09"],
  ["兑换酸梅汤", "-500", "06-28"],
];

export function Points({ state, onNavigate }) {
  return <main className="customer-page"><header className="customer-page__header"><span>我的积分</span><h1>{state.points.balance.toLocaleString()}</h1></header><SurfaceCard tone="warm"><Coins size={25}/><strong>每日签到 +5 积分</strong><p>今天已签到，连续签到还能点亮更多奖励。</p><PrimaryButton onClick={() => onNavigate("points-store")}>逛积分商城</PrimaryButton></SurfaceCard><h2>积分明细</h2><section className="customer-list">{ledger.map(([title, amount, date]) => <article className="customer-referral-record" key={title}><span><strong>{title}</strong><small>{date}</small></span><b>{amount}</b></article>)}</section></main>;
}

export function PointsStore({ state, products, onSelect, onNavigate }) {
  const [category, setCategory] = useState("热门");
  const visible = category === "热门" ? products : products.filter((p) => p.category === category);
  return <main className="customer-page"><header className="customer-page__header"><span>可用积分 {state.points.balance.toLocaleString()}</span><h1>积分商城</h1></header><div className="customer-segment" role="tablist" aria-label="礼品分类" style={{gridTemplateColumns:"repeat(5,1fr)"}}>{categories.map((item) => <button type="button" role="tab" aria-selected={category === item} className={category === item ? "is-active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><section className="customer-list">{visible.map((product) => { const insufficient = state.points.balance < product.points; return <article className="customer-coupon" key={product.id}><span className="customer-coupon__value"><Gift size={22}/></span><span><strong>{product.name}</strong><small>{product.points.toLocaleString()} 积分 · 库存 {product.stock} · 每月限兑 {product.monthlyLimit} 次</small></span><button type="button" aria-label={`查看${product.name}`} disabled={insufficient} onClick={() => { onSelect(product.id); onNavigate("points-product"); }}>{insufficient ? "积分不足" : <ChevronRight size={17}/>}</button></article>; })}{visible.length === 0 && <p className="customer-empty-copy">该分类礼品即将上新</p>}</section></main>;
}

export function PointsProduct({ product, state, onNavigate }) {
  if (!product) return <PointsStore state={state} products={[]} onSelect={() => {}} onNavigate={onNavigate}/>;
  const disabled = state.points.balance < product.points;
  return <main className="customer-page"><button className="customer-text-button" type="button" onClick={() => onNavigate("points-store")}>返回积分商城</button><SurfaceCard tone="warm"><Gift size={30}/><h1>{product.name}</h1><strong>{product.points.toLocaleString()} 积分</strong><p>库存 {product.stock} · 每月限兑 {product.monthlyLimit} 次。兑换后请向门店出示核销码。</p><PrimaryButton disabled={disabled} onClick={() => onNavigate("points-redemption")}>{disabled ? "积分不足" : "立即兑换"}</PrimaryButton></SurfaceCard></main>;
}

export function PointsRedemption({ product, state, dispatch }) {
  const [confirmed, setConfirmed] = useState(false);
  const redemption = state.points.redemptions[0];
  if (confirmed || redemption) return <main className="customer-page customer-claim"><StatusPill status="success">兑换成功</StatusPill><h1>{product?.name ?? "积分礼品"}已兑换</h1><p>到店出示下方兑换码，店员核销后即可领取。</p><strong className="customer-code">{redemption?.code ?? "AB7X3K2Q"}</strong></main>;
  return <main className="customer-page"><header className="customer-page__header"><span>确认兑换</span><h1>{product?.name ?? "酸梅汤一杯"}</h1></header><SurfaceCard tone="warm"><strong>将消耗 {product?.points ?? 500} 积分</strong><p>兑换后积分将立即扣除，礼品每月限兑 {product?.monthlyLimit ?? 2} 次。</p><PrimaryButton onClick={() => { dispatch({type:"REDEEM_POINTS", productId: product?.id ?? "drink-suanmei"}); setConfirmed(true); }}>确认消耗 {product?.points ?? 500} 积分</PrimaryButton></SurfaceCard></main>;
}

export function Referrals() {
  const records = [["已绑定好友", "好友已通过你的海报完成绑定"], ["首次消费完成", "首单已确认"], ["推荐券待生效", "待门店确认"], ["推荐券可使用", "¥10 已到账"], ["推荐奖励已完成", "本次推荐旅程完成"]];
  return <main className="customer-page"><header className="customer-page__header"><span>朋友推荐</span><h1>推荐进度</h1></header><section className="customer-list">{records.map(([title, detail], i) => <article className="customer-referral-record" key={title}><span><strong>{title}</strong><small>{detail}</small></span><StatusPill status={i === 4 ? "success" : "plain"}>{["已绑定","首消完成","待生效","可使用","已完成"][i]}</StatusPill></article>)}</section></main>;
}

export function MemberLevel() { return <main className="customer-page"><header className="customer-page__header"><span>会员成长</span><h1>Lv2 熟客</h1></header><SurfaceCard tone="hero"><strong>1,280 / 2,000 成长值</strong><progress value="1280" max="2000" style={{width:"100%"}}/><p>距离 Lv3 挚友还差 720 成长值</p></SurfaceCard><h2>已解锁权益</h2><section className="customer-list">{["会员积分加速","生日专属好礼","每月到店券"].map((x) => <article className="customer-referral-record" key={x}><strong>{x}</strong><StatusPill status="success">已解锁</StatusPill></article>)}</section></main>; }

export function Me({ state, onNavigate }) { return <main className="customer-page"><header className="customer-page__header"><span>个人中心</span><h1>{state.customer.name}</h1><p>{state.customer.maskedPhone}</p></header><SurfaceCard tone="warm"><UserRound size={26}/><strong>{state.customer.level}</strong><p>成长值 {state.customer.growth.toLocaleString()}</p><PrimaryButton onClick={() => onNavigate("member-level")}>查看会员等级</PrimaryButton></SurfaceCard><section className="customer-list">{[["我的积分","points"],["推荐进度","referrals"],["隐私与数据权利","privacy-data"]].map(([label, route]) => <button className="customer-coupon" type="button" key={route} onClick={() => onNavigate(route)}><ShieldCheck size={20}/><strong>{label}</strong><ChevronRight size={17}/></button>)}</section></main>; }

export function PrivacyData() { return <main className="customer-page"><header className="customer-page__header"><span>账户管理</span><h1>隐私与数据权利</h1></header><section className="customer-list">{[["查询个人数据","查看已保存的信息"],["导出个人数据","申请数据副本"],["删除个人数据","删除可清除的数据"],["撤回隐私同意","停止非必要数据处理"],["注销账户","提交账户注销申请"]].map(([title, detail]) => <button className="customer-coupon" type="button" key={title}><ShieldCheck size={20}/><span><strong>{title}</strong><small>{detail}</small></span><ChevronRight size={17}/></button>)}</section></main>; }
