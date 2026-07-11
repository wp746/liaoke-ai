import React, { useState } from "react";
import { Download, Gift, PackagePlus, Settings, Store, UserPlus, UsersRound } from "lucide-react";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";
import { canMerchant } from "../permissions.js";
import { fixtures } from "../fixtures.js";

export const ACTIVITY_TEMPLATES = [
  { id: "referral", name: "老带新奖励（常驻）", description: "配置抵扣券面值、有效期和每月上限", tag: "核心裂变" },
  { id: "birthday", name: "生日礼", description: "会员生日前自动发送礼品或优惠券", tag: "会员关怀" },
  { id: "weekday", name: "工作日福利", description: "周一至周四提供折扣或菜品福利", tag: "填淡谷" },
  { id: "share", name: "晒圈送券", description: "AI 晒圈后凭截图领取奖励券", tag: "提升参与" },
];

const fieldStyle = { display: "grid", gap: 6, fontSize: 11, fontWeight: 750 };
const inputStyle = { minHeight: 38, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 11, background: "#fff" };
const cardGrid = { display: "grid", gap: 10 };

function PageHeader({ eyebrow, title, body }) {
  return <header style={cardGrid}><span className="merchant-eyebrow">{eyebrow}</span><h1>{title}</h1>{body && <p className="merchant-readonly">{body}</p>}</header>;
}

function Activities({ onNavigate, onSelectTemplate }) {
  return <main className="merchant-page">
    <PageHeader eyebrow={<><Gift size={14} /> 运营玩法</>} title="活动列表" body="选一个经过验证的餐饮玩法，再按门店情况调整。" />
    <section style={cardGrid} aria-label="活动模板">
      {ACTIVITY_TEMPLATES.map((template) => <button key={template.id} type="button" className="ui-card ui-card--plain" style={{ ...cardGrid, textAlign: "left" }} onClick={() => { onSelectTemplate(template.id); onNavigate("activity-editor"); }}>
        <StatusPill status={template.id === "referral" ? "success" : "plain"}>{template.tag}</StatusPill>
        <strong>{template.name}</strong><span className="merchant-readonly">{template.description}</span>
      </button>)}
    </section>
    <button type="button" className="merchant-secondary-action" onClick={() => onNavigate("benefit-policy")}>配置返现与推荐策略</button>
  </main>;
}

