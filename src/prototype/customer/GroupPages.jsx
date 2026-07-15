import React, { useEffect, useRef, useState } from "react";
import { BellRing, CakeSlice, CheckCircle2, Copy, ExternalLink, QrCode, TicketCheck, UsersRound, X } from "lucide-react";
import QRCode from "qrcode";
import { LiaoxiaoxingMoment } from "../components/Glass.jsx";
import { PrimaryButton, StatusPill, SurfaceCard } from "../components/Ui.jsx";

const groupBenefits = [
  { icon: TicketCheck, title: "群内隐藏券", detail: "不定期发放门店专属券和限时福利" },
  { icon: BellRing, title: "新品与午市提醒", detail: "新品、限量菜和工作日福利先知道" },
  { icon: CakeSlice, title: "生日月关怀", detail: "生日月到店可关注专属礼和积分活动" },
];

export function PrivateGroup({ state, dispatch, onNavigate }) {
  const group = state.operations.privateGroup;
  const trackedView = useRef(false);
  const [qrSource, setQrSource] = useState(group.qrImage);
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState("success");
  const [qrExpanded, setQrExpanded] = useState(false);

  useEffect(() => {
    if (!trackedView.current) {
      trackedView.current = true;
      dispatch({ type: "TRACK_GROUP_EVENT", eventName: "page_view", source: "customer" });
    }
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    if (group.qrImage) {
      setQrSource(group.qrImage);
      return () => { active = false; };
    }
    QRCode.toDataURL(group.joinUrl, { width: 360, margin: 2, color: { dark: "#201712", light: "#ffffff" } })
      .then((dataUrl) => { if (active) setQrSource(dataUrl); })
      .catch(() => { if (active) setQrSource(""); });
    return () => { active = false; };
  }, [group.joinUrl, group.qrImage]);

  const openJoinEntry = () => {
    dispatch({ type: "TRACK_GROUP_EVENT", eventName: "join_click", source: "customer" });
    if (!group.joinUrl.includes("example.com")) window.open(group.joinUrl, "_blank", "noopener,noreferrer");
    setNoticeKind("success");
    setNotice(group.joinUrl.includes("example.com") ? "演示环境已记录入群点击，正式小程序将打开企业微信群通道" : "已打开企业微信群入群通道");
  };

  const copyJoinLink = async () => {
    try {
      await navigator.clipboard.writeText(group.joinUrl);
      dispatch({ type: "TRACK_GROUP_EVENT", eventName: "link_copy", source: "customer" });
      setNoticeKind("success");
      setNotice("入群链接已复制");
    } catch {
      setNoticeKind("error");
      setNotice("复制失败，请长按二维码识别或联系群助手");
    }
  };

  const contactAssistant = () => {
    dispatch({ type: "TRACK_GROUP_EVENT", eventName: "assistant_request", source: "customer" });
    setNoticeKind("success");
    setNotice(`已为你连接${group.assistantName}，正式小程序将打开客服会话`);
  };

  if (!group.enabled) {
    return <main className="customer-page customer-group"><header className="customer-page__header"><span>门店私域服务</span><h1>会员福利群</h1></header><SurfaceCard tone="plain"><StatusPill status="danger">入口维护中</StatusPill><strong>本店暂未开放入群</strong><p>已经领取的券、余额和积分不受影响。</p><PrimaryButton onClick={() => onNavigate("home")}>返回首页</PrimaryButton></SurfaceCard></main>;
  }

  return (
    <main className="customer-page customer-group">
      <LiaoxiaoxingMoment kind="group" className="customer-scene-hero customer-group-hero">
        <header className="customer-page__header"><span>企业微信会员福利群</span><h1>{group.name}</h1><p>{group.guide}</p></header>
      </LiaoxiaoxingMoment>

      <section className="customer-group-benefits" aria-label="会员群福利">
        {groupBenefits.map(({ icon: Icon, title, detail }) => <article key={title}><Icon size={20} /><span><strong>{title}</strong><small>{detail}</small></span></article>)}
      </section>

      <section className="customer-group-join" aria-labelledby="group-join-title">
        <div><span className="customer-group-step">推荐方式</span><h2 id="group-join-title">扫码加入企业微信群</h2><p>点击二维码可放大。在微信里也可以长按识别或保存后从相册扫描。</p></div>
        <button type="button" className="customer-group-qr" aria-label="放大企业微信群二维码" onClick={() => setQrExpanded(true)}>
          {qrSource ? <img src={qrSource} alt="企业微信群入群二维码" /> : <QrCode size={90} />}
        </button>
        <small>群活码有效期至 {group.qrExpiresAt}，失效时请联系群助手。</small>
      </section>

      {notice && (noticeKind === "error" ? <p role="alert" className="customer-group-notice is-error">{notice}</p> : <p role="status" className="customer-group-notice"><CheckCircle2 size={16} />{notice}</p>)}

      <div className="customer-group-actions">
        <PrimaryButton onClick={openJoinEntry}><ExternalLink size={16} />一键打开入群入口</PrimaryButton>
        <button type="button" className="customer-group-secondary" onClick={copyJoinLink}><Copy size={15} />复制入群链接</button>
        <button type="button" className="customer-group-assistant" onClick={contactAssistant}><UsersRound size={15} />群满或二维码失效？联系{group.assistantName}</button>
      </div>

      <p className="customer-group-consent">入群完全自愿，退群不影响已经领取的券、余额和积分。群内不索要支付密码、验证码或身份证照片。</p>

      {qrExpanded && <div className="customer-group-dialog-backdrop"><section className="customer-group-dialog" role="dialog" aria-modal="true" aria-label="企业微信群二维码"><button type="button" aria-label="关闭二维码" onClick={() => setQrExpanded(false)}><X size={19} /></button>{qrSource ? <img src={qrSource} alt="放大的企业微信群入群二维码" /> : <QrCode size={180} />}<strong>{group.name}</strong><p>长按识别二维码，或保存后从微信相册扫码。</p></section></div>}
    </main>
  );
}
