import React, { useEffect } from "react";
import { Download, Gift, PackagePlus, Settings, Store, UserPlus, UsersRound } from "lucide-react";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";
import { canMerchant } from "../permissions.js";

export const ACTIVITY_TEMPLATES = [
  { id: "referral", name: "老带新奖励（常驻）", description: "配置抵扣券面值、有效期和每月上限", tag: "核心裂变" },
  { id: "birthday", name: "生日礼", description: "会员生日前自动发送礼品或优惠券", tag: "会员关怀" },
  { id: "weekday", name: "工作日福利", description: "周一至周四提供折扣或菜品福利", tag: "填淡谷" },
  { id: "share", name: "好友首单礼", description: "好友完成绑定并完成首次符合条件的消费后，推荐券自动发放", tag: "有效推荐" },
];

const fieldStyle = { display: "grid", gap: 6, fontSize: 11, fontWeight: 750 };
const inputStyle = { minHeight: 38, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 11, background: "#fff" };
const cardGrid = { display: "grid", gap: 10 };
const roleLabels = { owner: "老板", manager: "店长", staff: "店员" };
const exportLabels = { queued: "排队中", processing: "生成中", ready: "可下载", failed: "生成失败" };
const exportTypeLabels = { members: "会员列表", activity: "活动报表", operation: "月度经营总表" };

function PageHeader({ eyebrow, title, body }) {
  return <header style={cardGrid}><span className="merchant-eyebrow">{eyebrow}</span><h1>{title}</h1>{body && <p className="merchant-readonly">{body}</p>}</header>;
}

function Feedback({ operations }) {
  if (!operations.feedback) return null;
  return operations.feedbackKind === "error"
    ? <p role="alert" className="merchant-cost-warning">{operations.feedback}</p>
    : <p role="status" className="merchant-prototype-feedback">{operations.feedback}</p>;
}

function NumberField({ label, value, min, max, suffix, onChange }) {
  return <label style={fieldStyle}>{label}<span style={{ display: "flex", alignItems: "center", gap: 7 }}><input aria-label={label} type="number" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} style={{ ...inputStyle, width: "100%" }} />{suffix && <small>{suffix}</small>}</span></label>;
}

function Activities({ operations, dispatch, role, onNavigate }) {
  const selectTemplate = (template) => {
    for (const [field, value] of [["templateId", template.id], ["title", template.name.replace("（常驻）", "")], ["description", template.description]]) dispatch({ type: "UPDATE_ACTIVITY_DRAFT", actorRole: role, field, value });
    onNavigate("activity-editor");
  };
  return <main className="merchant-page"><PageHeader eyebrow={<><Gift size={14} /> 运营玩法</>} title="活动列表" body="选一个经过验证的餐饮玩法，再按门店情况调整。" />
    <section style={cardGrid} aria-label="活动模板">{ACTIVITY_TEMPLATES.map((template) => <button key={template.id} type="button" className="ui-card ui-card--plain" style={{ ...cardGrid, textAlign: "left" }} onClick={() => selectTemplate(template)}><StatusPill status={operations.activities.some(({ templateId }) => templateId === template.id) ? "success" : "plain"}>{operations.activities.some(({ templateId }) => templateId === template.id) ? "已发布" : template.tag}</StatusPill><strong>{template.name}</strong><span className="merchant-readonly">{template.description}</span></button>)}</section>
    <button type="button" className="merchant-secondary-action" onClick={() => onNavigate("benefit-policy")}>配置返现与推荐策略</button></main>;
}

