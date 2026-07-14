import React from "react";

export function PrimaryButton({ children, ...props }) { return <button className="ui-primary" {...props}>{children}</button>; }
export function SurfaceCard({ children, tone="plain" }) { return <section className={`ui-card ui-card--${tone}`}>{children}</section>; }
export function StatusPill({ status, children }) { return <span className={`status-pill status-pill--${status}`}>{children}</span>; }
export function EmptyState({ image, title, body, action }) { return <div className="empty-state"><img src={image} alt=""/><h3>{title}</h3><p>{body}</p>{action}</div>; }
