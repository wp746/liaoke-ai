import React, { useEffect, useState } from "react";
import { ChevronDown, MonitorCog, SlidersHorizontal } from "lucide-react";
import { SCENARIOS } from "../scenarioStore.js";
import { BrandMark } from "./Brand.jsx";

const surfaces = [
  { id: "customer", label: "顾客端", note: "微信小程序" },
  { id: "merchant", label: "商家端", note: "角色化工作台" },
  { id: "admin", label: "平台后台", note: "Web 指挥台" },
];

const roles = {
  merchant: [
    { id: "owner", label: "老板" },
    { id: "manager", label: "店长" },
    { id: "staff", label: "店员" },
  ],
  admin: [
    { id: "super_admin", label: "超级管理员" },
    { id: "platform_admin", label: "平台运营（只读）" },
  ],
};

export function PrototypeShell({
  surface,
  routeId,
  scenarioId,
  role,
  routes,
  onSurfaceChange,
  onRouteChange,
  onScenarioChange,
  onRoleChange,
  children,
}) {
  const roleOptions = roles[surface] ?? [];
  const [inspectorOpen, setInspectorOpen] = useState(() => window.matchMedia("(min-width: 900px)").matches);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px)");
    const handleLayoutChange = (event) => setInspectorOpen(event.matches);
    desktop.addEventListener("change", handleLayoutChange);
    return () => desktop.removeEventListener("change", handleLayoutChange);
  }, []);

  return (
    <main className="prototype-shell">
      <header className="prototype-header">
        <BrandMark compact />
        <div className="prototype-heading">
          <span className="prototype-kicker"><MonitorCog size={14} /> Spark OS / 可交互产品评审</span>
          <h1>燎客 AI 三端高保真原型</h1>
        </div>
        <div className="prototype-version">Prototype · v3.1</div>
      </header>

      <nav className="surface-switcher" aria-label="原型端选择">
        {surfaces.map((item) => (
          <button
            type="button"
            key={item.id}
            className={surface === item.id ? "is-active" : ""}
            aria-pressed={surface === item.id}
            onClick={() => onSurfaceChange(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.note}</span>
          </button>
        ))}
      </nav>

      <div className="prototype-workspace">
        <section className="prototype-stage" data-surface={surface} aria-live="polite">
          <div className="prototype-stage__halo" aria-hidden="true" />
          {children}
        </section>

        <details
          className="prototype-inspector"
          open={inspectorOpen}
          onToggle={(event) => setInspectorOpen(event.currentTarget.open)}
        >
          <summary aria-label="原型控制台" title="原型控制台">
            <SlidersHorizontal size={17} />
            <span className="prototype-inspector__label">原型控制台</span>
            <ChevronDown className="prototype-inspector__chevron" size={16} />
          </summary>
          <div className="prototype-inspector__body">
            <div className="prototype-inspector__heading">
              <span><SlidersHorizontal size={16} /> 实时检查器</span>
              <small>无需刷新即可切换状态</small>
            </div>

            <label className="prototype-field">
              <span>当前页面</span>
              <select value={routeId} onChange={(event) => onRouteChange(event.target.value)}>
                {routes.map((route) => (
                  <option value={route.id} key={route.id}>{route.title}</option>
                ))}
              </select>
            </label>

            <label className="prototype-field">
              <span>演示场景</span>
              <select value={scenarioId} onChange={(event) => onScenarioChange(event.target.value)}>
                {SCENARIOS.map((scenario) => (
                  <option value={scenario.id} key={scenario.id}>{scenario.label}</option>
                ))}
              </select>
            </label>

            {roleOptions.length ? (
              <fieldset className="prototype-role-field">
                <legend>演示角色</legend>
                <div>
                  {roleOptions.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={role === option.id ? "is-active" : ""}
                      aria-pressed={role === option.id}
                      onClick={() => onRoleChange(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="prototype-context">
              <span>Surface</span><code>{surface}</code>
              <span>Route</span><code>{routeId}</code>
              <span>Scenario</span><code>{scenarioId}</code>
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}
