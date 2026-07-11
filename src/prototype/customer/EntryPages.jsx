import React, { useState } from "react";
import { LiaoxiaoxingMoment } from "../components/Glass.jsx";
import { PrimaryButton, StatusPill } from "../components/Ui.jsx";
import { GalaceanStage } from "../motion/GalaceanStage.jsx";

export function EntryConsent({ dispatch, onNavigate }) {
  const [consentChecked, setConsentChecked] = useState(true);
  const accept = () => {
    if (!consentChecked) return;
    dispatch({ type: "ACCEPT_CONSENT" });
    onNavigate("home");
  };

  return (
    <main className="customer-page customer-entry motion-host">
      <GalaceanStage kind="entry" />
      <LiaoxiaoxingMoment kind="welcome" className="ui-card ui-card--hero customer-entry-moment">
        <div>
          <StatusPill status="reward">牛里牛气 · A12桌</StatusPill>
          <h1>这一桌的星火，等你点亮</h1>
          <p>授权手机号后，可领取到店权益，并在权益中心查看使用记录。</p>
          <label className="customer-consent">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
            />
            <span>我已阅读并同意用户服务与隐私说明</span>
          </label>
          <PrimaryButton onClick={accept} disabled={!consentChecked}>同意并继续</PrimaryButton>
        </div>
      </LiaoxiaoxingMoment>
    </main>
  );
}

const unavailableCopy = {
  "invalid-code": ["桌码没有认出来", "请确认桌码来自门店，或请店员协助重新扫码。"],
  "inactive-store": ["这家门店还未开放", "门店正在准备服务，请稍后再来看看。"],
  "paused-store": ["门店服务暂时休息", "当前无法领取和使用权益，请留意门店恢复通知。"],
};

export function EntryUnavailable() {
  const variant = new URLSearchParams(window.location.search).get("variant") ?? "invalid-code";
  const [title, body] = unavailableCopy[variant] ?? unavailableCopy["invalid-code"];

  return (
    <main className="customer-page customer-unavailable">
      <LiaoxiaoxingMoment kind="empty" className="empty-state customer-unavailable-moment">
        <h3>{title}</h3>
        <p>{body}</p>
        <PrimaryButton onClick={() => window.location.reload()}>重新扫码</PrimaryButton>
      </LiaoxiaoxingMoment>
    </main>
  );
}
