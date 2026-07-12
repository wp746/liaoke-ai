import React, { useState } from "react";
import { Building2, CheckCircle2, QrCode, Store, UsersRound } from "lucide-react";
import { GlassSurface } from "../components/Glass.jsx";
import { StoreTable } from "./OverviewPages.jsx";

const blankStore = { id: null, name: "", city: "深圳·福田", type: "中式正餐", tableIp: "", averageSpend: "", plan: "basic", status: "active", logo: "", brandColor: "#FF5A1F" };
const planLabels = { basic: "基础版", pro: "成长版 Pro", enterprise: "企业版" };
const statusLabels = { active: "营业中", paused: "暂停营业", disabled: "已停用" };

export function StoresPage({ permissions, adminState, onOpenStore, onCreateStore }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredStores = adminState.stores.filter((store) => {
    const matchesQuery = !normalizedQuery || `${store.name} ${store.id} ${store.city}`.toLocaleLowerCase("zh-CN").includes(normalizedQuery);
    return matchesQuery && (status === "all" || store.status === status);
  });

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">STORE NETWORK</span><h1>门店管理</h1><p>查看门店经营、套餐、风险和会员概况。</p></div>{permissions.canWrite && <button className="admin-primary-action" type="button" onClick={onCreateStore}>创建门店</button>}</header>
      {!permissions.canWrite && <p className="admin-readonly-note"><CheckCircle2 size={16} />只读运营视图：可跨门店查看，不可创建、编辑或停用。</p>}
      <section className="admin-panel admin-store-panel">
        <div className="admin-filter-row">
          <label>门店检索<input type="search" placeholder="门店名称 / ID / 城市" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label>经营状态<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option><option value="active">营业中</option><option value="paused">暂停营业</option><option value="disabled">已停用</option></select></label>
        </div>
        <StoreTable stores={filteredStores} onOpenStore={onOpenStore} />
      </section>
    </main>
  );
}

export function StoreDetailPage({ permissions, selectedStore, onOpenStore, onNavigate, adminState }) {
  if (!selectedStore) return <main className="admin-page"><h1>未选择门店</h1><button type="button" className="admin-secondary-action" onClick={() => onNavigate("stores")}>返回门店列表</button></main>;
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">单店360°详情</span><h1>{selectedStore.name}</h1><p>{selectedStore.id} · {selectedStore.city} · {statusLabels[selectedStore.status]}</p></div>{permissions.canWrite && <button type="button" className="admin-primary-action" onClick={() => onOpenStore(selectedStore.id, "store-editor")}>编辑门店</button>}</header>
      {adminState.feedback && <p className="admin-feedback" role="status">{adminState.feedback}</p>}
      <section className="admin-kpi-grid admin-kpi-grid--store" aria-label="单店核心指标">
        {[{ icon: UsersRound, label: "累计会员", value: selectedStore.members }, { icon: QrCode, label: "有效桌码", value: selectedStore.codeCount }, { icon: Building2, label: "本月到店", value: selectedStore.visits }, { icon: Store, label: "权益成本率", value: selectedStore.costRate }].map(({ icon: Icon, label, value }) => <article className="admin-kpi" key={label}><div><Icon size={17} /><span>{label}</span></div><strong>{value}</strong><small>同比保持稳定</small></article>)}
      </section>
      <div className="admin-detail-grid"><section className="admin-panel"><span className="admin-eyebrow">BUSINESS HEALTH</span><h2>经营健康度</h2><dl className="admin-detail-list"><div><dt>当前套餐</dt><dd>{planLabels[selectedStore.plan]}</dd></div><div><dt>AI 配额</dt><dd>72% 已使用</dd></div><div><dt>最近活跃</dt><dd>2026-07-11 14:38</dd></div><div><dt>客单价</dt><dd>¥{selectedStore.averageSpend}</dd></div></dl></section><GlassSurface as="aside" level="lens" className="admin-panel admin-context-drawer"><span className="admin-eyebrow">RISK SIGNAL</span><h2>需要关注</h2><p>{selectedStore.risk === "无" ? "当前未发现需要人工处理的门店风险。" : `当前共有 ${selectedStore.risk}待复核风险信号。`}</p><button type="button" className="admin-secondary-action" onClick={() => onNavigate("table-codes")}>查看桌码</button></GlassSurface></div>
    </main>
  );
}

