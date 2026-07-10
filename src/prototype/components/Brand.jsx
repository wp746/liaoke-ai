import React from "react";

const mascotAssets = {
  welcome: "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-welcome-table.png",
  merchant: "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-merchant-verify.png",
  coupon: "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-coupon-wallet.png",
  ai: "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-ai-magic.png",
  points: "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-reward-points.png",
  empty: "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-empty-error.png",
};

export function BrandMark({ compact = false }) {
  return (
    <div className={`spark-brand${compact ? " spark-brand--compact" : ""}`}>
      <img src="/brand/liaoke-mark.svg" alt="" />
      <div>
        <strong>燎客 AI</strong>
        <span>SPARKFLOW AI</span>
      </div>
    </div>
  );
}

export function BrandMascot({ kind = "welcome", alt = "燎小星" }) {
  return <img className="brand-mascot" src={mascotAssets[kind] ?? mascotAssets.welcome} alt={alt} />;
}

export function MascotBubble({ children, kind = "welcome" }) {
  return (
    <div className="mascot-bubble">
      <BrandMascot kind={kind} />
      <p>{children}</p>
    </div>
  );
}
