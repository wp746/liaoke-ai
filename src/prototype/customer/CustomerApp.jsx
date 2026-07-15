import React, { useState } from "react";
import { BarChart3, Camera, Gift, Home, Sparkles, UserRound, UsersRound } from "lucide-react";
import { BrandMascot } from "../components/Brand.jsx";
import { MiniProgramFrame } from "../components/MiniProgramFrame.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";
import { Balance, Benefits, CouponClaim, CouponCode, DeductionCode } from "./BenefitPages.jsx";
import { EntryConsent, EntryUnavailable } from "./EntryPages.jsx";
import { AI_PROGRESS_VARIANTS, AiCreate, AiProgress, AiSelect, PosterPreview } from "./AiPages.jsx";
import { MemberLevel, Me, Points, PointsProduct, PointsRedemption, PointsStore, PrivacyData, Referrals } from "./PointsProfilePages.jsx";
import { PrivateGroup } from "./GroupPages.jsx";
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
        <button type="button" onClick={() => onNavigate("points")}><strong>{state.points.balance.toLocaleString()}</strong><span>积分</span></button>
      </section>
      <SurfaceCard tone="hero">
        <div className="customer-ai-card__icon"><Camera size={25} /></div>
        <div><span>燎客 AI 创作</span><strong>把这一桌的热气，变成会发光的作品</strong></div>
        <button type="button" aria-label="开始 AI 创作" onClick={() => onNavigate("ai-create")}>去创作</button>
      </SurfaceCard>
      <SurfaceCard tone="warm">
        <div className="customer-group-card__icon"><UsersRound size={23} /></div>
        <div><span>门店私域福利</span><strong>加入会员群，接收隐藏券、生日礼和新品提醒</strong></div>
        <button type="button" aria-label="加入会员福利群" onClick={() => onNavigate("private-group")}>去入群</button>
      </SurfaceCard>
    </main>
  );
}

function Placeholder({ routeId }) {
  return <main className="customer-page customer-placeholder"><Sparkles size={28} /><h1>{routeId === "points" ? "我的积分" : routeId === "me" ? "我的" : "AI 创作"}</h1><p>这束星火正在准备中。</p></main>;
}

export function CustomerApp({ routeId, state, dispatch, onNavigate, aiVariant, onAiVariantChange }) {
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [aiDraft, setAiDraft] = useState({ feeling: "", style: "质感大片" });
  const [selectedAiCopy, setSelectedAiCopy] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("drink-suanmei");
  const pointsProducts = state.operations.pointsProducts;
  const openCoupon = (couponId) => {
    setSelectedCouponId(couponId);
    onNavigate("coupon-code");
  };
  const pageProps = { state, dispatch, onNavigate };
  const progressOverride = AI_PROGRESS_VARIANTS.includes(aiVariant);
  const aiStarted = state.ai.status !== "idle";
  const aiReady = ["done", "fallback"].includes(state.ai.status);
  const pages = {
    "entry-consent": <EntryConsent {...pageProps} />,
    "entry-unavailable": <EntryUnavailable {...pageProps} />,
    home: <HomePage {...pageProps} />,
    "coupon-claim": <CouponClaim {...pageProps} />,
    benefits: <Benefits {...pageProps} onSelectCoupon={openCoupon} />,
    "coupon-code": <CouponCode {...pageProps} selectedCouponId={selectedCouponId} />,
    "ai-create": <AiCreate {...pageProps} draft={aiDraft} onDraftChange={setAiDraft} />,
    "ai-progress": aiStarted || progressOverride ? <AiProgress {...pageProps} variant={aiVariant} onVariantChange={onAiVariantChange} /> : <AiCreate {...pageProps} draft={aiDraft} onDraftChange={setAiDraft} />,
    "ai-select": aiReady ? <AiSelect {...pageProps} draft={aiDraft} onSelect={setSelectedAiCopy} /> : <AiCreate {...pageProps} draft={aiDraft} onDraftChange={setAiDraft} />,
    "poster-preview": aiReady ? <PosterPreview {...pageProps} selectedCopy={selectedAiCopy} /> : <AiCreate {...pageProps} draft={aiDraft} onDraftChange={setAiDraft} />,
    balance: <Balance {...pageProps} />,
    "deduction-code": <DeductionCode {...pageProps} />,
    points: <Points {...pageProps} products={pointsProducts} />,
    "points-store": <PointsStore {...pageProps} products={pointsProducts} onSelect={setSelectedProductId} />,
    "points-product": <PointsProduct {...pageProps} product={pointsProducts.find(({id}) => id === selectedProductId)} />,
    "points-redemption": <PointsRedemption {...pageProps} product={pointsProducts.find(({id}) => id === selectedProductId)} />,
    "private-group": <PrivateGroup {...pageProps} />,
    referrals: <Referrals {...pageProps} />,
    "member-level": <MemberLevel {...pageProps} />,
    me: <Me {...pageProps} />,
    "privacy-data": <PrivacyData {...pageProps} />,
  };

  return (
    <MiniProgramFrame title="燎客 AI" tabs={tabs} activeRoute={routeId} onNavigate={onNavigate}>
      {pages[routeId] ?? <Placeholder routeId={routeId} />}
    </MiniProgramFrame>
  );
}

export default CustomerApp;
