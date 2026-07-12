import React, { useState } from "react";
import { Check, Copy, ImagePlus, QrCode, RefreshCw, Save } from "lucide-react";
import { GlassSurface, LiaoxiaoxingMoment, RewardGlyph } from "../components/Glass.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";
import { GalaceanStage } from "../motion/GalaceanStage.jsx";

export const AI_STYLES = ["烟火食刻", "质感大片", "漫画趣味", "简约清新"];
export const AI_PROGRESS_VARIANTS = ["copy", "image", "fallback", "rejected"];

export const COPY_CANDIDATES = [
  "吊龙刚涮到最嫩的那一秒，朋友正好都在。今晚的快乐，有热气也有笑声。",
  "认真吃肉，认真碰杯。牛里牛气这一桌，把普通聚餐过成了值得收藏的晚上。",
  "锅里是鲜切吊龙，桌边是好久不见。舒服的一顿饭，就是最松弛的见面方式。",
];

const aiStyles = `
  .customer-ai { display:grid; gap:14px; align-content:start; }
  .customer-ai__intro { display:grid; min-height:170px; grid-template-columns:1fr 150px; align-items:center; overflow:hidden; padding:18px 0 18px 18px; }
  .customer-ai__intro > div { grid-column:1; grid-row:1; }
  .customer-ai__intro .brand-mascot { grid-column:2; grid-row:1; width:170px; height:170px; transform:translateX(-8px); }
  .customer-ai__intro p { margin:0 0 14px; }
  .customer-ai__field { display:grid; gap:7px; font-size:11px; font-weight:800; }
  .customer-ai__field input[type=file] { width:100%; padding:13px; border:1px dashed rgba(0,194,255,.48); border-radius:16px; background:rgba(0,194,255,.05); color:var(--ink-600); font-size:10px; }
  .customer-ai__field textarea { min-height:78px; resize:none; padding:13px; border:1px solid var(--line); border-radius:16px; background:#fff; color:var(--ink-900); font:inherit; font-weight:600; line-height:1.6; outline:none; }
  .customer-ai__field textarea:focus { border-color:rgba(0,194,255,.62); box-shadow:0 0 0 3px rgba(0,194,255,.09); }
  .customer-ai__counter { justify-self:end; color:var(--ink-600); font-size:9px; font-weight:600; }
  .customer-ai__styles { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .customer-ai__styles button { min-height:40px; border:1px solid var(--line); border-radius:14px; background:#fff; color:var(--ink-600); font-size:10px; font-weight:800; }
  .customer-ai__styles button[aria-pressed=true] { border-color:rgba(0,194,255,.55); background:rgba(0,194,255,.08); color:#007ba4; }
  .customer-ai__progress { display:grid; min-height:100%; place-items:center; align-content:center; text-align:center; }
  .customer-ai__progress .liaoxiaoxing-moment .brand-mascot { width:154px; height:175px; transform:none; }
  .customer-ai__progress-card { width:100%; padding:20px; border:1px solid rgba(0,194,255,.22); border-radius:22px; background:linear-gradient(145deg,rgba(0,194,255,.08),#fff); }
  .customer-ai__progress-card h1 { font-size:22px; }
  .customer-ai__progress-card .ui-primary { margin-top:10px; }
  .customer-ai__dots { display:flex; justify-content:center; gap:6px; margin:12px 0; }
  .customer-ai__dots i { width:7px; height:7px; border-radius:50%; background:var(--ai-cyan); opacity:.32; }
  .customer-ai__dots i:nth-child(2) { opacity:.65; }.customer-ai__dots i:nth-child(3) { opacity:1; }
  .customer-ai__candidate-list { display:grid; gap:10px; }
  .customer-ai__candidate { display:grid; gap:11px; padding:15px; border:1px solid var(--line); border-radius:18px; background:#fff; }
  .customer-ai__candidate p { margin:0; color:var(--ink-900); font-size:11px; }
  .customer-ai__candidate button { justify-self:end; padding:7px 13px; border-radius:999px; background:rgba(0,194,255,.1); color:#007ba4; font-size:10px; font-weight:850; }
  .customer-ai__poster { position:relative; overflow:hidden; padding:18px; border-radius:24px; background:linear-gradient(160deg,#201712,#5c2714 54%,#f18731); color:#fff; box-shadow:0 20px 44px rgba(57,31,18,.2); }
  .customer-ai__poster::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 80% 16%,rgba(255,207,102,.4),transparent 24%); }
  .customer-ai__poster > * { position:relative; }
  .customer-ai__store { display:flex; align-items:center; gap:8px; font-size:10px; font-weight:850; }
  .customer-ai__store img { width:28px; height:28px; padding:5px; border-radius:9px; background:#fff; }
  .customer-ai__poster-copy { max-width:210px; margin:24px 0 15px; color:#fff !important; font-size:17px !important; font-weight:850; line-height:1.45 !important; }
  .customer-ai__poster-bottom { display:grid; grid-template-columns:1fr 86px; align-items:end; gap:8px; }
  .customer-ai__poster .brand-mascot { width:116px; height:126px; transform:none; }
  .customer-ai__poster-moment { display:contents; }
  .customer-ai__qr { display:grid; place-items:center; padding:8px 4px; border-radius:14px; background:#fff; color:var(--ink-900); }
  .customer-ai__qr span { margin-top:3px; font-size:8px; font-weight:850; }
  .customer-ai__actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .customer-ai__actions button { display:flex; min-height:40px; align-items:center; justify-content:center; gap:6px; border:1px solid var(--line); border-radius:999px; background:#fff; color:var(--ink-900); font-size:10px; font-weight:850; }
  .customer-ai__actions button:first-child { grid-column:1 / -1; border:0; background:var(--brand-gradient); color:#fff; }
`;

