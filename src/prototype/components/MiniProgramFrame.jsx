import React from "react";
import { BatteryMedium, MoreHorizontal, Signal, Wifi } from "lucide-react";

export function MiniProgramFrame({ title, tabs, activeRoute, onNavigate, children }) {
  return (
    <section className="mini-program-frame" data-frame="mini-program">
      <div className="mini-program-frame__speaker" aria-hidden="true" />
      <div className="mini-program-frame__screen">
        <div className="mini-program-status" aria-hidden="true">
          <strong>9:41</strong>
          <span><Signal size={13} /><Wifi size={13} /><BatteryMedium size={17} /></span>
        </div>
        <header className="mini-program-topbar">
          <span className="mini-program-topbar__spacer" />
          <strong>{title}</strong>
          <span className="mini-program-menu" aria-hidden="true">
            <MoreHorizontal size={17} />
            <i />
          </span>
        </header>
        <div className="mini-program-content">{children}</div>
        <nav className="mini-program-tabs" aria-label={`${title}主导航`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeRoute;
            return (
              <button
                type="button"
                key={tab.id}
                className={`${active ? "is-active" : ""}${tab.featured ? " is-featured" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => onNavigate(tab.id)}
              >
                <span className="mini-program-tabs__icon">
                  {Icon ? <Icon size={18} strokeWidth={2.2} /> : tab.label.slice(0, 1)}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
