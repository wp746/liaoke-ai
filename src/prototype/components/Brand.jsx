import React from "react";

const mascotAssets = {
  welcome: "/brand/ip-liaoxiaoxing/scene-library/display/scene-home-welcome-transparent-v1-display.png",
  merchant: "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-merchant-verify.png",
  coupon: "/brand/ip-liaoxiaoxing/scene-library/display/scene-benefits-wallet-transparent-v1-display.png",
  ai: "/brand/ip-liaoxiaoxing/scene-library/display/scene-ai-magic-transparent-v1-display.png",
  points: "/brand/ip-liaoxiaoxing/scene-library/display/scene-points-reward-transparent-v1-display.png",
  group: "/brand/ip-liaoxiaoxing/scene-library/display/scene-home-welcome-transparent-v1-display.png",
  profile: "/brand/ip-liaoxiaoxing/scene-library/display/scene-profile-phone-cape-transparent-v2-display.png",
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