export function StoreEditorPage({ permissions, selectedStore, dispatchAdmin, onNavigate }) {
  const [draft, setDraft] = useState(() => ({ ...(selectedStore ?? blankStore) }));
  const writable = permissions.canWrite;
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!writable || !draft.name.trim() || !draft.tableIp.trim()) return;
    dispatchAdmin({ type: "SAVE_STORE", store: draft });
    onNavigate("store-detail");
  };
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">STORE PROFILE</span><h1>{writable ? selectedStore ? "编辑门店" : "创建门店" : "门店资料"}</h1><p>统一维护身份、经营模型、套餐与品牌资产。</p></div></header>
      {!writable && <p className="admin-readonly-note"><CheckCircle2 size={16} />当前为只读运营视图，所有字段均不可编辑。</p>}
      <form className="admin-panel admin-editor" onSubmit={submit}>
        <fieldset disabled={!writable}><legend>门店身份与经营配置</legend><div className="admin-form-grid">
          <label>门店名称<input required value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label>门店类型<select value={draft.type} onChange={(event) => update("type", event.target.value)}><option>潮汕牛肉火锅</option><option>中式正餐</option><option>休闲餐饮</option></select></label>
          <label>桌牌 IP<input required value={draft.tableIp} onChange={(event) => update("tableIp", event.target.value)} /></label>
          <label>人均消费<input type="number" min="0" value={draft.averageSpend} onChange={(event) => update("averageSpend", event.target.value)} /></label>
          <label>SaaS 套餐<select value={draft.plan} onChange={(event) => update("plan", event.target.value)}><option value="basic">基础版</option><option value="pro">成长版 Pro</option><option value="enterprise">企业版</option></select></label>
          <label>门店状态<select value={draft.status} onChange={(event) => update("status", event.target.value)}><option value="active">营业中</option><option value="paused">暂停营业</option><option value="disabled">已停用</option></select></label>
          <label>品牌 Logo<input value={draft.logo} onChange={(event) => update("logo", event.target.value)} /></label>
          <label>品牌主色<input type="text" value={draft.brandColor} onChange={(event) => update("brandColor", event.target.value)} /></label>
        </div></fieldset>
        <div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("stores")}>返回门店列表</button>{writable && <button type="submit" className="admin-primary-action">保存门店</button>}</div>
      </form>
    </main>
  );
}

export function TableCodesPage({ permissions, adminState, selectedStore, dispatchAdmin }) {
  const writable = permissions.canWrite;
  const codes = adminState.codes.filter((code) => code.storeId === (selectedStore?.id ?? "STORE001"));
  const tableAriaLabel = selectedStore?.id === "STORE001" ? "牛里牛气桌码列表" : `${selectedStore?.name ?? "当前门店"}桌码列表`;
  const [batchCount, setBatchCount] = useState("10");
  const [selected, setSelected] = useState([]);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const [feedback, setFeedback] = useState("");
  const generate = () => {
    if (!writable) return;
    const count = Math.max(1, Math.min(50, Number(batchCount) || 1));
    dispatchAdmin({ type: "GENERATE_CODES", count, storeId: selectedStore?.id ?? "STORE001" });
    setFeedback(`已生成 ${count} 个桌码并加入当前门店列表。`);
  };
  const download = () => {
    if (!writable) return;
    const records = codes.filter((code) => selected.includes(code.id));
    setFeedback(`已选择 ${records.map((code) => `${code.table}（${code.id}）`).join("、")}；原型未生成真实下载文件。`);
  };
  const confirmDeactivate = () => {
    if (!writable || !pendingDeactivate) return;
    dispatchAdmin({ type: "DEACTIVATE_CODE", codeId: pendingDeactivate.id });
    setFeedback(`桌码 ${pendingDeactivate.table} 已在本次原型会话中停用。`);
    setPendingDeactivate(null);
  };

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">TABLE CODE CENTER</span><h1>桌码中心</h1><p>{selectedStore?.name ?? "牛里牛气潮汕牛肉火锅"} · 批量生成、选择下载与停用桌码。</p></div></header>
      {!writable && <p className="admin-readonly-note"><CheckCircle2 size={16} />只读运营视图：可查看桌码状态与扫码量，不可生成、下载或停用。</p>}
      {writable && <section className="admin-panel admin-code-toolbar"><label>批量生成数量<input type="number" min="1" max="50" value={batchCount} onChange={(event) => setBatchCount(event.target.value)} /></label><button type="button" className="admin-primary-action" onClick={generate}>批量生成桌码</button><button type="button" className="admin-secondary-action" disabled={!selected.length} onClick={download}>下载已选桌码</button></section>}
      {feedback && <p role="status" className="admin-feedback">{feedback}</p>}
      <section className="admin-panel admin-code-list"><GlassSurface as="table" level="solid" className="admin-code-table" aria-label={tableAriaLabel}><thead><tr>{writable && <th>选择</th>}<th>桌号</th><th>桌码 ID</th><th>累计扫码</th><th>状态</th>{writable && <th>操作</th>}</tr></thead><tbody>{codes.map((code) => <tr key={code.id}>{writable && <td><input type="checkbox" aria-label={`选择 ${code.table}`} checked={selected.includes(code.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, code.id] : current.filter((item) => item !== code.id))} /></td>}<td><strong>{code.table}</strong></td><td>{code.id}</td><td>{code.scans}</td><td><span className={`admin-state ${code.status === "active" ? "is-live" : ""}`}>{code.status === "active" ? "启用中" : "已停用"}</span></td>{writable && <td>{code.status === "active" && <button type="button" className="admin-danger-action" onClick={() => setPendingDeactivate(code)}>停用 {code.table}</button>}</td>}</tr>)}</tbody></GlassSurface></section>
      {pendingDeactivate && <div className="admin-dialog-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="deactivate-title" className="admin-dialog"><span className="admin-eyebrow">AUDITED ACTION</span><h2 id="deactivate-title">确认停用桌码</h2><p>停用 {pendingDeactivate.table} 后，顾客将无法继续通过该桌码进入门店。</p><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => setPendingDeactivate(null)}>取消</button><button type="button" className="admin-danger-confirm" onClick={confirmDeactivate}>确认停用</button></div></section></div>}
    </main>
  );
}