function ActivityEditor({ operations, dispatch, role }) {
  const draft = operations.activityDraft;
  const update = (field, value) => dispatch({ type: "UPDATE_ACTIVITY_DRAFT", actorRole: role, field, value });
  const changeTemplate = (templateId) => {
    const template = ACTIVITY_TEMPLATES.find(({ id }) => id === templateId);
    update("templateId", template.id); update("title", template.name.replace("（常驻）", "")); update("description", template.description);
  };
  return <main className="merchant-page"><PageHeader eyebrow="活动配置" title="活动编辑" body="发布后会同步更新燎小星用户话术。" /><SurfaceCard tone="warm"><div style={cardGrid}>
    <label style={fieldStyle}>活动模板<select aria-label="活动模板" value={draft.templateId} onChange={(event) => changeTemplate(event.target.value)} style={inputStyle}>{ACTIVITY_TEMPLATES.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select></label>
    <label style={fieldStyle}>活动标题<input aria-label="活动标题" value={draft.title} onChange={(event) => update("title", event.target.value)} style={inputStyle} /></label>
    <label style={fieldStyle}>配置说明<textarea aria-label="配置说明" value={draft.description} onChange={(event) => update("description", event.target.value)} style={{ ...inputStyle, minHeight: 76 }} /></label>
    <PrimaryButton onClick={() => dispatch({ type: "PUBLISH_ACTIVITY", actorRole: role })}>发布活动</PrimaryButton><Feedback operations={operations} />
  </div></SurfaceCard></main>;
}

function BenefitPolicy({ operations, dispatch, role }) {
  const policy = operations.benefitPolicyDraft;
  const update = (field, value) => dispatch({ type: "UPDATE_BENEFIT_POLICY", actorRole: role, field, value });
  useEffect(() => () => dispatch({ type: "RESET_BENEFIT_POLICY_DRAFT", actorRole: role }), [dispatch, role]);
  return <main className="merchant-page"><PageHeader eyebrow="权益成本" title="返现与推荐策略" body="设置后仅影响新发放的权益，历史权益保持原规则。" /><SurfaceCard tone="plain"><div style={cardGrid}>
    <NumberField label="消费返现比例" value={policy.cashbackRate} min="3" max="15" suffix="%" onChange={(value) => update("cashbackRate", value)} />
    <NumberField label="老带新抵扣券面值" value={policy.referralValue} min="5" max="20" suffix="元" onChange={(value) => update("referralValue", value)} />
    <label style={fieldStyle}>抵扣券有效期<select aria-label="抵扣券有效期" value={policy.validityDays} onChange={(event) => update("validityDays", event.target.value)} style={inputStyle}><option value="30">30 天</option><option value="45">45 天</option><option value="60">60 天</option></select></label>
    <NumberField label="每人每月领取上限" value={policy.monthlyLimit} min="1" max="20" suffix="张" onChange={(value) => update("monthlyLimit", value)} />
    <NumberField label="新客首单优惠券面值" value={policy.newCustomerValue} min="0" max="30" suffix="元" onChange={(value) => update("newCustomerValue", value)} />
    <NumberField label="成本预警阈值" value={policy.costAlert} min="1" max="100" suffix="%" onChange={(value) => update("costAlert", value)} />
    <PrimaryButton onClick={() => dispatch({ type: "SAVE_BENEFIT_POLICY", actorRole: role })}>保存权益策略</PrimaryButton><Feedback operations={operations} />
  </div></SurfaceCard></main>;
}

function PointsProducts({ operations, onNavigate }) {
  return <main className="merchant-page"><PageHeader eyebrow={<><Gift size={14} /> 礼品与服务</>} title="积分商品" body="积分只能兑换赠品或服务，不抵现金。" /><PrimaryButton onClick={() => onNavigate("points-product-editor")}><PackagePlus size={16} />新建积分商品</PrimaryButton><section style={cardGrid}>{operations.pointsProducts.map((product) => <SurfaceCard key={product.id} tone="plain"><div style={cardGrid}><StatusPill status={product.active ? "success" : "plain"}>{product.active ? "已上架" : "已下架"}</StatusPill><strong>{product.name}</strong><span className="merchant-readonly">{product.category} · {product.points} 积分 · 库存 {product.stock} · 每月 {product.monthlyLimit} 份</span></div></SurfaceCard>)}</section></main>;
}

function PointsProductEditor({ operations, dispatch, role }) {
  const draft = operations.pointsProductDraft;
  const update = (field, value) => dispatch({ type: "UPDATE_POINTS_PRODUCT_DRAFT", actorRole: role, field, value });
  return <main className="merchant-page"><PageHeader eyebrow="商品配置" title="积分商品编辑" body="配置完成后可上架到顾客的积分商城。" /><SurfaceCard tone="plain"><div style={cardGrid}>
    <label style={fieldStyle}>商品名称<input aria-label="商品名称" value={draft.name} onChange={(event) => update("name", event.target.value)} style={inputStyle} /></label>
    <label style={fieldStyle}>商品图片<input aria-label="商品图片" type="url" value={draft.image} onChange={(event) => update("image", event.target.value)} style={inputStyle} /></label>
    <label style={fieldStyle}>商品分类<select aria-label="商品分类" value={draft.category} onChange={(event) => update("category", event.target.value)} style={inputStyle}>{["饮品", "小菜", "小吃", "服务"].map((value) => <option key={value}>{value}</option>)}</select></label>
    <NumberField label="所需积分" value={draft.points} min="1" onChange={(value) => update("points", value)} />
    <NumberField label="库存" value={draft.stock} min="0" onChange={(value) => update("stock", value)} />
    <NumberField label="每人每月上限" value={draft.monthlyLimit} min="1" onChange={(value) => update("monthlyLimit", value)} />
    <label style={fieldStyle}>上架状态<select aria-label="上架状态" value={draft.active ? "active" : "inactive"} onChange={(event) => update("active", event.target.value === "active")} style={inputStyle}><option value="active">已上架</option><option value="inactive">已下架</option></select></label>
    <PrimaryButton onClick={() => dispatch({ type: "SAVE_POINTS_PRODUCT", actorRole: role })}>保存积分商品</PrimaryButton><Feedback operations={operations} />
  </div></SurfaceCard></main>;
}

const pointsFields = [["每消费 1 元", "spend"], ["每日到店签到", "checkIn"], ["AI 晒圈成功", "aiShare"], ["完善个人资料", "profile"], ["生日当月到店", "birthday"]];

function PointsRules({ role, operations, dispatch }) {
  useEffect(() => role === "owner" ? () => dispatch({ type: "RESET_POINTS_RULES_DRAFT", actorRole: role }) : undefined, [dispatch, role]);
  if (!canMerchant(role, "points:write")) return <main className="merchant-page merchant-permission-state"><SurfaceCard tone="warm"><StatusPill status="danger">只读</StatusPill><h1>积分规则配置</h1><p>老板权限才能修改积分规则</p></SurfaceCard></main>;
  const rules = operations.pointsRulesDraft;
  const update = (field, value) => dispatch({ type: "UPDATE_POINTS_RULE", actorRole: role, field, value });
  return <main className="merchant-page"><PageHeader eyebrow="积分体系" title="积分规则配置" body="积分不抵现金、不可提现、不可转让。" /><SurfaceCard tone="plain"><div style={cardGrid}>{pointsFields.map(([label, field]) => <NumberField key={field} label={label} value={rules[field]} min="0" suffix="积分" onChange={(value) => update(field, value)} />)}<label style={fieldStyle}>积分有效期<select aria-label="积分有效期" value={rules.expiryDays} onChange={(event) => update("expiryDays", event.target.value === "forever" ? "forever" : Number(event.target.value))} style={inputStyle}><option value="90">90 天</option><option value="180">180 天</option><option value="365">365 天</option><option value="forever">永久</option></select></label><PrimaryButton onClick={() => dispatch({ type: "SAVE_POINTS_RULES", actorRole: role })}>保存积分规则</PrimaryButton><Feedback operations={operations} /></div></SurfaceCard></main>;
}

function Employees({ role, operations, dispatch }) {
  return <main className="merchant-page"><PageHeader eyebrow={<><UsersRound size={14} /> 账号与权限</>} title="员工管理" body="只有老板可以新增、移除员工或修改角色。" /><PrimaryButton onClick={() => dispatch({ type: "ADD_EMPLOYEE", actorRole: role })}><UserPlus size={16} />添加员工</PrimaryButton><Feedback operations={operations} /><section style={cardGrid}>{operations.employees.map((employee) => <article key={employee.id} className="ui-card ui-card--plain" style={cardGrid}><strong>{employee.name}</strong><span className="merchant-readonly">最近登录 {employee.lastLogin}</span>{employee.role === "owner" ? <StatusPill status="success">老板</StatusPill> : <><label style={fieldStyle}>员工角色<select aria-label="员工角色" value={employee.role} onChange={(event) => dispatch({ type: "UPDATE_EMPLOYEE_ROLE", actorRole: role, employeeId: employee.id, role: event.target.value })} style={inputStyle}><option value="manager">店长</option><option value="staff">店员</option></select></label><button type="button" className="merchant-secondary-action" onClick={() => window.confirm(`确认移除${employee.name}？`) && dispatch({ type: "REMOVE_EMPLOYEE", actorRole: role, employeeId: employee.id })}>移除员工</button></>}</article>)}</section></main>;
}

function StoreSettings({ role, state, dispatch }) {
  const paused = state.store.paused;
  return <main className="merchant-page"><PageHeader eyebrow={<><Store size={14} /> 门店设置</>} title={state.store.name} body="暂停后顾客无法领取或核销权益，返现余额有效期自动顺延。" /><SurfaceCard tone={paused ? "plain" : "warm"}><div style={cardGrid}><StatusPill status={paused ? "danger" : "success"}>{paused ? "已暂停" : "正常"}</StatusPill><strong>{paused ? "门店已暂停营业" : "门店正常营业"}</strong><PrimaryButton onClick={() => dispatch({ type: paused ? "RESUME_STORE" : "PAUSE_STORE", actorRole: role })}>{paused ? "恢复营业" : "暂停营业"}</PrimaryButton></div></SurfaceCard></main>;
}

function MerchantPlan({ role, operations, dispatch }) {
  const owner = role === "owner"; const plan = operations.plan;
  return <main className="merchant-page"><PageHeader eyebrow="套餐与账单" title="当前套餐" body={owner ? "老板可以续费或升级门店套餐。" : "当前账号可查看套餐，付费操作仅老板可用。"}/><SurfaceCard tone="warm"><div style={cardGrid}><strong>当前套餐：{plan.name}</strong><span className="merchant-readonly">¥{plan.price} / 月 · {plan.expireDate} 到期 · 剩余 {plan.remainingDays} 天</span>{owner && <div style={{ display: "flex", gap: 8 }}><PrimaryButton onClick={() => dispatch({ type: "RENEW_PLAN", actorRole: role })}>续费</PrimaryButton><button type="button" className="merchant-secondary-action" onClick={() => dispatch({ type: "UPGRADE_PLAN", actorRole: role })}>升级套餐</button></div>}<Feedback operations={operations} /></div></SurfaceCard></main>;
}

function ExportJob({ role, operations, dispatch }) {
  const task = operations.exportTasks[0];
  useEffect(() => {
    if (!task || !["queued", "processing"].includes(task.status)) return undefined;
    const event = task.status === "queued" ? "PROCESS_EXPORT" : "COMPLETE_EXPORT";
    const timer = window.setTimeout(() => dispatch({ type: event, actorRole: role, taskId: task.id }), 80);
    return () => window.clearTimeout(timer);
  }, [dispatch, role, task]);
  return <SurfaceCard tone="plain"><div style={cardGrid}><span className="merchant-eyebrow"><Download size={14} /> 数据导出</span><h2>数据导出</h2><label style={fieldStyle}>报表类型<select aria-label="报表类型" value={operations.exportDraftType} onChange={(event) => dispatch({ type: "UPDATE_EXPORT_TYPE", actorRole: role, exportType: event.target.value })} style={inputStyle}><option value="members">会员列表</option><option value="activity">活动报表</option><option value="operation">月度经营总表</option></select></label><PrimaryButton onClick={() => dispatch({ type: "SUBMIT_EXPORT", actorRole: role, exportType: operations.exportDraftType })}>生成报表</PrimaryButton>{task && <section style={cardGrid}><span role="status">{exportLabels[task.status]}</span><strong>{exportTypeLabels[task.type]}</strong><small data-testid="export-task-id">{task.id}</small>{task.status === "ready" && <><a href="data:text/plain,燎客门店经营报表" download="liaoke-report.csv">下载报表</a><small className="merchant-readonly">原型仅下载演示文件，不包含真实经营数据。</small></>}{task.status === "failed" && <><small role="alert">任务生成失败，请重试生成。</small><button type="button" className="merchant-secondary-action" onClick={() => dispatch({ type: "RETRY_EXPORT", actorRole: role, taskId: task.id })}>重试生成</button></>}</section>}</div></SurfaceCard>;
}

function MerchantAccount({ role, state, dispatch }) {
  return <main className="merchant-page merchant-account"><PageHeader eyebrow={<><Settings size={14} /> 账号安全</>} title="我的账号" body="账号与门店身份信息"/><SurfaceCard tone="warm"><span className="merchant-eyebrow"><Store size={14}/>当前门店</span><strong>{state.store.name}</strong><span>{roleLabels[role]}账号 · 已登录</span></SurfaceCard>{canMerchant(role, "export") ? <ExportJob role={role} operations={state.operations} dispatch={dispatch} /> : <small className="merchant-readonly">数据导出仅老板账号可用</small>}</main>;
}

export function OperationsPages({ routeId, role, state, dispatch, onNavigate }) {
  const props = { role, operations: state.operations, dispatch, onNavigate };
  if (routeId === "activities") return <Activities {...props} />;
  if (routeId === "activity-editor") return <ActivityEditor {...props} />;
  if (routeId === "benefit-policy") return <BenefitPolicy {...props} />;
  if (routeId === "points-products") return <PointsProducts {...props} />;
  if (routeId === "points-product-editor") return <PointsProductEditor {...props} />;
  if (routeId === "points-rules") return <PointsRules {...props} />;
  if (routeId === "employees") return <Employees {...props} />;
  if (routeId === "store-settings") return <StoreSettings role={role} state={state} dispatch={dispatch} />;
  if (routeId === "merchant-plan") return <MerchantPlan {...props} />;
  return <MerchantAccount role={role} state={state} dispatch={dispatch} />;
}