function ActivityEditor({ selectedTemplate }) {
  const template = ACTIVITY_TEMPLATES.find(({ id }) => id === selectedTemplate) ?? ACTIVITY_TEMPLATES[0];
  return <main className="merchant-page">
    <PageHeader eyebrow="活动配置" title="活动编辑" body="发布后会同步更新燎小星用户话术。" />
    <SurfaceCard tone="warm"><div style={cardGrid}>
      <label style={fieldStyle}>活动模板<select aria-label="活动模板" value={template.id} onChange={() => {}} style={inputStyle}>{ACTIVITY_TEMPLATES.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label style={fieldStyle}>活动标题<input defaultValue={template.name.replace("（常驻）", "")} style={inputStyle} /></label>
      <label style={fieldStyle}>配置说明<textarea defaultValue={template.description} style={{ ...inputStyle, minHeight: 76 }} /></label>
      <PrimaryButton>发布活动</PrimaryButton>
    </div></SurfaceCard>
  </main>;
}

function NumberField({ label, defaultValue, min, max, suffix }) {
  return <label style={fieldStyle}>{label}<span style={{ display: "flex", alignItems: "center", gap: 7 }}><input aria-label={label} type="number" defaultValue={defaultValue} min={min} max={max} style={{ ...inputStyle, width: "100%" }} />{suffix && <small>{suffix}</small>}</span></label>;
}

function BenefitPolicy() {
  return <main className="merchant-page">
    <PageHeader eyebrow="权益成本" title="返现与推荐策略" body="设置后仅影响新发放的权益，历史权益保持原规则。" />
    <SurfaceCard tone="plain"><div style={cardGrid}>
      <NumberField label="消费返现比例" defaultValue="8" min="3" max="15" suffix="%" />
      <NumberField label="老带新抵扣券面值" defaultValue="10" min="5" max="20" suffix="元" />
      <label style={fieldStyle}>抵扣券有效期<select aria-label="抵扣券有效期" defaultValue="30" style={inputStyle}><option value="30">30 天</option><option value="45">45 天</option><option value="60">60 天</option></select></label>
      <NumberField label="每人每月领取上限" defaultValue="10" min="1" max="20" suffix="张" />
      <NumberField label="新客首单优惠券面值" defaultValue="10" min="0" max="30" suffix="元" />
      <NumberField label="成本预警阈值" defaultValue="12" min="1" max="100" suffix="%" />
      <PrimaryButton>保存权益策略</PrimaryButton>
    </div></SurfaceCard>
  </main>;
}

function PointsProducts({ products, onNavigate }) {
  return <main className="merchant-page">
    <PageHeader eyebrow={<><Gift size={14} /> 礼品与服务</>} title="积分商品" body="积分只能兑换赠品或服务，不抵现金。" />
    <PrimaryButton onClick={() => onNavigate("points-product-editor")}><PackagePlus size={16} />新建积分商品</PrimaryButton>
    <section style={cardGrid}>{products.map((product) => <SurfaceCard key={product.id} tone="plain"><div style={cardGrid}><StatusPill status="success">已上架</StatusPill><strong>{product.name}</strong><span className="merchant-readonly">{product.category} · {product.points} 积分 · 库存 {product.stock} · 每月 {product.monthlyLimit} 份</span></div></SurfaceCard>)}</section>
  </main>;
}

function PointsProductEditor() {
  return <main className="merchant-page">
    <PageHeader eyebrow="商品配置" title="积分商品编辑" body="配置完成后可上架到顾客的积分商城。" />
    <SurfaceCard tone="plain"><div style={cardGrid}>
      <label style={fieldStyle}>商品图片<input aria-label="商品图片" type="url" placeholder="https://" style={inputStyle} /></label>
      <label style={fieldStyle}>商品分类<select aria-label="商品分类" defaultValue="drink" style={inputStyle}><option value="drink">饮品</option><option value="dish">小菜</option><option value="snack">小吃</option><option value="service">服务</option></select></label>
      <NumberField label="所需积分" defaultValue="500" min="1" />
      <NumberField label="库存" defaultValue="99" min="0" />
      <NumberField label="每人每月上限" defaultValue="2" min="1" />
      <label style={fieldStyle}>上架状态<select aria-label="上架状态" defaultValue="active" style={inputStyle}><option value="active">已上架</option><option value="inactive">已下架</option></select></label>
      <PrimaryButton>保存积分商品</PrimaryButton>
    </div></SurfaceCard>
  </main>;
}

const pointsDefaults = [
  ["每消费 1 元", "10"], ["每日到店签到", "5"], ["AI 晒圈成功", "50"], ["完善个人资料", "100"], ["生日当月到店", "200"],
];

function PointsRules({ role }) {
  if (!canMerchant(role, "points:write")) return <main className="merchant-page merchant-permission-state"><SurfaceCard tone="warm"><StatusPill status="danger">只读</StatusPill><h1>积分规则配置</h1><p>老板权限才能修改积分规则</p></SurfaceCard></main>;
  return <main className="merchant-page">
    <PageHeader eyebrow="积分体系" title="积分规则配置" body="积分不抵现金、不可提现、不可转让。" />
    <SurfaceCard tone="plain"><div style={cardGrid}>
      {pointsDefaults.map(([label, value]) => <NumberField key={label} label={label} defaultValue={value} min="0" suffix="积分" />)}
      <label style={fieldStyle}>积分有效期<select aria-label="积分有效期" defaultValue="365" style={inputStyle}><option value="90">90 天</option><option value="180">180 天</option><option value="365">365 天</option><option value="forever">永久</option></select></label>
      <PrimaryButton>保存积分规则</PrimaryButton>
    </div></SurfaceCard>
  </main>;
}

function Employees() {
  const employees = [["王老板", "老板", "2026-07-11 09:08"], ["陈店长", "店长", "2026-07-11 13:18"], ["李店员", "店员", "2026-07-11 14:32"]];
  return <main className="merchant-page"><PageHeader eyebrow={<><UsersRound size={14} /> 账号与权限</>} title="员工管理" body="只有老板可以新增、移除员工或修改角色。" /><PrimaryButton><UserPlus size={16} />添加员工</PrimaryButton><section style={cardGrid}>{employees.map(([name, role, time]) => <SurfaceCard key={name} tone="plain"><div style={cardGrid}><strong>{name}</strong><span className="merchant-readonly">{role} · 最近登录 {time}</span></div></SurfaceCard>)}</section></main>;
}

function StoreSettings({ state, dispatch }) {
  const paused = state.store.paused;
  return <main className="merchant-page"><PageHeader eyebrow={<><Store size={14} /> 门店设置</>} title={state.store.name} body="暂停后顾客无法领取或核销权益，返现余额有效期自动顺延。" /><SurfaceCard tone={paused ? "plain" : "warm"}><div style={cardGrid}><StatusPill status={paused ? "danger" : "success"}>{paused ? "已暂停" : "正常"}</StatusPill><strong>{paused ? "门店已暂停营业" : "门店正常营业"}</strong><PrimaryButton onClick={() => dispatch({ type: paused ? "RESUME_STORE" : "PAUSE_STORE" })}>{paused ? "恢复营业" : "暂停营业"}</PrimaryButton></div></SurfaceCard></main>;
}

function MerchantPlan({ role }) {
  const owner = role === "owner";
  return <main className="merchant-page"><PageHeader eyebrow="套餐与账单" title="当前套餐" body={owner ? "老板可以续费或升级门店套餐。" : "当前账号可查看套餐，付费操作仅老板可用。"}/><SurfaceCard tone="warm"><div style={cardGrid}><strong>当前套餐：成长版 Pro</strong><span className="merchant-readonly">¥399 / 月 · 2027-06-30 到期 · 剩余 354 天</span>{owner && <div style={{ display: "flex", gap: 8 }}><PrimaryButton>续费</PrimaryButton><button className="merchant-secondary-action">升级套餐</button></div>}</div></SurfaceCard></main>;
}

const exportLabels = { queued: "排队中", processing: "生成中", ready: "可下载", failed: "生成失败" };

function ExportJob() {
  const [status, setStatus] = useState("idle");
  return <SurfaceCard tone="plain"><div style={cardGrid}>
    <span className="merchant-eyebrow"><Download size={14} /> 数据导出</span><h2>数据导出</h2>
    <label style={fieldStyle}>报表类型<select aria-label="报表类型" defaultValue="operation" style={inputStyle}><option value="members">会员列表</option><option value="activity">活动报表</option><option value="operation">月度经营总表</option></select></label>
    {status === "idle" && <PrimaryButton onClick={() => setStatus("queued")}>生成报表</PrimaryButton>}
    {status !== "idle" && <><span role="status">{exportLabels[status]}</span><small className="merchant-readonly">任务 EXP-20260711-001 · 全程记录操作账号与时间</small></>}
    {status === "queued" && <button type="button" className="merchant-secondary-action" onClick={() => setStatus("processing")}>开始生成</button>}
    {status === "processing" && <div style={{ display: "flex", gap: 8 }}><button type="button" className="merchant-secondary-action" onClick={() => setStatus("ready")}>模拟完成</button><button type="button" className="merchant-secondary-action" onClick={() => setStatus("failed")}>模拟失败</button></div>}
    {status === "ready" && <a href="data:text/plain,燎客门店经营报表" download="liaoke-report.csv">下载报表</a>}
    {status === "failed" && <button type="button" className="merchant-secondary-action" onClick={() => setStatus("queued")}>重试</button>}
  </div></SurfaceCard>;
}

function MerchantAccount({ role, state }) {
  const canExport = canMerchant(role, "export");
  return <main className="merchant-page merchant-account"><PageHeader eyebrow={<><Settings size={14} /> 账号安全</>} title="我的账号" body="账号与门店身份信息"/><SurfaceCard tone="warm"><span className="merchant-eyebrow"><Store size={14}/>当前门店</span><strong>{state.store.name}</strong><span>{role === "owner" ? "老板" : role === "manager" ? "店长" : "店员"}账号 · 已登录</span></SurfaceCard>{canExport ? <ExportJob /> : <small className="merchant-readonly">数据导出仅老板账号可用</small>}</main>;
}

export function OperationsPages({ routeId, role, state, dispatch, onNavigate, selectedTemplate, onSelectTemplate }) {
  if (routeId === "activities") return <Activities onNavigate={onNavigate} onSelectTemplate={onSelectTemplate} />;
  if (routeId === "activity-editor") return <ActivityEditor selectedTemplate={selectedTemplate} />;
  if (routeId === "benefit-policy") return <BenefitPolicy />;
  if (routeId === "points-products") return <PointsProducts products={state.pointsProducts ?? fixtures.pointsProducts} onNavigate={onNavigate} />;
  if (routeId === "points-product-editor") return <PointsProductEditor />;
  if (routeId === "points-rules") return <PointsRules role={role} />;
  if (routeId === "employees") return <Employees />;
  if (routeId === "store-settings") return <StoreSettings state={state} dispatch={dispatch} />;
  if (routeId === "merchant-plan") return <MerchantPlan role={role} />;
  return <MerchantAccount role={role} state={state} />;
}
