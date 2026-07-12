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
import { GlassSurface } from "./Glass.jsx";

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

export function AdminFrame({
  role,
  activeRoute,
  onNavigate,
  children,
  searchValue = "",
  onSearchChange,
  searchStores = [],
  onOpenSearchResult,
}) {
  const readonly = role === "platform_admin";
  const roleLabel = role === "super_admin"
    ? "超级管理员"
    : readonly ? "只读运营视图" : "角色未配置";
  const normalizedSearch = searchValue.trim().toLocaleLowerCase("zh-CN");
  const searchResults = normalizedSearch
    ? searchStores.filter((store) => `${store.name} ${store.id} ${store.city}`.toLocaleLowerCase("zh-CN").includes(normalizedSearch))
    : [];

  return (
    <section
      className="admin-frame"
      data-frame="admin"
      data-route-id={activeRoute}
      data-admin-density="high"
      data-admin-role-mode={readonly ? "readonly" : "writable"}
    >
      <GlassSurface as="aside" level="acrylic" className="admin-sidebar">
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
      </GlassSurface>

      <div className="admin-frame__main">
        <header className="admin-topbar">
          <GlassSurface as="div" level="acrylic" className="admin-search">
            <Search size={16} />
            <label className="sr-only" htmlFor="admin-global-search">全局搜索</label>
            <input
              id="admin-global-search"
              type="search"
              placeholder="搜索门店、任务或订单"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              aria-expanded={Boolean(normalizedSearch)}
              aria-controls="admin-global-search-results"
            />
            {normalizedSearch && (
              <div className="admin-search-results" id="admin-global-search-results" aria-live="polite">
                {searchResults.length ? searchResults.map((store) => (
                  <button type="button" key={store.id} onClick={() => onOpenSearchResult?.(store.id)}>
                    <strong>打开{store.name}</strong><small>{store.id} · {store.city}</small>
                  </button>
                )) : <p>没有找到匹配的门店</p>}
              </div>
            )}
          </GlassSurface>
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
