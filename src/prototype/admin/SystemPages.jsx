import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const statusLabel = { active: "启用中", paused: "已暂停", failed: "失败", retrying: "等待重试", draft: "草稿", retired: "已退役" };
const promptStatus = { draft: "草稿", active: "生效中", retired: "已退役" };

function Page({ eyebrow, title, description, permissions, children }) {
  return <main className="admin-page"><header className="admin-page-heading"><div><span className="admin-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></header>{!permissions.canWrite && <p className="admin-readonly-note"><CheckCircle2 size={16} />只读运营视图：数据可查看，配置与执行操作仅限超级管理员。</p>}{children}</main>;
}

function DataTable({ label, headers, rows }) {
  return <section className="admin-panel admin-store-panel"><div className="admin-table-wrap"><table className="admin-store-table" aria-label={label}><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows}</tbody></table></div></section>;
}

function Feedback({ message }) { return message ? <p className="admin-feedback" role="status">{message}</p> : null; }

export function BenefitTemplatesPage({ permissions, adminState, dispatchAdmin }) {
  return <Page eyebrow="BENEFIT LIBRARY" title="权益预设模板" description="统一管理新门店可一键采用的权益基线。" permissions={permissions}><Feedback message={adminState.feedback} /><DataTable label="权益预设模板" headers={["模板", "默认规则", "状态", "操作"]} rows={adminState.benefitTemplates.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.rule}</td><td>{statusLabel[item.status]}</td><td>{permissions.canWrite ? <button type="button" className="admin-text-action" onClick={() => dispatchAdmin({ type: "TOGGLE_TEMPLATE", templateId: item.id })}>{item.status === "active" ? "暂停" : "启用"}{item.name}</button> : "只读"}</td></tr>)} /></Page>;
}

function QuotaBudgetControl({ item, dispatchAdmin }) {
  const [draft, setDraft] = useState(String(item.budget));
  const save = () => {
    const budget = Number(draft);
    dispatchAdmin({ type: "SAVE_AI_QUOTA", store: item.store, budget });
    setDraft(Number.isInteger(budget) && budget >= 1 && budget <= 100000 ? String(budget) : String(item.budget));
  };
  return <div className="admin-form-actions"><label><span className="sr-only">{item.store}月度预算</span><input type="number" min="1" max="100000" step="1" value={draft} onChange={(event) => setDraft(event.target.value)} /></label><button type="button" className="admin-text-action" onClick={save}>保存{item.store}月度预算</button></div>;
}

export function AiQuotaPage({ permissions, adminState, dispatchAdmin, onNavigate }) {
  return <Page eyebrow="AI CONTROL" title="AI 配额" description="按门店对照本周期已用量、预算与推理成本。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("ai-failures")}>查看失败任务</button><button type="button" className="admin-secondary-action" onClick={() => onNavigate("prompt-versions")}>管理提示词版本</button></div><Feedback message={adminState.feedback} /><DataTable label="门店 AI 配额" headers={["门店", "已用", "预算", "成本", "使用率"]} rows={adminState.aiQuota.map((item) => <tr key={item.store}><td><strong>{item.store}</strong></td><td>{item.used} 次</td><td>{permissions.canWrite ? <QuotaBudgetControl item={item} dispatchAdmin={dispatchAdmin} /> : `${item.budget} 次`}</td><td>{item.cost}</td><td>{Math.round(item.used / item.budget * 100)}%</td></tr>)} /></Page>;
}

export function AiFailuresPage({ permissions, adminState, dispatchAdmin, onNavigate }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = adminState.aiFailures.find(({ id }) => id === selectedId);
  return <Page eyebrow="FAILURE QUEUE" title="AI 失败任务" description="查看降级原因，并由超级管理员明确发起重试。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("ai-quota")}>返回 AI 配额</button></div><Feedback message={adminState.feedback} /><DataTable label="AI 失败任务" headers={["任务", "门店", "类型", "状态", "发生时间", "操作"]} rows={adminState.aiFailures.map((task) => <tr key={task.id}><td><strong>{task.id}</strong></td><td>{task.store}</td><td>{task.type}</td><td>{statusLabel[task.status]}</td><td>{task.time}</td><td><button type="button" className="admin-text-action" onClick={() => setSelectedId(task.id)}>查看任务 {task.id}</button></td></tr>)} />{selected && <section className="admin-panel" aria-label={`任务 ${selected.id} 详情`}><div className="admin-panel-heading"><div><span className="admin-eyebrow">TASK DETAIL</span><h2>{selected.id}</h2></div><span className="admin-state">{statusLabel[selected.status]}</span></div><p>{selected.detail}</p>{permissions.canWrite && selected.status === "failed" && <div className="admin-form-actions"><button type="button" className="admin-primary-action" onClick={() => dispatchAdmin({ type: "RETRY_AI_FAILURE", taskId: selected.id })}>重新执行</button></div>}</section>}</Page>;
}

export function PromptVersionsPage({ permissions, adminState, dispatchAdmin, onNavigate }) {
  return <Page eyebrow="PROMPT GOVERNANCE" title="提示词版本" description="保留草稿、生效与退役版本的完整治理链路。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("keywords")}>门店关键词与禁用词</button></div><Feedback message={adminState.feedback} /><DataTable label="提示词版本" headers={["版本", "状态", "负责人", "更新时间", "操作"]} rows={adminState.promptVersions.map((prompt) => <tr key={prompt.version}><td><strong>{prompt.version}</strong></td><td>{promptStatus[prompt.status]}</td><td>{prompt.owner}</td><td>{prompt.updatedAt}</td><td>{permissions.canWrite ? <div className="admin-form-actions">{prompt.status === "draft" && <button type="button" className="admin-text-action" onClick={() => dispatchAdmin({ type: "ACTIVATE_PROMPT", version: prompt.version })}>发布提示词 {prompt.version}</button>}<button type="button" className="admin-text-action" onClick={() => dispatchAdmin({ type: "COPY_PROMPT", version: prompt.version })}>复制提示词 {prompt.version}</button></div> : "只读"}</td></tr>)} /></Page>;
}

