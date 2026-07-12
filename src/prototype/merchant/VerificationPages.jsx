import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Gift, History, Keyboard, ScanLine, Ticket, WalletCards } from "lucide-react";
import { GlassSurface, RewardGlyph } from "../components/Glass.jsx";
import { PrimaryButton, StatusPill } from "../components/Ui.jsx";

export const verificationTypes = {
  coupon: { label: "扫码核销", icon: ScanLine, title: "到店优惠券", code: "CP-20260711-0088", value: "满 100 减 20", cash: "¥ 128.00" },
  manual: { label: "手动核销", icon: Keyboard, title: "手动券码", code: "CP-20260711-0066", value: "满 80 减 10", cash: "¥ 92.00" },
  balance: { label: "余额核销", icon: WalletCards, title: "会员余额抵扣", code: "BL-20260711-0032", value: "抵扣 ¥ 30", cash: "¥ 168.00" },
  referral_coupon: { label: "老带新抵扣券核销", icon: Ticket, title: "老带新抵扣券", code: "RC-20260711-0019", value: "满 100 减 10", cash: "¥ 136.00" },
  points_redemption: { label: "积分兑换核销", icon: Gift, title: "酸梅汤一杯", code: "AB7X3K2Q", value: "500 积分" },
};

export const verificationGlyphKinds = {
  coupon: "store",
  manual: "store",
  balance: "balance",
  referral_coupon: "referral",
  points_redemption: "points",
};

const outcomeCopy = {
  success: { status: "success", title: "核销成功", body: "本次权益已核销，记录已同步到门店后台。" },
  duplicate: { status: "danger", title: "该兑换码已使用", body: "系统已返回原核销结果，没有重复扣减。" },
  "wrong-store": { status: "danger", title: "非本门店权益", body: "该核销码属于其他门店，请顾客到对应门店使用。" },
  pending: { status: "plain", title: "权益暂未生效", body: "权益仍在待生效期，请稍后再试。" },
  "minimum-spend": { status: "danger", title: "未满足最低消费", body: "当前订单金额未达到权益使用门槛。" },
  "timeout-query": { status: "plain", title: "正在查询核销结果", body: "请求超过 5 秒，系统正在按订单号查询最终状态。" },
};

const verifierNames = { owner: "王老板", manager: "陈店长", staff: "李店员" };

function VerificationHub({ onChoose, onNavigate }) {
  return (
    <main className="merchant-page merchant-verify">
      <div className="merchant-page-heading"><StatusPill status="success">核销服务正常</StatusPill><h1>核销工作台</h1><p>选择权益类型后扫码，也可以手动输入核销码。</p></div>
      <GlassSurface as="div" level="acrylic" className="merchant-verify-grid">
        {Object.entries(verificationTypes).map(([id, item]) => <button type="button" key={id} className="glass-surface is-interactive" onClick={() => onChoose(id)}><RewardGlyph kind={verificationGlyphKinds[id]} /><strong>{item.label}</strong><span>扫码或输入券码</span></button>)}
      </GlassSurface>
      <button type="button" className="merchant-secondary-action" onClick={() => onNavigate("verify-history")}><History size={14} /> 查看核销记录</button>
    </main>
  );
}

function CodeEntry({ type, manual, code, setCode, onNavigate }) {
  const item = verificationTypes[type];
  return (
    <main className="merchant-page merchant-verify merchant-code-entry">
      <div className="merchant-page-heading"><StatusPill status="plain">{item.label}</StatusPill><h1>{manual ? "输入核销码" : "扫描顾客权益码"}</h1><p>{manual ? "支持英文和数字，提交前请与顾客确认。" : "将顾客二维码放入取景框，或改用手动输入。"}</p></div>
      {manual ? (
        <GlassSurface level="solid" className="ui-card ui-card--plain merchant-form-surface"><label htmlFor="verification-code">核销码</label><input id="verification-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="请输入核销码" /><PrimaryButton disabled={!code.trim()} onClick={() => onNavigate("verify-confirm")}>查询权益</PrimaryButton></GlassSurface>
      ) : (
        <div className="merchant-scan-stage"><ScanLine size={52} /><span>等待扫描</span><PrimaryButton onClick={() => onNavigate("verify-confirm")}>模拟扫描</PrimaryButton></div>
      )}
      <button type="button" className="merchant-secondary-action" onClick={() => onNavigate(manual ? "verify-scan" : "verify-manual")}>{manual ? "改用扫码" : "手动输入"}</button>
    </main>
  );
}

function ConfirmVerification({ type, code, outcome, setOutcome, processing, onConfirm }) {
  const item = verificationTypes[type];
  const points = type === "points_redemption";
  return (
    <main className="merchant-page merchant-verify merchant-confirm">
      <div className="merchant-page-heading"><StatusPill status="success">权益有效</StatusPill><h1>确认核销信息</h1><p>请与顾客核对权益内容后再确认。</p></div>
      <GlassSurface level="solid" className="ui-card ui-card--warm merchant-confirm-surface"><span className="merchant-eyebrow">{item.label}</span><h2>{item.title}</h2><strong className="merchant-verify-value">{item.value}</strong><small>核销码 {code}</small>{!points && <div className="merchant-cash-row"><span>应收金额</span><strong>{item.cash}</strong></div>}</GlassSurface>
      <label className="merchant-demo-select">演示结果<select value={outcome} onChange={(event) => setOutcome(event.target.value)}>{Object.keys(outcomeCopy).map((id) => <option value={id} key={id}>{outcomeCopy[id].title}</option>)}</select></label>
      <PrimaryButton disabled={processing} onClick={onConfirm}>{processing ? "核销处理中…" : points ? "确认已交付赠品" : "确认核销"}</PrimaryButton>
      {processing && <p role="status" className="merchant-processing"><Clock3 size={16} /> 正在校验并写入核销记录</p>}
    </main>
  );
}