function AiStyleTag({ children }) {
  return <><style>{aiStyles}</style>{children}</>;
}

export function AiCreate({ dispatch, onNavigate, draft, onDraftChange }) {
  const [photoCount, setPhotoCount] = useState(0);
  const [photoError, setPhotoError] = useState("");
  const [outcome] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("variant");
    return ["fallback", "rejected"].includes(requested) ? requested : "done";
  });
  const updatePhotos = (event) => {
    const count = event.target.files?.length ?? 0;
    setPhotoCount(count > 3 ? 0 : count);
    setPhotoError(count > 3 ? "最多上传 3 张照片" : "");
  };
  const canStart = photoCount >= 1 && photoCount <= 3 && !photoError;
  const start = () => {
    if (!canStart) return;
    dispatch({ type: "START_AI", outcome });
    onNavigate("ai-progress");
  };

  return (
    <AiStyleTag>
      <main className="customer-page customer-ai">
        <SurfaceCard tone="ai">
          <LiaoxiaoxingMoment kind="ai" className="customer-ai__intro">
            <div><StatusPill status="ai">AI 灵感已就位</StatusPill><h1>把这一桌，拍成会发光的记忆</h1><p>上传 1–3 张照片，再留下一句真实感受。</p></div>
          </LiaoxiaoxingMoment>
        </SurfaceCard>
        <GlassSurface level="acrylic" className="customer-ai-composer">
          <RewardGlyph kind="ai" state="active" />
          <label className="customer-ai__field">
            <span><ImagePlus size={14} /> 上传用餐照片</span>
            <input aria-label="上传用餐照片" type="file" accept="image/*" multiple onChange={updatePhotos} />
            <small className="customer-ai__counter">{photoCount > 0 ? `已选 ${photoCount}/3 张` : "支持 1–3 张"}</small>
            {photoError && <StatusPill status="danger">{photoError}</StatusPill>}
          </label>
          <label className="customer-ai__field">
            <span>今天的真实感受</span>
            <textarea aria-label="今天的真实感受" maxLength={50} value={draft.feeling} placeholder="例如：吊龙很嫩，朋友聚餐很舒服" onChange={(event) => onDraftChange({ ...draft, feeling: event.target.value })} />
            <small className="customer-ai__counter">{draft.feeling.length}/50</small>
          </label>
          <section className="customer-ai__field" aria-label="海报风格">
            <span>选择一种风格</span>
            <div className="customer-ai__styles">
              {AI_STYLES.map((style) => <button type="button" key={style} aria-pressed={draft.style === style} onClick={() => onDraftChange({ ...draft, style })}>{style}</button>)}
            </div>
          </section>
          <PrimaryButton onClick={start} disabled={!canStart}>生成我的海报</PrimaryButton>
        </GlassSurface>
      </main>
    </AiStyleTag>
  );
}

const progressViews = {
  copy: { title: "燎小星正在点亮这张照片", body: "正在理解你的真实感受", action: "继续生成图片" },
  image: { title: "画面正在冒出香气", body: "正在为照片调出烟火质感", action: "查看生成结果" },
  fallback: { title: "图片保留了原始质感", body: "先给你精选版", detail: "已为你生成文案版海报。", action: "查看生成结果" },
  rejected: { title: "这张照片暂时不能使用", body: "照片不符合要求，请更换", detail: "换一张清晰的用餐照片再试试。", action: "返回更换照片" },
};

