import React, { useEffect } from "react";
import { BarChart3, Download, Gift, History, ScanLine, Store, UserRound, UsersRound } from "lucide-react";
import { MiniProgramFrame } from "../components/MiniProgramFrame.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";
import { canMerchant, merchantTabs } from "../permissions.js";
import { MerchantDashboard, MerchantLogin } from "./DashboardPages.jsx";
import "../styles/merchant.css";

const tabPresentation = {
  "merchant-dashboard": { label: "经营", icon: BarChart3 },
  "verify-hub": { label: "核销", icon: ScanLine },
  members: { label: "会员", icon: UsersRound },
  activities: { label: "运营", icon: Gift },
  "verify-history": { label: "记录", icon: History },
  "merchant-export": { label: "我的", icon: UserRound },
};

const verificationRoutes = new Set(["verify-hub", "verify-scan", "verify-manual", "verify-confirm", "verify-result", "verify-history"]);
const memberRoutes = new Set(["members", "member-detail"]);
const operationRoutes = new Set(["activities", "activity-editor", "benefit-policy"]);
const pointsRoutes = new Set(["points-products", "points-product-editor", "points-rules"]);

function canAccessRoute(role, routeId) {
  if (routeId === "merchant-login") return true;
  if (routeId === "merchant-dashboard") return canMerchant(role, "members:read");
  if (verificationRoutes.has(routeId)) return canMerchant(role, "verify");
  if (memberRoutes.has(routeId)) return canMerchant(role, "members:read");
  if (operationRoutes.has(routeId)) return canMerchant(role, "activity:write");
  if (pointsRoutes.has(routeId)) return canMerchant(role, "points:write");
  if (routeId === "employees" || routeId === "merchant-plan") return canMerchant(role, "employee:write");
  if (routeId === "store-settings") return canMerchant(role, "store:update");
  return false;
}

const accountRoleLabels = { owner: "老板", manager: "店长", staff: "店员" };

function MerchantAccount({ role, state }) {
  const canExport = canMerchant(role, "export");

  return (
    <main className="merchant-page merchant-account">
      <div><StatusPill status="success">账号安全</StatusPill><h1>我的账号</h1><p>账号与门店身份信息</p></div>
      <SurfaceCard tone="warm">
        <span className="merchant-eyebrow"><Store size={14} /> 当前门店</span>
        <strong>{state.store.name}</strong>
        <span>{accountRoleLabels[role]}账号 · 已登录</span>
      </SurfaceCard>
      {canExport ? (
        <SurfaceCard tone="plain">
          <span className="merchant-eyebrow"><Download size={14} /> 老板权限</span>
          <h2>数据导出</h2>
          <p>导出门店经营数据前将记录操作账号与时间。</p>
          <button type="button" className="merchant-secondary-action">导出经营数据</button>
        </SurfaceCard>
      ) : <small className="merchant-readonly">数据导出仅老板账号可用</small>}
    </main>
  );
}

function PermissionState({ onNavigate }) {
  return (
    <main className="merchant-page merchant-permission-state">
      <SurfaceCard tone="warm">
        <StatusPill status="danger">权限受限</StatusPill>
        <h1>当前角色无法访问</h1>
        <p>这里包含门店经营配置。为保护门店数据，请使用有对应权限的账号。</p>
        <PrimaryButton onClick={() => onNavigate("verify-hub")}>返回核销工作台</PrimaryButton>
      </SurfaceCard>
    </main>
  );
}

function RoutePlaceholder({ routeId }) {
  const verification = verificationRoutes.has(routeId);
  return (
    <main className="merchant-page merchant-route-placeholder">
      <StatusPill status={verification ? "success" : "plain"}>{verification ? "核销服务正常" : "功能入口"}</StatusPill>
      <h1>{routeId === "verify-hub" ? "核销工作台" : "页面正在接入"}</h1>
      <p>{verification ? "请选择扫码核销、手动输入或查看最近记录。" : "当前角色已通过权限校验。"}</p>
    </main>
  );
}

export function MerchantApp({ routeId, role, state, dispatch, onNavigate }) {
  const directRouteRequested = new URLSearchParams(window.location.search).has("route");
  const tabs = merchantTabs(role).map((tab) => ({ ...tab, ...tabPresentation[tab.id] }));

  useEffect(() => {
    if (role === "staff" && !directRouteRequested && routeId === "merchant-dashboard") onNavigate("verify-hub");
  }, [directRouteRequested, onNavigate, role, routeId]);

  let page;
  if (routeId === "merchant-export") page = <MerchantAccount role={role} state={state} />;
  else if (!canAccessRoute(role, routeId)) page = <PermissionState onNavigate={onNavigate} />;
  else if (routeId === "merchant-login") page = <MerchantLogin role={role} state={state} onNavigate={onNavigate} />;
  else if (routeId === "merchant-dashboard") page = <MerchantDashboard role={role} state={state} dispatch={dispatch} onNavigate={onNavigate} />;
  else page = <RoutePlaceholder routeId={routeId} />;

  return <MiniProgramFrame title="燎客商家" tabs={tabs} activeRoute={routeId} onNavigate={onNavigate}>{page}</MiniProgramFrame>;
}

export default MerchantApp;
