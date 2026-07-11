import React, { useState } from "react";
import { BarChart3, Camera, Gift, Home, Sparkles, UserRound } from "lucide-react";
import { BrandMascot } from "../components/Brand.jsx";
import { MiniProgramFrame } from "../components/MiniProgramFrame.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";
import { Balance, Benefits, CouponClaim, CouponCode, DeductionCode } from "./BenefitPages.jsx";
import { EntryConsent, EntryUnavailable } from "./EntryPages.jsx";
import "../styles/customer.css";

const tabs = [
  { id: "home", label: "首页", icon: Home },
  { id: "benefits", label: "权益", icon: Gift },
  { id: "ai-create", label: "AI创作", icon: Sparkles, featured: true },
  { id: "points", label: "积分", icon: BarChart3 },
  { id: "me", label: "我的", icon: UserRound },
];

function HomePage({ state, dispatch, onNavigate }) {
  const dailyCoupon = state.coupons[0];
  const claim = () => {
    dispatch({ type: "CLAIM_COUPON" });
    onNavigate("coupon-claim");
  };

  return (
    <main className="customer-page customer-home">
      <section className="customer-home__hero">
        <div>
          <StatusPill status="reward">牛里牛气 · A12桌</StatusPill>
          <h1>欢迎落座</h1>
          <p>先领福利，再把这一顿拍成大片。</p>
          <PrimaryButton onClick={claim} disabled={dailyCoupon.status === "active"}>
            {dailyCoupon.status === "active" ? "今日到店券已领取" : "领取 ¥10 今日到店券"}
          </PrimaryButton>
        </div>
        <BrandMascot kind="welcome" />
      </section>
      <section className="customer-metrics" aria-label="我的燎客数据">
        <button type="button" onClick={() => onNavigate("benefits")}><strong>4 张</strong><span>可用权益</span></button>
        <button type="button" onClick={() => onNavigate("points")}><strong>1,250</strong><span>积分</span></button>
      </section>
      <SurfaceCard tone="hero">
        <div className="customer-ai-card__icon"><Camera size={25} /></div>
        <div><span>燎客 AI 创作</span><strong>把这一桌的热气，变成会发光的作品</strong></div>
        <button type="button" aria-label="开始 AI 创作" onClick={() => onNavigate("ai-create")}>去创作</button>
      </SurfaceCard>
    </main>
  );
}

function Placeholder({ routeId }) {
  return <main className="customer-page customer-placeholder"><Sparkles size={28} /><h1>{routeId === "points" ? "我的积分" : routeId === "me" ? "我的" : "AI 创作"}</h1><p>这束星火正在准备中。</p></main>;
}

export function CustomerApp({ routeId, state, dispatch, onNavigate }) {
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const openCoupon = (couponId) => {
    setSelectedCouponId(couponId);
    onNavigate("coupon-code");
  };
  const pageProps = { state, dispatch, onNavigate };
  const pages = {
    "entry-consent": <EntryConsent {...pageProps} />,
    "entry-unavailable": <EntryUnavailable {...pageProps} />,
    home: <HomePage {...pageProps} />,
    "coupon-claim": <CouponClaim {...pageProps} />,
    benefits: <Benefits {...pageProps} onSelectCoupon={openCoupon} />,
    "coupon-code": <CouponCode {...pageProps} selectedCouponId={selectedCouponId} />,
    balance: <Balance {...pageProps} />,
    "deduction-code": <DeductionCode {...pageProps} />,
  };

  return (
    <MiniProgramFrame title="燎客 AI" tabs={tabs} activeRoute={routeId} onNavigate={onNavigate}>
      {pages[routeId] ?? <Placeholder routeId={routeId} />}
    </MiniProgramFrame>
  );
}

export default CustomerApp;