export function AiProgress({ state, dispatch, onNavigate, variant: directVariant, onVariantChange }) {
  const activeVariant = progressViews[directVariant] ? directVariant : progressViews[state.ai.stage] ? state.ai.stage : "copy";
  const view = progressViews[activeVariant];
  const proceed = () => {
    if (activeVariant === "rejected") return onNavigate("ai-create");
    if (activeVariant === "copy") {
      dispatch({ type: "ADVANCE_AI" });
      if (directVariant) onVariantChange("image");
      return;
    }
    if (activeVariant === "image") {
      dispatch({ type: "COMPLETE_AI" });
      if (state.ai.outcome !== "fallback") onNavigate("ai-select");
      return;
    }
    onNavigate("ai-select");
  };
  return (
    <AiStyleTag>
      <main className="customer-page customer-ai__progress motion-host">
        {activeVariant !== "rejected" && <GalaceanStage kind="ai" />}
        <LiaoxiaoxingMoment kind={activeVariant === "rejected" ? "empty" : "ai"} className="customer-ai__progress-moment" />
        <section className="customer-ai__progress-card" aria-live="polite">
          <StatusPill status={activeVariant === "rejected" ? "danger" : "ai"}>{activeVariant === "rejected" ? "内容安全提示" : "AI 创作中"}</StatusPill>
          <h1>{view.title}</h1><p>{view.body}</p>{view.detail && <p>{view.detail}</p>}
          {activeVariant !== "rejected" && <div className="customer-ai__dots" aria-hidden="true"><i /><i /><i /></div>}
          <PrimaryButton onClick={proceed}>{view.action}</PrimaryButton>
        </section>
      </main>
    </AiStyleTag>
  );
}

export function AiSelect({ draft, onSelect, onNavigate }) {
  return (
    <AiStyleTag>
      <main className="customer-page customer-ai">
        <header className="customer-page__header"><span>AI 文案候选</span><h1>选一句最像你的</h1><p>已使用「{draft.style}」效果，你还可以重新创作。</p></header>
        <section className="customer-ai__candidate-list" aria-label="文案候选">
          {COPY_CANDIDATES.map((copy, index) => <article className="customer-ai__candidate" key={copy}><StatusPill status="ai">候选 {index + 1}</StatusPill><p>{copy}</p><button type="button" onClick={() => { onSelect(copy); onNavigate("poster-preview"); }}><Check size={13} />选这版</button></article>)}
        </section>
      </main>
    </AiStyleTag>
  );
}

export function PosterPreview({ state, selectedCopy, onNavigate }) {
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState("success");
  const copyText = selectedCopy || COPY_CANDIDATES[0];
  const save = () => {
    const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character]);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#201712"/><stop offset=".54" stop-color="#5c2714"/><stop offset="1" stop-color="#f18731"/></linearGradient></defs><rect width="1080" height="1440" rx="72" fill="url(#bg)"/><text x="80" y="120" fill="#fff" font-family="sans-serif" font-size="38" font-weight="700">${escapeXml(state.store.name)}</text><foreignObject x="80" y="260" width="920" height="600"><div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font:700 64px/1.5 sans-serif">${escapeXml(copyText)}</div></foreignObject><rect x="760" y="1080" width="240" height="240" rx="32" fill="#fff"/><text x="880" y="1210" text-anchor="middle" fill="#201712" font-family="sans-serif" font-size="28">专属推荐码</text><text x="80" y="1320" fill="#fff" font-family="sans-serif" font-size="34">燎客 AI · 自愿分享</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `liaoke-poster-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setNoticeKind("success");
    setNotice("海报文件已开始下载");
  };
  const copy = async () => {
    if (!navigator.clipboard?.writeText) {
      setNoticeKind("error");
      setNotice("复制失败，请手动选择文案复制");
      return;
    }
    try {
      await navigator.clipboard.writeText(copyText);
      setNoticeKind("success");
      setNotice("文案已复制");
    } catch {
      setNoticeKind("error");
      setNotice("复制失败，请手动选择文案复制");
    }
  };
  return (
    <AiStyleTag>
      <main className="customer-page customer-ai motion-host">
        <GalaceanStage kind="poster" />
        <header className="customer-page__header"><span>作品预览</span><h1>海报已生成</h1><p>喜欢的话，可以保存到相册。</p></header>
        <section className="customer-ai__poster" aria-label="推荐海报预览">
          <div className="customer-ai__store"><img src="/brand/liaoke-mark.svg" alt="" /><span>{state.store.name}</span></div>
          <p className="customer-ai__poster-copy">{copyText}</p>
          <div className="customer-ai__poster-bottom"><LiaoxiaoxingMoment kind="ai" className="customer-ai__poster-moment" /><div className="customer-ai__qr" aria-label="专属推荐二维码"><QrCode size={58} strokeWidth={1.3} /><span>专属推荐码</span></div></div>
        </section>
        {notice && (noticeKind === "error" ? <p role="alert">{notice}</p> : <StatusPill status="success">{notice}</StatusPill>)}
        <div className="customer-ai__actions">
          <button type="button" onClick={save}><Save size={15} />保存海报</button>
          <button type="button" onClick={copy}><Copy size={14} />复制文案</button>
          <button type="button" onClick={() => onNavigate("ai-create")}><RefreshCw size={14} />再生成一次</button>
        </div>
      </main>
    </AiStyleTag>
  );
}
