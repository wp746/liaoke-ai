import React, { useCallback, useEffect, useState } from "react";
import { BarChart3, Gift, Home, Sparkles, UserRound } from "lucide-react";
import { getRoute, getRoutesForSurface, SURFACES } from "./routeRegistry.js";
import { merchantTabs } from "./permissions.js";
import { createScenarioState, SCENARIOS, transition } from "./scenarioStore.js";
import { PrototypeShell } from "./components/PrototypeShell.jsx";
import { MiniProgramFrame } from "./components/MiniProgramFrame.jsx";
import { AdminFrame } from "./components/AdminFrame.jsx";
import { BrandMascot } from "./components/Brand.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "./components/Ui.jsx";
import { Sparkline } from "./components/Charts.jsx";

const surfaceDefaults = {
  customer: "home",
  merchant: "merchant-dashboard",
  admin: "admin-overview",
};

const surfaceRoleDefaults = {
  customer: null,
  merchant: "owner",
  admin: "super_admin",
};

const surfaceRoles = {
  customer: [],
  merchant: ["owner", "manager", "staff"],
  admin: ["super_admin", "platform_admin"],
};

const surfaceRendererPaths = {
  customer: "./customer/CustomerApp.jsx",
  merchant: "./merchant/MerchantApp.jsx",
  admin: "./admin/AdminApp.jsx",
};

const surfaceRendererNames = {
  customer: "CustomerApp",
  merchant: "MerchantApp",
  admin: "AdminApp",
};

const surfaceModules = import.meta.glob(
  ["./customer/CustomerApp.jsx", "./merchant/MerchantApp.jsx", "./admin/AdminApp.jsx"],
  { eager: true },
);

function normalizeRole(surface, requestedRole) {
  return surfaceRoles[surface].includes(requestedRole)
    ? requestedRole
    : surfaceRoleDefaults[surface];
}

const customerTabs = [
  { id: "home", label: "首页", icon: Home },
  { id: "benefits", label: "权益", icon: Gift },
  { id: "ai-create", label: "AI创作", icon: Sparkles, featured: true },
  { id: "points", label: "积分", icon: BarChart3 },
  { id: "me", label: "我的", icon: UserRound },
];

const merchantTabPresentation = {
  "merchant-dashboard": { label: "经营", icon: BarChart3 },
  "verify-hub": { label: "核销", icon: Home },
  members: { label: "会员", icon: UserRound },
  activities: { label: "运营", icon: Gift },
  "verify-history": { label: "记录", icon: BarChart3 },
  "merchant-export": { label: "我的", icon: UserRound },
};

function SurfacePreview({ surface, routeId, role, onNavigate }) {
  if (surface === "admin") {
    return (
      <AdminFrame role={role} activeRoute={routeId} onNavigate={onNavigate}>
        <div className="prototype-placeholder prototype-placeholder--admin">
          <div>
            <StatusPill status="plain">全局经营指挥台</StatusPill>
            <h2>平台经营一屏掌握</h2>
            <p>门店、风险、AI 配额与系统任务将在这里形成统一运营视图。</p>
          </div>
          <SurfaceCard tone="warm">
            <span className="prototype-placeholder__eyebrow">今日平台脉冲</span>
            <strong>42 家门店在线</strong>
            <Sparkline values={[18, 22, 21, 28, 30, 36, 42]} label="近七日在线门店趋势" />
          </SurfaceCard>
        </div>
      </AdminFrame>
    );
  }

  const merchant = surface === "merchant";
  const tabs = merchant
    ? merchantTabs(role).map((tab) => ({ ...tab, ...merchantTabPresentation[tab.id] }))
    : customerTabs;

  return (
    <MiniProgramFrame
      title={merchant ? "燎客商家" : "燎客 AI"}
      tabs={tabs}
      activeRoute={routeId}
      onNavigate={onNavigate}
    >
      <div className={`prototype-placeholder${merchant ? " prototype-placeholder--merchant" : ""}`}>
        <SurfaceCard tone="hero">
          <div className="prototype-placeholder__copy">
            <StatusPill status={merchant ? "success" : "reward"}>
              {merchant ? "经营工作台" : "牛里牛气 · A12桌"}
            </StatusPill>
            <h2>{merchant ? "今天的增长，清清楚楚" : "欢迎落座，先点亮今天的福利"}</h2>
            <p>
              {merchant
                ? "角色化导航会让老板、店长和店员只看到此刻需要的工作。"
                : "首页、权益、AI 创作、积分与我的，共用一套温暖而清晰的星火体验。"}
            </p>
            <PrimaryButton onClick={() => onNavigate(merchant ? "verify-hub" : "benefits")}>
              {merchant ? "进入快捷核销" : "查看今日权益"}
            </PrimaryButton>
          </div>
          <BrandMascot kind={merchant ? "merchant" : "welcome"} />
        </SurfaceCard>
      </div>
    </MiniProgramFrame>
  );
}

export default function PrototypeApp() {
  const query = new URLSearchParams(window.location.search);
  const requestedSurface = query.get("surface");
  const initialSurface = SURFACES.includes(requestedSurface) ? requestedSurface : "customer";
  const requestedRoute = query.get("route");
  const initialRoute = getRoute(initialSurface, requestedRoute)
    ? requestedRoute
    : surfaceDefaults[initialSurface];
  const requestedScenario = query.get("scenario");
  const initialScenario = SCENARIOS.some(({ id }) => id === requestedScenario)
    ? requestedScenario
    : "returning-customer";
  const initialRole = normalizeRole(initialSurface, query.get("role"));

  const [surface, setSurface] = useState(initialSurface);
  const [routeId, setRouteId] = useState(initialRoute);
  const [scenarioId, setScenarioId] = useState(initialScenario);
  const [role, setRole] = useState(initialRole);
  const [state, setState] = useState(() => createScenarioState(initialScenario));

  const dispatch = useCallback((event) => {
    setState((current) => transition(current, event));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ surface, route: routeId, scenario: scenarioId });
    if (role) params.set("role", role);
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  }, [role, routeId, scenarioId, surface]);

  const handleSurfaceChange = (nextSurface) => {
    setSurface(nextSurface);
    setRouteId(surfaceDefaults[nextSurface]);
    setRole(normalizeRole(nextSurface, role));
  };

  const handleRoleChange = (nextRole) => {
    const normalizedRole = normalizeRole(surface, nextRole);
    setRole(normalizedRole);
    if (surface === "merchant" && normalizedRole === "staff") setRouteId("verify-hub");
  };

  const handleScenarioChange = (nextScenarioId) => {
    setScenarioId(nextScenarioId);
    setState(createScenarioState(nextScenarioId));
  };

  const surfaceModule = surfaceModules[surfaceRendererPaths[surface]];
  const SurfaceRenderer = surfaceModule?.default
    ?? surfaceModule?.[surfaceRendererNames[surface]];
  const rendererProps = { routeId, role, state, dispatch, onNavigate: setRouteId };

  return (
    <PrototypeShell
      surface={surface}
      routeId={routeId}
      scenarioId={scenarioId}
      role={role}
      routes={getRoutesForSurface(surface)}
      onSurfaceChange={handleSurfaceChange}
      onRouteChange={setRouteId}
      onScenarioChange={handleScenarioChange}
      onRoleChange={handleRoleChange}
    >
      {SurfaceRenderer
        ? <SurfaceRenderer {...rendererProps} />
        : <SurfacePreview surface={surface} {...rendererProps} />}
    </PrototypeShell>
  );
}
