import React from "react";
import {
  Bell,
  Bot,
  Building2,
  FileClock,
  LayoutDashboard,
  QrCode,
  Search,
  Settings2,
  ShieldAlert,
  TicketPercent,
} from "lucide-react";
import { BrandMark } from "./Brand.jsx";

const navigation = [
  { id: "admin-overview", label: "平台总览", icon: LayoutDashboard },
  { id: "stores", label: "门店", icon: Building2 },
  { id: "table-codes", label: "桌码", icon: QrCode },
  { id: "ai-quota", label: "AI / 提示词", icon: Bot },
  { id: "benefit-templates", label: "权益模板", icon: TicketPercent },
  { id: "risk-center", label: "风险中心", icon: ShieldAlert },
  { id: "contracts", label: "套餐与续费", icon: FileClock },
  { id: "system-logs", label: "系统审计", icon: Settings2 },
];

export function AdminFrame({ role, activeRoute, onNavigate, children }) {
  const readonly = role === "platform_admin";
  const roleLabel = role === "super_admin"
    ? "超级管理员"
    : readonly ? "只读运营视图" : "角色未配置";

  return (
    <section className="admin-frame" data-frame="admin">
      <aside className="admin-sidebar">
        <BrandMark compact />
        <nav aria-label="平台模块导航">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={activeRoute === id ? "is-active" : ""}
              aria-current={activeRoute === id ? "page" : undefined}
              onClick={() => onNavigate(id)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__status">
          <span className="admin-sidebar__spark" />
          <div><strong>系统运行正常</strong><small>刚刚完成巡检</small></div>
        </div>
      </aside>

      <div className="admin-frame__main">
        <header className="admin-topbar">
          <label className="admin-search">
            <Search size={16} />
            <span className="sr-only">全局搜索</span>
            <input type="search" placeholder="搜索门店、任务或订单" />
          </label>
          <div className="admin-topbar__actions">
            <span className={readonly ? "admin-role is-readonly" : "admin-role"}>
              {roleLabel}
            </span>
            <button type="button" className="admin-icon-button" aria-label="通知"><Bell size={18} /></button>
            <span className="admin-avatar">WP</span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </section>
  );
}
