import React, { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  QrCode,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Store,
} from "lucide-react";
import { BrandMascot } from "../components/Brand.jsx";
import { Sparkline } from "../components/Charts.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";
import { canMerchant } from "../permissions.js";

const roleIdentity = {
  owner: { role: "老板", name: "王老板", destination: "经营工作台" },
  manager: { role: "店长", name: "李店长", destination: "经营工作台" },
  staff: { role: "店员", name: "周小满", destination: "核销工作台" },
};

const metrics = [
  { label: "今日扫码", value: "128", delta: "+12%" },
  { label: "到店券领取", value: "76", delta: "+8%" },
  { label: "今日新会员", value: "31", delta: "+6%" },
  { label: "AI 海报用户", value: "24", delta: "+15%" },
  { label: "老带新订单", value: "9", delta: "+3单" },
  { label: "预估新增营业额", value: "¥1,278", delta: "示意测算" },
];

const trendData = {
  7: {
    scans: [72, 86, 81, 102, 108, 116, 128],
    referrals: [3, 5, 4, 6, 7, 8, 9],
  },
  30: {
    scans: [58, 64, 70, 68, 77, 82, 79, 91, 88, 96, 102, 99, 108, 112, 118, 109, 116, 121, 115, 124, 119, 127, 132, 128, 136, 131, 139, 135, 142, 128],
    referrals: [2, 3, 2, 4, 3, 4, 5, 3, 5, 4, 6, 5, 6, 7, 5, 6, 8, 7, 6, 8, 7, 9, 8, 9, 10, 8, 10, 9, 11, 9],
  },
};

const recentVerifications = [
  { time: "14:26", type: "到店券", member: "林小满", value: "¥10" },
  { time: "13:48", type: "积分礼品", member: "陈一川", value: "酸梅汤" },
  { time: "12:15", type: "推荐券", member: "周青禾", value: "¥10" },
];

export function MerchantLogin({ role, state, onNavigate }) {
  const identity = roleIdentity[role] ?? roleIdentity.owner;
  const targetRoute = role === "staff" ? "verify-hub" : "merchant-dashboard";

  return (
    <main className="merchant-page merchant-login">
      <div className="merchant-login__brand"><BrandMascot kind="merchant" /></div>
      <StatusPill status="success">身份已安全识别</StatusPill>
      <h1>商家登录</h1>
      <p>使用当前原型身份进入对应的门店工作台。</p>
      <SurfaceCard tone="warm">
        <span className="merchant-eyebrow"><Store size={14} /> 当前门店</span>
        <strong>{state.store.name}</strong>
        <span>{identity.role} · {identity.name}</span>
      </SurfaceCard>
      <PrimaryButton onClick={() => onNavigate(targetRoute)}>进入{identity.destination}</PrimaryButton>
      <small>演示环境不会连接真实微信账号</small>
    </main>
  );
}

function StoreStatus({ role, state, dispatch }) {
  const canUpdate = canMerchant(role, "store:update");
  const paused = state.store.paused;
  const toggle = () => dispatch({ type: paused ? "RESUME_STORE" : "PAUSE_STORE" });

  return (
    <SurfaceCard tone={paused ? "plain" : "warm"}>
      <div className="merchant-section-heading">
        <div>
          <span className="merchant-eyebrow"><Store size={14} /> 门店状态</span>
          <strong>{paused ? "暂停营业中" : "门店营业中"}</strong>
        </div>
        <StatusPill status={paused ? "danger" : "success"}>{paused ? "已暂停" : "正常"}</StatusPill>
      </div>
      <p>{paused ? "余额有效期已自动顺延，恢复营业前无法核销。" : "顾客权益领取与核销服务均正常。"}</p>
      {canUpdate
        ? <button type="button" className="merchant-secondary-action" onClick={toggle}>{paused ? "恢复营业" : "暂停营业"}</button>
        : <small className="merchant-readonly">仅老板可调整营业状态</small>}
    </SurfaceCard>
  );
}

export function MerchantDashboard({ role, state, dispatch, onNavigate }) {
  const [days, setDays] = useState(7);
  const trend = trendData[days];

  return (
    <main className="merchant-page merchant-dashboard">
      <header className="merchant-dashboard__header">
        <div><span>7月11日 · 周六</span><h1>今日经营</h1></div>
        <StatusPill status="success">实时更新</StatusPill>
      </header>

      <section className="merchant-scan-card">
        <div><span>快捷核销</span><strong>高峰期，先扫再确认</strong></div>
        <PrimaryButton onClick={() => onNavigate("verify-scan")} disabled={state.store.paused}>
          <ScanLine size={17} /> 扫一扫
        </PrimaryButton>
      </section>

      <section className="merchant-metrics" aria-label="今日六项核心经营指标">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.delta}</small>
          </article>
        ))}
      </section>

      <SurfaceCard tone="plain">
        <div className="merchant-section-heading">
          <div><span className="merchant-eyebrow"><CalendarDays size={14} /> 经营趋势</span><strong>扫码与老带新订单</strong></div>
          <div className="merchant-range" aria-label="趋势范围">
            {[7, 30].map((range) => <button type="button" key={range} aria-pressed={days === range} onClick={() => setDays(range)}>近{range}天</button>)}
          </div>
        </div>
        <div className="merchant-trend" aria-label={`近${days}天经营趋势`}>
          <div><span><i className="is-scan" /> 扫码人数</span><Sparkline values={trend.scans} label={`近${days}天扫码人数趋势`} /></div>
          <div><span><i className="is-referral" /> 老带新订单</span><Sparkline values={trend.referrals} label={`近${days}天老带新订单趋势`} /></div>
        </div>
      </SurfaceCard>

      <StoreStatus role={role} state={state} dispatch={dispatch} />

      <section className="merchant-cost-warning" aria-label="权益成本提醒">
        <ShieldAlert size={19} />
        <div><strong>权益成本接近预警线</strong><span>本月权益成本率 8.6%，距离 10% 预警线还有 1.4%。</span></div>
      </section>

      <section className="merchant-suggestion">
        <BrandMascot kind="merchant" />
        <div><span><Sparkles size={13} /> 燎小星经营建议</span><strong>本月有3位铁杆会员生日，发张生日券试试</strong></div>
        <button type="button" aria-label="查看生日会员" onClick={() => onNavigate("members")}><ArrowUpRight size={18} /></button>
      </section>

      <section className="merchant-recent">
        <div className="merchant-section-heading"><h2>最近核销</h2><button type="button" onClick={() => onNavigate("verify-history")}>查看全部</button></div>
        <div className="merchant-verification-list">
          {recentVerifications.map((item) => (
            <article key={`${item.time}-${item.member}`}>
              <span className="merchant-verification-icon"><QrCode size={16} /></span>
              <div><strong>{item.type} · {item.member}</strong><span>{item.time} · 核销成功</span></div>
              <b>{item.value}</b>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