function VerificationResult({ outcome, role, record, onNavigate }) {
  const result = outcomeCopy[outcome] ?? outcomeCopy.success;
  const success = outcome === "success";
  return (
    <main className="merchant-page merchant-verify merchant-result">
      <CheckCircle2 size={58} aria-hidden="true" />
      <StatusPill status={result.status}>{success ? "已完成" : "核销提示"}</StatusPill>
      <h1>{result.title}</h1><p>{result.body}</p>
      {success && <GlassSurface level="solid" className="ui-card ui-card--plain merchant-confirm-surface"><span>核销员工</span><strong>{record?.verifierName ?? verifierNames[role]}</strong><span>核销时间</span><strong>{record?.timestamp ?? "2026-07-11 14:32:08"}</strong></GlassSurface>}
      {outcome === "timeout-query" && <GlassSurface level="solid" className="ui-card ui-card--warm merchant-confirm-surface"><strong>查询状态：未核销</strong><span>查询单号 VER-20260711-143208</span><span>若查询仍未完成，可安全重试；服务端会保持幂等。</span></GlassSurface>}
      <PrimaryButton onClick={() => onNavigate(outcome === "timeout-query" ? "verify-confirm" : "verify-hub")}>{outcome === "timeout-query" ? "重新核销" : "继续核销"}</PrimaryButton>
    </main>
  );
}

function VerificationHistory({ role, records }) {
  const visibleRecords = records.filter((record) => role === "owner" || record.verifierRole === role);
  return <main className="merchant-page merchant-verify"><div className="merchant-page-heading"><StatusPill status="plain">仅展示权限范围内记录</StatusPill><h1>核销记录</h1><p>{role === "owner" ? "全店最近核销" : "当前账号最近核销"}</p></div><GlassSurface as="div" level="solid" className="merchant-verification-list">{visibleRecords.map((record, index) => { const Icon = verificationTypes[record.type]?.icon ?? Ticket; return <article key={`${record.code}-${record.timestamp}-${index}`}><div className="merchant-verification-icon"><Icon size={15} /></div><div><strong>{record.item} · {record.value}</strong><span>{record.code}</span><span>{record.verifierName} · {record.timestamp}</span></div><b>{record.status === "success" ? "成功" : record.status}</b></article>; })}</GlassSurface></main>;
}

export function VerificationPages({ routeId, role, state, dispatch, onNavigate }) {
  const queryOutcome = new URLSearchParams(window.location.search).get("outcome");
  const [type, setType] = useState(state.verification.type ?? "coupon");
  const [code, setCode] = useState(state.verification.code ?? verificationTypes.coupon.code);
  const [outcome, setOutcome] = useState(outcomeCopy[queryOutcome] ? queryOutcome : "success");
  const [processing, setProcessing] = useState(false);

  useEffect(() => () => window.clearTimeout(window.__liaokeVerificationTimer), []);
  const choose = (nextType) => { setType(nextType); setCode(verificationTypes[nextType].code); onNavigate(nextType === "manual" ? "verify-manual" : "verify-scan"); };
  const confirm = () => {
    setProcessing(true);
    window.__liaokeVerificationTimer = window.setTimeout(() => {
      const duplicate = outcome === "success" && (state.verification.records ?? []).some((record) => record.code === code && record.status === "success");
      const result = duplicate ? "duplicate" : outcome;
      setOutcome(result);
      dispatch({ type: "VERIFY_CODE", code, result, verificationType: type, item: verificationTypes[type].title, value: verificationTypes[type].value, verifierRole: role, verifierName: verifierNames[role], timestamp: "2026-07-11 14:32:08" });
      setProcessing(false);
      onNavigate("verify-result");
    }, 180);
  };

  if (routeId === "verify-hub") return <VerificationHub onChoose={choose} onNavigate={onNavigate} />;
  if (routeId === "verify-scan") return <CodeEntry type={type} code={code} setCode={setCode} onNavigate={onNavigate} />;
  if (routeId === "verify-manual") return <CodeEntry type={type} manual code={code} setCode={setCode} onNavigate={onNavigate} />;
  if (routeId === "verify-confirm") return <ConfirmVerification type={type} code={code} outcome={outcome} setOutcome={setOutcome} processing={processing} onConfirm={confirm} />;
  if (routeId === "verify-result") return <VerificationResult outcome={outcome} role={role} record={(state.verification.records ?? []).find((record) => record.code === state.verification.code && record.verifierRole === role)} onNavigate={onNavigate} />;
  return <VerificationHistory role={role} records={state.verification.records ?? []} />;
}
