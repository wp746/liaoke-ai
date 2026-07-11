import React, { useState } from "react";
import { ChevronRight, Clock3, Coins, Gift, QrCode, TicketCheck } from "lucide-react";
import { BrandMascot } from "../components/Brand.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";

const referralStates = ["待生效", "可使用", "已使用", "已过期"];

function CouponRow({ coupon, onOpen }) {
  const usable = coupon.status === "active";
  return (
    <button type="button" className="customer-coupon" onClick={onOpen}>
      <span className="customer-coupon__value">¥{coupon.value}</span>
      <span>
        <strong>{coupon.title}</strong>
        <small>{usable ? `有效期至 ${coupon.expiresAt.slice(0, 10)}` : "已使用"}</small>
      </span>
      <ChevronRight size={17} />
    </button>
  );
}

export function CouponClaim({ state, onNavigate }) {
  return (
    <main className="customer-page customer-claim">
      <BrandMascot kind="coupon" />
      <StatusPill status="success">领取成功</StatusPill>
      <h1>福利已放进权益中心</h1>
      <p>¥10 今日到店券已到账，本桌消费满足使用条件后即可出示券码。</p>
      <SurfaceCard tone="warm">
        <strong>{state.coupons[0].title}</strong>
        <span>今日 23:59 前可用</span>
      </SurfaceCard>
      <PrimaryButton onClick={() => onNavigate("benefits")}>查看权益</PrimaryButton>
    </main>
  );
}

export function Benefits({ state, onNavigate }) {
  const [tab, setTab] = useState("到店券");
  return (
    <main className="customer-page">
      <header className="customer-page__header">
        <span>我的可用福利</span>
        <h1>权益中心</h1>
      </header>
      <div className="customer-segment" role="tablist" aria-label="权益分类">
        {["到店券", "推荐券", "返现余额"].map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "is-active" : ""}
            key={item}
            onClick={() => setTab(item)}
          >{item}</button>
        ))}
      </div>
      {tab === "到店券" && (
        <section className="customer-list" aria-label="到店券列表">
          {state.coupons.map((coupon) => (
            <CouponRow key={coupon.id} coupon={coupon} onOpen={() => onNavigate("coupon-code")} />
          ))}
        </section>
      )}
      {tab === "推荐券" && (
        <section className="customer-referrals">
          <SurfaceCard tone="warm">
            <Gift size={24} />
            <strong>朋友到店后，推荐券会自动生效</strong>
            <p>状态会随着好友到店和使用进度更新。</p>
          </SurfaceCard>
          <div className="customer-state-grid">
            {referralStates.map((status) => <StatusPill status="plain" key={status}>{status}</StatusPill>)}
          </div>
        </section>
      )}
      {tab === "返现余额" && (
        <SurfaceCard tone="hero">
          <Coins size={25} />
          <span>当前返现余额</span>
          <strong className="customer-balance-number">¥{state.customer.balance.toFixed(2)}</strong>
          <PrimaryButton onClick={() => onNavigate("balance")}>查看余额</PrimaryButton>
        </SurfaceCard>
      )}
    </main>
  );
}

function CodeDialog({ eyebrow, title, code, expiresAt, limits, onBack }) {
  return (
    <main className="customer-page customer-code-page">
      <button type="button" className="customer-text-button" onClick={onBack}>返回权益中心</button>
      <section className="customer-code-dialog" role="dialog" aria-labelledby="code-title">
        <span>{eyebrow}</span>
        <h1 id="code-title">{title}</h1>
        <div className="customer-qr" aria-label="二维码占位图"><QrCode size={112} strokeWidth={1.2} /></div>
        <strong className="customer-code">{code}</strong>
        <p><Clock3 size={14} /> 有效期至 {expiresAt}</p>
        <dl>
          <div><dt>适用门店</dt><dd>牛里牛气潮汕牛肉火锅</dd></div>
          <div><dt>使用限制</dt><dd>{limits}</dd></div>
        </dl>
      </section>
    </main>
  );
}

export function CouponCode({ state, onNavigate }) {
  const coupon = state.coupons.find(({ status }) => status === "active") ?? state.coupons[0];
  return <CodeDialog eyebrow="到店券核销码" title={coupon.title} code={coupon.code} expiresAt={coupon.expiresAt} limits="堂食可用，每桌限用 1 张，不与其他到店券同享" onBack={() => onNavigate("benefits")} />;
}

export function Balance({ state, onNavigate }) {
  return (
    <main className="customer-page">
      <header className="customer-page__header"><span>返现余额</span><h1>¥{state.customer.balance.toFixed(2)}</h1></header>
      <SurfaceCard tone="hero">
        <TicketCheck size={26} />
        <strong>结账时可出示抵扣码</strong>
        <p>抵扣结果以门店核销页显示为准。</p>
        <PrimaryButton onClick={() => onNavigate("deduction-code")}>生成抵扣码</PrimaryButton>
      </SurfaceCard>
    </main>
  );
}

export function DeductionCode({ onNavigate }) {
  return <CodeDialog eyebrow="余额抵扣码" title="本次可抵扣 ¥24.80" code="YE24A80X" expiresAt="2026-07-10 23:59:59" limits="仅限本桌本次堂食账单使用，核销后立即失效" onBack={() => onNavigate("balance")} />;
}
