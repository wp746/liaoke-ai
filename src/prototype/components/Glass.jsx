import React from "react";
import { Coins, Droplets, Drumstick, Flame, ShieldAlert, Sparkles, TicketCheck, UsersRound } from "lucide-react";
import { BrandMascot } from "./Brand.jsx";

const icons = { store: Flame, dish: Drumstick, group: UsersRound, drink: Droplets, balance: TicketCheck, points: Sparkles, referral: UsersRound, risk: ShieldAlert, ai: Sparkles };
const stateLabels = { used: "已使用", expired: "已过期", paused: "已暂停" };

export function GlassSurface({ as: Tag = "section", level = "acrylic", interactive = false, className = "", children, ...props }) {
  return <Tag className={`glass-surface glass-surface--${level}${interactive ? " is-interactive" : ""} ${className}`.trim()} data-glass-level={level} {...props}>{children}</Tag>;
}

export function LiquidLens({ active = false, className = "", children }) {
  return <span className={`liquid-lens${active ? " is-active" : ""} ${className}`.trim()} data-lens-active={active}>{children}</span>;
}

export function RewardGlyph({ kind, state = "active", value, className = "" }) {
  const Icon = icons[kind] ?? Coins;
  return <span className={`reward-glyph reward-glyph--${kind} reward-glyph--${state} ${className}`.trim()} data-glyph-kind={kind} data-glyph-state={state}><Icon aria-hidden="true" size={18} /><strong>{value}</strong>{stateLabels[state] && <span className="sr-only">{stateLabels[state]}</span>}<i aria-hidden="true" /></span>;
}

export function SparkTrail({ active = false, className = "" }) {
  return <span aria-hidden="true" className={`spark-trail${active ? " is-active" : ""} ${className}`.trim()} />;
}

export function LiaoxiaoxingMoment({ kind = "coupon", className = "", children }) {
  return <div className={`liaoxiaoxing-moment liaoxiaoxing-moment--${kind} ${className}`.trim()}><BrandMascot kind={kind} />{children}</div>;
}
