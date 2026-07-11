import React, { useState } from "react";
import { Building2, CheckCircle2, QrCode, Store, UsersRound } from "lucide-react";
import { StoreTable } from "./OverviewPages.jsx";

const storeProfile = {
  name: "牛里牛气潮汕牛肉火锅",
  type: "潮汕牛肉火锅",
  tableIp: "燎小星·吃肉星球",
  averageSpend: "126",
  plan: "pro",
  status: "active",
  logo: "liaoke-nxnq-logo.svg",
  brandColor: "#FF5A1F",
};

export function StoresPage({ permissions, onNavigate }) {
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">STORE NETWORK</span><h1>门店管理</h1><p>查看门店经营、套餐、风险和会员概况。</p></div>{permissions.canWrite && <button className="admin-primary-action" type="button" onClick={() => onNavigate("store-editor")}>创建门店</button>}</header>
      {!permissions.canWrite && <p className="admin-readonly-note"><CheckCircle2 size={16} />只读运营视图：可跨门店查看，不可创建、编辑或停用。</p>}
      <section className="admin-panel admin-store-panel"><div className="admin-filter-row"><label>门店检索<input type="search" placeholder="门店名称 / ID / 城市" /></label><label>经营状态<select defaultValue="all"><option value="all">全部状态</option><option value="active">营业中</option><option value="paused">暂停营业</option></select></label></div><StoreTable onNavigate={onNavigate} /></section>
    </main>
  );
}

export function StoreDetailPage({ permissions, onNavigate }) {
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">单店360°详情</span><h1>牛里牛气潮汕牛肉火锅</h1><p>STORE001 · 广州天河 · 营业中</p></div>{permissions.canWrite && <button type="button" className="admin-primary-action" onClick={() => onNavigate("store-editor")}>编辑门店</button>}</header>
      <section className="admin-kpi-grid admin-kpi-grid--store" aria-label="单店核心指标">
        {[{ icon: UsersRound, label: "累计会员", value: "12,680" }, { icon: QrCode, label: "有效桌码", value: "48" }, { icon: Building2, label: "本月到店", value: "8,924" }, { icon: Store, label: "权益成本率", value: "8.6%" }].map(({ icon: Icon, label, value }) => <article className="admin-kpi" key={label}><div><Icon size={17} /><span>{label}</span></div><strong>{value}</strong><small>同比保持稳定</small></article>)}
      </section>
      <div className="admin-detail-grid"><section className="admin-panel"><span className="admin-eyebrow">BUSINESS HEALTH</span><h2>经营健康度</h2><dl className="admin-detail-list"><div><dt>当前套餐</dt><dd>成长版 Pro</dd></div><div><dt>AI 配额</dt><dd>72% 已使用</dd></div><div><dt>最近活跃</dt><dd>2026-07-11 14:38</dd></div><div><dt>客单价</dt><dd>¥126</dd></div></dl></section><aside className="admin-panel admin-context-drawer"><span className="admin-eyebrow">RISK SIGNAL</span><h2>需要关注</h2><p>近 2 小时核销量高于基线，建议复核 A12–A18 桌码的连续核销。</p><button type="button" className="admin-secondary-action" onClick={() => onNavigate("table-codes")}>查看桌码</button></aside></div>
    </main>
  );
}

export function StoreEditorPage({ permissions, onNavigate }) {
  const [feedback, setFeedback] = useState("");
  const writable = permissions.canWrite;
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">STORE PROFILE</span><h1>{writable ? "编辑门店" : "门店资料"}</h1><p>统一维护身份、经营模型、套餐与品牌资产。</p></div></header>
      {!writable && <p className="admin-readonly-note"><CheckCircle2 size={16} />当前为只读运营视图，所有字段均不可编辑。</p>}
      <form className="admin-panel admin-editor" onSubmit={(event) => { event.preventDefault(); if (!writable) return; setFeedback("原型已保存：门店资料已更新，生产环境将写入审计日志。"); }}>
        <fieldset disabled={!writable}><legend>门店身份与经营配置</legend><div className="admin-form-grid">
          <label>门店名称<input defaultValue={storeProfile.name} /></label>
          <label>门店类型<select defaultValue={storeProfile.type}><option>潮汕牛肉火锅</option><option>中式正餐</option><option>休闲餐饮</option></select></label>
          <label>桌牌 IP<input defaultValue={storeProfile.tableIp} /></label>
          <label>人均消费<input type="number" min="0" defaultValue={storeProfile.averageSpend} /></label>
          <label>SaaS 套餐<select defaultValue={storeProfile.plan}><option value="basic">基础版</option><option value="pro">成长版 Pro</option><option value="enterprise">企业版</option></select></label>
          <label>门店状态<select defaultValue={storeProfile.status}><option value="active">营业中</option><option value="paused">暂停营业</option><option value="disabled">已停用</option></select></label>
          <label>品牌 Logo<input defaultValue={storeProfile.logo} /></label>
          <label>品牌主色<input type="text" defaultValue={storeProfile.brandColor} /></label>
        </div></fieldset>
        {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
        <div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => onNavigate("stores")}>返回门店列表</button>{writable && <button type="submit" className="admin-primary-action">保存门店</button>}</div>
      </form>
    </main>
  );
}

