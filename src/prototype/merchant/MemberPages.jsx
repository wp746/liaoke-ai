import React, { useMemo, useState } from "react";
import { Bot, ChevronRight, Coins, Crown, Search, Sparkles, Ticket, TrendingUp, UserRound } from "lucide-react";
import { GlassSurface } from "../components/Glass.jsx";
import { StatusPill } from "../components/Ui.jsx";

const memberFacts = {
  "MEM-20260710-01": { joined: "2026-03-18", lastVisitDays: 2, growth: 1280, nextLevel: 220, spent: "¥ 2,860", aiUses: 12, lastAi: "2026-07-10 20:16" },
  "MEM-20260708-02": { joined: "2025-11-08", lastVisitDays: 4, growth: 2860, nextLevel: 2140, spent: "¥ 6,420", aiUses: 26, lastAi: "2026-07-08 21:05" },
  "MEM-20260709-03": { joined: "2026-07-09", lastVisitDays: 1, growth: 180, nextLevel: 320, spent: "¥ 188", aiUses: 1, lastAi: "2026-07-09 19:40" },
};

function MemberList({ members, onOpen }) {
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("all");
  const [recentDays, setRecentDays] = useState("all");
  const [referrals, setReferrals] = useState("all");
  const visibleMembers = useMemo(() => members.filter((member) => {
    const needle = keyword.trim().toLowerCase();
    const matchesKeyword = !needle || member.name.toLowerCase().includes(needle) || member.maskedPhone.slice(-4).includes(needle);
    const matchesLevel = level === "all" || member.level === level;
    const matchesVisit = recentDays === "all" || memberFacts[member.id].lastVisitDays <= Number(recentDays);
    const matchesReferrals = referrals === "all" || member.referrals >= Number(referrals);
    return matchesKeyword && matchesLevel && matchesVisit && matchesReferrals;
  }), [keyword, level, members, recentDays, referrals]);

  return (
    <main className="merchant-page merchant-members">
      <div className="merchant-page-heading"><StatusPill status="plain">会员数据只读</StatusPill><h1>会员管理</h1><p>按会员等级、最近到店和老带新人数筛选。</p></div>
      <label className="merchant-member-search"><Search size={15} /><span className="sr-only">搜索会员</span><input aria-label="搜索会员" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索昵称或手机后 4 位" /></label>
      <div className="merchant-member-filters">
        <label>会员等级<select aria-label="会员等级" value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">全部等级</option>{[...new Set(members.map(({ level: item }) => item))].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>最近到店<select aria-label="最近到店" value={recentDays} onChange={(event) => setRecentDays(event.target.value)}><option value="all">不限</option><option value="7">近 7 天</option><option value="30">近 30 天</option></select></label>
        <label>老带新人数<select aria-label="老带新人数" value={referrals} onChange={(event) => setReferrals(event.target.value)}><option value="all">不限</option><option value="1">至少 1 人</option><option value="3">至少 3 人</option><option value="5">至少 5 人</option></select></label>
      </div>
      <GlassSurface as="div" level="solid" className="merchant-member-list" aria-live="polite">
        {visibleMembers.map((member) => <button type="button" key={member.id} onClick={() => onOpen(member.id)} aria-label={`${member.name} ${member.maskedPhone} 查看详情`}><span className="merchant-member-avatar"><UserRound size={18} /></span><span><strong>{member.name}</strong><small>{member.maskedPhone} · {member.level}</small><small>到店 {member.visits} 次 · 老带新 {member.referrals} 人</small></span><ChevronRight size={16} /></button>)}
        {!visibleMembers.length && <div className="merchant-member-empty"><strong>没有匹配的会员</strong><span>试试清空筛选条件或输入其他关键词。</span></div>}
      </GlassSurface>
    </main>
  );
}

function DetailSection({ icon: Icon, title, children }) {
  return <GlassSurface level="solid" className="ui-card ui-card--plain merchant-operations-panel"><div className="merchant-member-section-title"><Icon size={15} /><h2>{title}</h2></div>{children}</GlassSurface>;
}

function MemberDetail({ member }) {
  const facts = memberFacts[member.id];
  return (
    <main className="merchant-page merchant-member-detail">
      <header><span className="merchant-member-avatar"><UserRound size={22} /></span><div><StatusPill status="success">{member.level}</StatusPill><h1>{member.name}</h1><p>{member.maskedPhone} · 入会于 {facts.joined}</p></div></header>
      <DetailSection icon={UserRound} title="基本资料"><div className="merchant-detail-grid"><span>会员编号</span><strong>{member.id}</strong><span>累计到店</span><strong>{member.visits} 次</strong></div></DetailSection>
      <DetailSection icon={TrendingUp} title="等级成长"><strong>{facts.growth} 成长值</strong><p>距下一等级还差 {facts.nextLevel} 成长值</p><progress value={facts.growth} max={facts.growth + facts.nextLevel} /></DetailSection>
      <DetailSection icon={Crown} title="消费记录"><div className="merchant-detail-grid"><span>累计消费</span><strong>{facts.spent}</strong><span>最近消费</span><strong>2026-07-10 · ¥ 268</strong></div></DetailSection>
      <DetailSection icon={Bot} title="AI 晒圈"><div className="merchant-detail-grid"><span>累计生成</span><strong>{facts.aiUses} 次</strong><span>最近使用</span><strong>{facts.lastAi}</strong></div></DetailSection>
      <DetailSection icon={Sparkles} title="当前权益"><p>生日赠品券 · 本月可用</p><p>熟客专享 9 折券 · 2 张</p></DetailSection>
      <DetailSection icon={Coins} title="积分记录"><div className="merchant-detail-grid"><span>当前积分</span><strong>{member.points} 分</strong><span>最近入账</span><strong>消费奖励 +268</strong></div></DetailSection>
      <DetailSection icon={Ticket} title="老带新抵扣券记录"><p>已带来 {member.referrals} 位新客</p><p>RC-20260708-ACTIVE · ¥10 · 可使用</p></DetailSection>
    </main>
  );
}

export function MemberPages({ routeId, members, onNavigate }) {
  const [selectedId, setSelectedId] = useState(members[0]?.id);
  const selected = members.find(({ id }) => id === selectedId) ?? members[0];
  const open = (memberId) => { setSelectedId(memberId); onNavigate("member-detail"); };
  return routeId === "members" ? <MemberList members={members} onOpen={open} /> : <MemberDetail member={selected} />;
}