export function KeywordsPage({ permissions, adminState, dispatchAdmin, onNavigate }) {
  const [storeValue, setStoreValue] = useState(""); const [forbiddenValue, setForbiddenValue] = useState("");
  const add = (kind, value, clear) => { dispatchAdmin({ type: "ADD_KEYWORD", kind, value }); if (value.trim()) clear(""); };
  return <Page eyebrow="LANGUAGE SAFETY" title="关键词与禁用词" description="门店特色词参与生成，禁用词在所有生成任务前拦截。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("prompt-versions")}>返回提示词版本</button></div><Feedback message={adminState.feedback} /><div className="admin-detail-grid"><section className="admin-panel"><h2>门店关键词</h2><p>{adminState.storeKeywords.join(" · ")}</p>{permissions.canWrite && <div className="admin-filter-row"><label>新增门店关键词<input value={storeValue} onChange={(event) => setStoreValue(event.target.value)} /></label><button type="button" className="admin-primary-action" onClick={() => add("store", storeValue, setStoreValue)}>添加关键词</button></div>}</section><section className="admin-panel"><h2>禁用词</h2><p>{adminState.forbiddenTerms.join(" · ")}</p>{permissions.canWrite && <div className="admin-filter-row"><label>新增禁用词<input value={forbiddenValue} onChange={(event) => setForbiddenValue(event.target.value)} /></label><button type="button" className="admin-primary-action" onClick={() => add("forbidden", forbiddenValue, setForbiddenValue)}>添加禁用词</button></div>}</section></div></Page>;
}

export function RiskCenterPage({ permissions, adminState }) {
  return <Page eyebrow="RISK CONTROL" title="风险中心" description="五类风险按门店、等级与处置状态集中呈现。" permissions={permissions}><DataTable label="平台风险事件" headers={["风险类型", "门店", "等级", "状态"]} rows={adminState.risks.map((risk) => <tr key={`${risk.kind}-${risk.store}`}><td><strong>{risk.kind}</strong></td><td>{risk.store}</td><td>{risk.level}</td><td>{risk.status}</td></tr>)} /></Page>;
}

export function ContractsPage({ permissions, adminState, onNavigate }) {
  return <Page eyebrow="COMMERCIAL OPS" title="合同套餐与续费" description="跟踪合同周期、负责人、金额与续费状态。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("export-audit")}>查看导出审计</button></div><DataTable label="合同套餐与续费" headers={["门店", "套餐", "开始日期", "结束日期", "续费状态", "负责人", "金额"]} rows={adminState.contracts.map((contract) => <tr key={contract.store}><td><strong>{contract.store}</strong></td><td>{contract.plan}</td><td>{contract.start}</td><td>{contract.end}</td><td>{contract.renewal}</td><td>{contract.owner}</td><td>{contract.amount}</td></tr>)} /></Page>;
}

export function ExportAuditPage({ permissions, adminState, onNavigate }) {
  return <Page eyebrow="DATA GOVERNANCE" title="数据导出与审计" description="展示导出范围、发起人、脱敏结果与完成时间；原型不生成真实文件。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("contracts")}>返回套餐与续费</button></div><DataTable label="数据导出审计" headers={["任务", "数据范围", "发起人", "结果", "时间"]} rows={adminState.exportAudits.map((audit) => <tr key={audit.id}><td><strong>{audit.id}</strong></td><td>{audit.scope}</td><td>{audit.actor}</td><td>{audit.result}</td><td>{audit.time}</td></tr>)} /></Page>;
}

export function PlatformAccountsPage({ permissions, adminState, onNavigate }) {
  return <Page eyebrow="ACCESS CONTROL" title="平台账号" description="超级管理员与跨门店只读运营账号的权限边界。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("system-logs")}>返回系统审计</button></div><DataTable label="平台账号" headers={["姓名", "角色", "数据范围", "状态"]} rows={adminState.platformAccounts.map((account) => <tr key={account.name}><td><strong>{account.name}</strong></td><td>{account.role}</td><td>{account.scope}</td><td>{account.status}</td></tr>)} /></Page>;
}

export function SystemLogsPage({ permissions, adminState, onNavigate }) {
  return <Page eyebrow="AUDIT TRAIL" title="管理日志与系统任务" description="每条记录包含操作人、角色、门店、操作、结果和时间。" permissions={permissions}><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("platform-accounts")}>查看平台账号</button></div><DataTable label="管理日志" headers={["操作人", "角色", "门店", "操作", "结果", "时间"]} rows={adminState.systemLogs.map((log, index) => <tr key={`${log.time}-${index}`}><td><strong>{log.actor}</strong></td><td>{log.role}</td><td>{log.store}</td><td>{log.operation}</td><td>{log.result}</td><td>{log.time}</td></tr>)} /></Page>;
}

export const SYSTEM_PAGE_BY_ROUTE = {
  "benefit-templates": BenefitTemplatesPage, "ai-quota": AiQuotaPage, "ai-failures": AiFailuresPage,
  "prompt-versions": PromptVersionsPage, keywords: KeywordsPage, "risk-center": RiskCenterPage,
  contracts: ContractsPage, "export-audit": ExportAuditPage, "platform-accounts": PlatformAccountsPage,
  "system-logs": SystemLogsPage,
};