const initialCodes = [
  { table: "A12", code: "NXNQ-A12-0711", status: "active", scans: 286 },
  { table: "A13", code: "NXNQ-A13-0711", status: "active", scans: 194 },
  { table: "A14", code: "NXNQ-A14-0711", status: "active", scans: 173 },
];

export function TableCodesPage({ permissions }) {
  const writable = permissions.canWrite;
  const [codes, setCodes] = useState(initialCodes);
  const [batchCount, setBatchCount] = useState("10");
  const [selected, setSelected] = useState([]);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const [feedback, setFeedback] = useState("");
  const generate = () => {
    if (!writable) return;
    const count = Math.max(1, Math.min(50, Number(batchCount) || 1));
    setFeedback(`原型演示：已在当前页生成 ${count} 个临时桌码；未提交后端任务。`);
  };
  const download = () => {
    if (!writable) return;
    setFeedback(`原型演示：已准备 ${selected.length} 个桌码的下载清单，未生成真实文件。`);
  };
  const confirmDeactivate = () => {
    if (!writable || !pendingDeactivate) return;
    setCodes((current) => current.map((code) => code.table === pendingDeactivate ? { ...code, status: "disabled" } : code));
    setFeedback(`桌码 ${pendingDeactivate} 已在本次原型会话中停用。`);
    setPendingDeactivate(null);
  };

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">TABLE CODE CENTER</span><h1>桌码中心</h1><p>批量生成、选择下载与停用门店桌码。</p></div></header>
      {!writable && <p className="admin-readonly-note"><CheckCircle2 size={16} />只读运营视图：可查看桌码状态与扫码量，不可生成、下载或停用。</p>}
      {writable && <section className="admin-panel admin-code-toolbar"><label>批量生成数量<input type="number" min="1" max="50" value={batchCount} onChange={(event) => setBatchCount(event.target.value)} /></label><button type="button" className="admin-primary-action" onClick={generate}>批量生成桌码</button><button type="button" className="admin-secondary-action" disabled={!selected.length} onClick={download}>下载已选桌码</button></section>}
      {feedback && <p role="status" className="admin-feedback">{feedback}</p>}
      <section className="admin-panel admin-code-list"><table aria-label="牛里牛气桌码列表"><thead><tr>{writable && <th>选择</th>}<th>桌号</th><th>桌码 ID</th><th>累计扫码</th><th>状态</th>{writable && <th>操作</th>}</tr></thead><tbody>{codes.map((code) => <tr key={code.table}>{writable && <td><input type="checkbox" aria-label={`选择 ${code.table}`} checked={selected.includes(code.table)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, code.table] : current.filter((item) => item !== code.table))} /></td>}<td><strong>{code.table}</strong></td><td>{code.code}</td><td>{code.scans}</td><td><span className={`admin-state ${code.status === "active" ? "is-live" : ""}`}>{code.status === "active" ? "启用中" : "已停用"}</span></td>{writable && <td>{code.status === "active" && <button type="button" className="admin-danger-action" onClick={() => setPendingDeactivate(code.table)}>停用 {code.table}</button>}</td>}</tr>)}</tbody></table></section>
      {pendingDeactivate && <div className="admin-dialog-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="deactivate-title" className="admin-dialog"><span className="admin-eyebrow">AUDITED ACTION</span><h2 id="deactivate-title">确认停用桌码</h2><p>停用 {pendingDeactivate} 后，顾客将无法继续通过该桌码进入门店。</p><div className="admin-form-actions"><button type="button" className="admin-secondary-action" onClick={() => setPendingDeactivate(null)}>取消</button><button type="button" className="admin-danger-confirm" onClick={confirmDeactivate}>确认停用</button></div></section></div>}
    </main>
  );
}
