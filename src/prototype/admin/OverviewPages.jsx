import React from "react";
import { AlertTriangle, ArrowUpRight, Building2, ScanLine, Sparkles, UsersRound } from "lucide-react";
import { Sparkline } from "../components/Charts.jsx";

const platformMetrics = [
  { label: "在线门店", value: "42", detail: "较上月 +6", icon: Building2 },
  { label: "今日扫码", value: "8,426", detail: "较昨日 +12.8%", icon: ScanLine },
  { label: "新增会员", value: "1,284", detail: "转化率 38.6%", icon: UsersRound },
  { label: "AI 任务成功率", value: "97.8%", detail: "12 个任务待处理", icon: Sparkles },
];

const planLabels = { basic: "基础版", pro: "成长版 Pro", enterprise: "企业版" };
const statusLabels = { active: "营业中", paused: "暂停营业", disabled: "已停用" };

export function StoreTable({ stores, onOpenStore, compact = false, emptyMessage = "没有符合条件的门店" }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-store-table" aria-label="平台门店列表">
        <thead><tr><th>门店</th><th>套餐</th><th>会员</th><th>风险</th><th>状态</th><th><span className="sr-only">操作</span></th></tr></thead>
        <tbody>
          {stores.slice(0, compact ? 2 : stores.length).map((store) => (
            <tr key={store.id}>
              <td><strong>{store.name}</strong><small>{store.id} · {store.city}</small></td>
              <td>{planLabels[store.plan]}</td><td>{store.members}</td><td>{store.risk}</td>
              <td><span className={`admin-state ${store.status === "active" ? "is-live" : ""}`}>{statusLabels[store.status]}</span></td>
              <td><button type="button" className="admin-text-action" onClick={() => onOpenStore(store.id)}>
                查看{store.name}<ArrowUpRight size={14} />
              </button></td>
            </tr>
          ))}
          {!stores.length && <tr><td colSpan="6" className="admin-table-empty">{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function AdminLoginPage({ role, onNavigate }) {
  const superAdmin = role === "super_admin";
  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <span className="admin-eyebrow">燎客 AI · Platform OS</span>
        <h1>平台后台登录</h1>
        <p>连接全平台门店经营、桌码、AI 任务与风险处理。</p>
        <div className="admin-login-identity">
          <span>WP</span>
          <div><strong>{superAdmin ? "超级管理员 · 创始人工作台" : "平台运营 · 只读视图"}</strong><small>安全身份已校验</small></div>
        </div>
        <button type="button" className="admin-primary-action" onClick={() => onNavigate("admin-overview")}>进入全局经营指挥台</button>
      </div>
    </main>
  );
}

export function AdminOverviewPage({ permissions, onNavigate, adminState, onOpenStore, onCreateStore }) {
  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div><span className="admin-eyebrow">全局经营指挥台</span><h1>平台经营总览</h1><p>2026 年 7 月 11 日 · 数据截至 14:40</p></div>
        {permissions.canWrite && <button type="button" className="admin-primary-action" onClick={onCreateStore}>创建门店</button>}
      </header>

      <section className="admin-kpi-grid" aria-label="平台核心指标">
        {platformMetrics.map(({ label, value, detail, icon: Icon }) => (
          <article className="admin-kpi" key={label}><div><Icon size={17} /><span>{label}</span></div><strong>{value}</strong><small>{detail}</small></article>
        ))}
      </section>

      <div className="admin-command-grid">
        <section className="admin-panel admin-trend-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">30 DAYS PULSE</span><h2>近30日增长趋势</h2></div><strong>+18.4%</strong></div>
          <Sparkline values={[42, 48, 45, 53, 58, 61, 59, 67, 72, 76, 74, 82]} label="近30日平台扫码趋势" />
          <div className="admin-trend-legend"><span><i />扫码人次 218,430</span><span><i />新会员 31,286</span></div>
        </section>
        <section className="admin-panel admin-risk-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">ACTION REQUIRED</span><h2>风险队列</h2></div><span className="admin-count">3</span></div>
          <article><AlertTriangle size={17} /><div><strong>牛里牛气核销频率异常</strong><small>高风险 · 12:18</small></div></article>
          <article><AlertTriangle size={17} /><div><strong>AI 生成失败率超过阈值</strong><small>中风险 · 11:42</small></div></article>
          <button type="button" className="admin-secondary-action" onClick={() => onNavigate("risk-center")}>查看全部风险</button>
        </section>
      </div>

      <div className="admin-overview-bottom">
        <section className="admin-panel admin-store-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">STORE NETWORK</span><h2>重点门店</h2></div><button type="button" className="admin-text-action" onClick={() => onNavigate("stores")}>全部门店 <ArrowUpRight size={14} /></button></div>
          <StoreTable stores={adminState.stores} onOpenStore={onOpenStore} compact />
        </section>
        <aside className="admin-panel admin-context-drawer">
          <span className="admin-eyebrow">CONTEXT DRAWER</span><h2>上下文助手</h2>
          <p>当前风险主要集中在核销频率和 AI 失败重试。</p>
          <div className="admin-insight"><strong>建议先查看牛里牛气</strong><span>该店近 2 小时核销量高于平台基线 2.4 倍。</span></div>
          <button type="button" className="admin-secondary-action" onClick={() => onOpenStore("STORE001")}>打开单店视图</button>
        </aside>
      </div>
    </main>
  );
}
