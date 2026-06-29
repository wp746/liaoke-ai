import React, { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  Copy,
  Flame,
  Gift,
  ImagePlus,
  Menu,
  MessageCircle,
  MoreHorizontal,
  QrCode,
  ScanLine,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";
import {
  brandTokens,
  couponCards,
  posterCopy,
  quickActions,
  rewardTiles,
  screenTabs,
  styles,
  viCards,
} from "./data";

const mascotImages = {
  default: "/brand/ip-liaoxiaoxing/standard/liaoxiaoxing-standalone-no-star.png",
  hero: "/brand/ip-liaoxiaoxing/standard/liaoxiaoxing-standalone-no-star.png",
  coupon: "/brand/ip-liaoxiaoxing/standard/liaoxiaoxing-standalone-no-star.png",
  upload: "/brand/ip-liaoxiaoxing/standard/liaoxiaoxing-standalone-no-star.png",
  poster: "/brand/ip-liaoxiaoxing/standard/liaoxiaoxing-standalone-no-star.png",
  reward: "/brand/ip-liaoxiaoxing/standard/liaoxiaoxing-standalone-no-star.png",
  group: "/brand/ip-liaoxiaoxing/standard/liaoxiaoxing-standalone-no-star.png",
};

const ipAssetBoards = [
  {
    title: "角色标准板",
    note: "正面、侧面、背面、挥手、举券",
    image: "/brand/ip-liaoxiaoxing/boards/liaoxiaoxing-character-sheet.png",
  },
  {
    title: "表情动作板",
    note: "欢迎、点赞、惊喜、思考、举券、扫码",
    image: "/brand/ip-liaoxiaoxing/boards/liaoxiaoxing-sticker-sheet.png",
  },
  {
    title: "小程序场景板",
    note: "首页、券包、上传、生成、海报、奖励、核销",
    image: "/brand/ip-liaoxiaoxing/boards/liaoxiaoxing-product-poses.png",
  },
];

const ipStickerAssets = [
  ["欢迎", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-welcome.png"],
  ["点赞", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-thumbs-up.png"],
  ["惊喜", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-surprised.png"],
  ["思考", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-thinking.png"],
  ["举券", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-coupon.png"],
  ["上传", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-phone.png"],
  ["扫码", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-qr.png"],
  ["撒花", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-cheering.png"],
  ["吃肉", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-meat-lover.png"],
  ["休息", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-sleeping.png"],
  ["抱歉", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-apology.png"],
  ["礼物", "/brand/ip-liaoxiaoxing/stickers/liaoxiaoxing-gift.png"],
];

const ipProductAssets = [
  ["扫码欢迎", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-welcome-table.png"],
  ["优惠钱包", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-coupon-wallet.png"],
  ["上传照片", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-upload-photo.png"],
  ["AI 生成", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-ai-magic.png"],
  ["海报完成", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-poster-saved.png"],
  ["奖励积分", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-reward-points.png"],
  ["商家核销", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-merchant-verify.png"],
  ["空状态", "/brand/ip-liaoxiaoxing/product-poses/liaoxiaoxing-empty-error.png"],
];

function BrandMark({ compact = false }) {
  return (
    <div className={compact ? "brand-lockup compact" : "brand-lockup"}>
      <img src="/brand/liaoke-mark.svg" alt="燎客 AI 标识" />
      <div>
        <strong>燎客 AI</strong>
        <span>SparkFlow AI</span>
      </div>
    </div>
  );
}

function MascotBubble({ text, align = "right" }) {
  return (
    <div className={`mascot-bubble ${align}`}>
      <img src={mascotImages.default} alt="燎小星" />
      <p>{text}</p>
    </div>
  );
}

function PhoneFrame({ title, activeTab, children, back = false }) {
  return (
    <section className="phone">
      <div className="phone-status">
        <span>9:41</span>
        <span className="status-dots">•••</span>
      </div>
      <header className="phone-topbar">
        {back ? <ChevronLeft size={19} /> : <span />}
        <strong>{title}</strong>
        <div className="mini-actions">
          <MoreHorizontal size={18} />
          <span className="mini-circle" />
        </div>
      </header>
      <div className="phone-content">{children}</div>
      <nav className="tabbar">
        {screenTabs.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeTab;
          return (
            <button key={item.id} className={active ? "active" : ""}>
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}

function HomeScreen() {
  const [groupOpen, setGroupOpen] = useState(false);

  return (
    <PhoneFrame title="燎客 AI" activeTab="home">
      <div className="hero-card">
        <div>
          <h2>欢迎光临</h2>
          <p>一签开启 AI 吃肉新体验</p>
        </div>
        <span className="tag">燎小星</span>
        <img className="hero-mascot" src={mascotImages.hero} alt="燎小星欢迎" />
      </div>
      <div className="quick-grid">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.title}>
              <Icon size={19} />
              <span>{action.title}</span>
            </button>
          );
        })}
        <button onClick={() => setGroupOpen(true)}>
          <MessageCircle size={19} />
          <span>一键入群</span>
        </button>
      </div>
      <button className="primary-button">领取今日吃肉券</button>
      <MascotBubble text="先领券，再让我帮你把这顿饭晒得更好看。" />
      {groupOpen ? (
        <div className="phone-modal">
          <div>
            <img src={mascotImages.group} alt="燎小星会员群" />
            <strong>会员群入口已打开</strong>
            <p>真实小程序里会进入群引导页，记录入群点击，再展示微信群/企微群二维码或复制入群口令。</p>
            <button onClick={() => setGroupOpen(false)}>知道了</button>
          </div>
        </div>
      ) : null}
    </PhoneFrame>
  );
}

function CouponScreen() {
  return (
    <PhoneFrame title="燎客 AI" activeTab="coupon">
      <div className="wallet-card">
        <span>我的吃肉券</span>
        <strong>3</strong>
        <em>张可用券</em>
        <button>去使用</button>
      </div>
      <div className="segment">
        <button className="active">可用券 3</button>
        <button>已使用</button>
        <button>已过期</button>
      </div>
      <div className="coupon-list">
        {couponCards.map((coupon) => (
          <article className="coupon-item" key={coupon.title}>
            <div className="coupon-image" style={{ backgroundImage: coupon.image }} />
            <div>
              <h3>{coupon.title}</h3>
              <p>{coupon.note}</p>
              <span>{coupon.date}</span>
            </div>
            <button>去使用</button>
          </article>
        ))}
      </div>
    </PhoneFrame>
  );
}

function CreateScreen() {
  return (
    <PhoneFrame title="燎客 AI" activeTab="create">
      <div className="screen-heading">
        <div>
          <h2>AI 朋友圈神器</h2>
          <p>上传随手拍，生成我的海报</p>
        </div>
        <img src={mascotImages.upload} alt="燎小星" />
      </div>
      <div className="upload-zone">
        <ImagePlus size={30} />
        <strong>上传随手拍</strong>
        <span>支持美食、环境、合影，最高 10MB</span>
      </div>
      <label className="text-input">
        <span>想表达什么？告诉燎小星吧</span>
        <textarea defaultValue="吊龙太嫩了，朋友聚餐很舒服。" />
      </label>
      <div className="style-row">
        {styles.map((style) => (
          <button key={style.label} className={style.active ? "active" : ""}>
            {style.label}
          </button>
        ))}
      </div>
      <button className="primary-button">生成我的海报</button>
    </PhoneFrame>
  );
}

function PosterScreen() {
  return (
    <PhoneFrame title="燎客 AI" activeTab="create" back>
      <div className="poster-title">
        <h2>海报已生成</h2>
        <p>看看燎小星为你创作的作品吧</p>
      </div>
      <div className="poster-card">
        <div className="poster-photo">
          <div className="poster-copy">
            <span>今日份快乐</span>
            <strong>由肉治愈</strong>
          </div>
          <img src={mascotImages.poster} alt="燎小星" />
        </div>
        <div className="poster-footer">
          <span>MEAT MAKES LIFE BETTER</span>
          <QrCode size={34} />
        </div>
      </div>
      <div className="copy-list">
        {posterCopy.map((copy) => (
          <button key={copy}>
            <Copy size={15} />
            {copy}
          </button>
        ))}
      </div>
      <div className="double-actions">
        <button>重新生成</button>
        <button className="primary-small">保存海报</button>
      </div>
    </PhoneFrame>
  );
}

function RewardScreen() {
  return (
    <PhoneFrame title="燎客 AI" activeTab="reward">
      <div className="reward-top">
        <div>
          <span>我的奖励</span>
          <strong>128</strong>
          <em>燎星值</em>
        </div>
        <button>去兑换</button>
        <img src={mascotImages.reward} alt="燎小星奖励" />
      </div>
      <div className="progress-card">
        <div>
          <h3>今日进度</h3>
          <span>再获得 72 燎星值可升级</span>
        </div>
        <p>Lv.2 食肉达人</p>
        <div className="progress-track">
          <span />
        </div>
      </div>
      <div className="reward-grid">
        {rewardTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <article key={tile.label}>
              <Icon size={24} />
              <h3>{tile.label}</h3>
              <p>{tile.points}</p>
              <button>{tile.cta}</button>
            </article>
          );
        })}
      </div>
      <div className="invite-card">
        <Gift size={32} />
        <div>
          <strong>邀请好友赚燎星值</strong>
          <span>每成功邀请 1 位好友 +30</span>
        </div>
        <button>去邀请</button>
      </div>
    </PhoneFrame>
  );
}

function BrandSection() {
  return (
    <section className="brand-section">
      <div className="brand-left">
        <BrandMark />
        <h1>用一块桌边 AI 小签，把到店顾客变成下一波客流。</h1>
        <p>
          燎客 AI / SparkFlow AI 是面向线下餐饮的桌边裂变获客系统。顾客扫码领券，燎小星引导他生成图文海报，自愿分享后带来新客与奖励。
        </p>
        <div className="brand-actions">
          <button>
            查看小程序原型
            <ArrowRight size={18} />
          </button>
          <button className="ghost-button">下载品牌规范</button>
        </div>
      </div>
      <div className="brand-board">
        <img src="/brand/liaoke-logo.svg" alt="燎客 AI Logo" className="full-logo" />
        <div className="mascot-card">
          <img src={mascotImages.default} alt="燎小星 IP" />
          <div>
            <span>系统级 IP</span>
            <strong>燎小星</strong>
            <p>一颗会说话的小火星，负责欢迎、领券、AI 创作与奖励提醒。</p>
          </div>
        </div>
        <div className="token-grid">
          {brandTokens.map((token) => (
            <div key={token.name}>
              <span style={{ backgroundColor: token.value }} />
              <p>{token.name}</p>
              <em>{token.value}</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ViSection() {
  return (
    <section className="vi-section">
      <div className="section-title">
        <h2>VI 视觉系统第一版</h2>
        <p>把「星火燎原」做成可识别的 Logo、IP 和小程序体验，而不是普通扫码优惠牌。</p>
      </div>
      <div className="vi-grid">
        {viCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title}>
              <Icon size={26} />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          );
        })}
      </div>
      <div className="table-tag">
        <div className="tag-panel">
          <BrandMark compact />
          <h3>AI 肉小签</h3>
          <p>扫码领券 · AI 晒圈</p>
          <div className="fake-qr">
            <ScanLine size={42} />
          </div>
          <span>先领今天的吃肉券，再让燎小星帮你生成高级朋友圈。</span>
        </div>
        <div className="tag-copy">
          <BadgeCheck size={24} />
          <h3>桌牌 IP 可按门店定制</h3>
          <p>牛肉火锅用 AI 肉小签，咖啡馆用 AI 咖小签，烧烤店用 AI 串小签；系统内统一由燎小星接待。</p>
        </div>
      </div>
    </section>
  );
}

function IpAssetSection() {
  return (
    <section className="ip-section">
      <div className="section-title">
        <h2>燎客 Logo 与燎小星定稿</h2>
        <p>Logo 采用扫码框与火焰客流符号；IP 只保留单独燎小星形象，不带头顶星星和周边物品。</p>
      </div>
      <div className="identity-showcase">
        <article className="logo-showcase">
          <h3>燎客 AI 主 Logo</h3>
          <img src="/brand/liaoke-logo.svg" alt="燎客 AI Logo" />
          <p>扫码框代表桌牌入口，火焰代表点燃客流，三点代表从扫码、AI 创作到回流复购。</p>
        </article>
        <article className="mark-showcase">
          <h3>小程序图标</h3>
          <img src="/brand/liaoke-mark.svg" alt="燎客 AI 标识" />
        </article>
        <article className="mascot-showcase">
          <h3>燎小星标准 IP</h3>
          <img src={mascotImages.default} alt="燎小星标准单独形象" />
          <p>单独角色、有披肩、胸前星形；头顶没有星星，周围没有手机、扫码机、二维码等道具。</p>
        </article>
      </div>
    </section>
  );
}

function PrototypeSection() {
  return (
    <section className="prototype-section">
      <div className="section-title">
        <h2>小程序核心流程原型</h2>
        <p>从扫码落地、吃肉券、AI 创作、海报预览到奖励体系，先把标准版 MVP 的主链路跑通。</p>
      </div>
      <div className="phone-row">
        <HomeScreen />
        <CouponScreen />
        <CreateScreen />
        <PosterScreen />
        <RewardScreen />
      </div>
    </section>
  );
}

function App() {
  return (
    <main>
      <header className="site-header">
        <BrandMark compact />
        <nav>
          <a href="#vi">VI 系统</a>
          <a href="#ip-assets">IP 资产</a>
          <a href="#prototype">小程序原型</a>
          <a href="/docs/brand-ip/README.md">品牌文档</a>
        </nav>
        <button>
          <Menu size={18} />
          交付包
        </button>
      </header>
      <BrandSection />
      <div id="vi">
        <ViSection />
      </div>
      <div id="ip-assets">
        <IpAssetSection />
      </div>
      <div id="prototype">
        <PrototypeSection />
      </div>
      <footer>
        <Flame size={20} />
        <span>燎客 AI · 让每一位顾客，都帮你点燃下一位顾客。</span>
      </footer>
    </main>
  );
}

export default App;
