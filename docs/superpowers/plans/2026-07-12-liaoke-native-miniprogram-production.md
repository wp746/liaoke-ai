# 燎客原生小程序生产化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已锁定的燎客 Liquid Glass 视觉系统生产化到原生微信小程序，先交付用户端首页、权益、AI 创作、积分、我的五个主页面及共享组件。

**Architecture:** 保留现有 `utils/api.js`、Mock/真实接口切换和页面业务状态，把视觉能力集中到 `app.wxss`、场景映射模块和五个原生共享组件。业务页面只组合 `lk-glass-surface`、`lk-liquid-lens`、`lk-reward-glyph`、`lk-liaoxiaoxing-moment`、`lk-spark-motion`，不自行定义品牌色、圆角、阴影和场景资产路径。

**Tech Stack:** 原生微信小程序 WXML/WXSS/CommonJS、Node.js 内建测试、现有 Mock API、透明 PNG 场景资产。

## Global Constraints

- 用户端、商家端、平台后台必须共享同源视觉 Token。
- iOS 与 Android 使用相同布局、尺寸、素材、层级和动效参数。
- 手机顶部燎小星统一使用 `340rpx × 340rpx`，对应设计基线 `170 × 170px`。
- 首页、权益、AI、积分、我的分别使用 `home-welcome`、`benefits-wallet`、`ai-magic`、`points-reward`、`profile-phone`。
- 所有场景资产必须有披风和透明背景，不得使用旧无披风或白底资产。
- `backdrop-filter` 只作增强，基础背景必须在不支持模糊时保持暖白实体玻璃。
- Galacean 或重动效只进入领券、核销、AI 完成、升级、积分兑换等高价值节点。
- 所有行为变更遵守测试先行的 Red-Green-Refactor。

---

### Task 1: 锁定原生视觉系统合同

**Files:**
- Create: `tests/unit/miniprogram-visual-system.test.js`
- Modify: `scripts/validate-miniprogram.js`

**Interfaces:**
- Consumes: `miniprogram/app.json`、`miniprogram/app.wxss`、小程序页面和组件文件。
- Produces: 可自动校验五页面导航、共享组件、场景资产、Hero 尺寸和禁止旧资产的测试合同。

- [ ] **Step 1: Write the failing test**

新增测试，断言：

```js
assert.deepEqual(
  appJson.tabBar.list.map(({ text }) => text),
  ["首页", "权益", "AI创作", "积分", "我的"]
);
assert.match(appWxss, /--lk-ember-600:\s*#ff4b1b/);
assert.match(appWxss, /\.lk-glass-acrylic/);
assert.match(appWxss, /\.lk-pressable:active/);
```

并逐页断言 `usingComponents` 包含对应共享组件、WXML 使用正确 `scene-id`、源码不再包含 `liaoxiaoxing-standalone-no-star.png`。

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/unit/miniprogram-visual-system.test.js`

Expected: FAIL，原因是共享组件、Token、Tab 文案和场景映射尚未完成。

- [ ] **Step 3: Extend structural validation**

让 `scripts/validate-miniprogram.js` 额外检查：

```js
const requiredComponents = [
  "components/lk-glass-surface/lk-glass-surface",
  "components/lk-liquid-lens/lk-liquid-lens",
  "components/lk-reward-glyph/lk-reward-glyph",
  "components/lk-liaoxiaoxing-moment/lk-liaoxiaoxing-moment",
  "components/lk-spark-motion/lk-spark-motion"
];
```

并校验场景 manifest 中的运行资产在小程序目录存在。

- [ ] **Step 4: Keep the test red**

Run: `node --test tests/unit/miniprogram-visual-system.test.js`

Expected: 仍然 FAIL，但不出现测试语法或路径错误。

---

### Task 2: 场景资产与共享 Token

**Files:**
- Modify: `scripts/export-brand-kit.cjs`
- Create: `miniprogram/assets/brand/scenes/manifest.js`
- Create: `miniprogram/assets/brand/scenes/*.png`
- Modify: `miniprogram/app.wxss`
- Modify: `miniprogram/app.js`

**Interfaces:**
- Produces: `sceneAssets` 映射、统一 Token、玻璃降级、按压和减少动态效果类。

- [ ] **Step 1: Add asset export mappings**

从 `public/brand/ip-liaoxiaoxing/scene-library/display/` 复制五个运行资产到：

```text
miniprogram/assets/brand/scenes/
```

- [ ] **Step 2: Add scene manifest**

导出：

```js
module.exports = {
  home: "/assets/brand/scenes/scene-home-welcome.png",
  benefits: "/assets/brand/scenes/scene-benefits-wallet.png",
  ai: "/assets/brand/scenes/scene-ai-magic.png",
  points: "/assets/brand/scenes/scene-points-reward.png",
  profile: "/assets/brand/scenes/scene-profile-phone.png"
};
```

- [ ] **Step 3: Implement global Token**

在 `app.wxss` 增加 `--lk-*` Token、Base Canvas、Acrylic、Lens、Solid、圆角、阴影、按压、触控尺寸、暗纹和 `.reduce-motion` 规则。

- [ ] **Step 4: Add motion preference**

`app.js` 读取本地 `liaoke_reduce_motion`，放入 `globalData.reduceMotion`，页面根节点通过数据绑定添加 `.reduce-motion`。

- [ ] **Step 5: Run the contract test**

Run: `node --test tests/unit/miniprogram-visual-system.test.js`

Expected: Token 和资产相关断言 PASS，共享组件相关断言仍 FAIL。

---

### Task 3: 原生共享视觉组件

**Files:**
- Create: `miniprogram/components/lk-glass-surface/*`
- Create: `miniprogram/components/lk-liquid-lens/*`
- Create: `miniprogram/components/lk-reward-glyph/*`
- Create: `miniprogram/components/lk-liaoxiaoxing-moment/*`
- Create: `miniprogram/components/lk-spark-motion/*`

**Interfaces:**
- `lk-glass-surface`: `level = acrylic|lens|solid`、`interactive`。
- `lk-liquid-lens`: `active`。
- `lk-reward-glyph`: `kind`、`state`、`value`。
- `lk-liaoxiaoxing-moment`: `sceneId`、`compact`、`decorative`。
- `lk-spark-motion`: `kind`、`active`、`reduced`。

- [ ] **Step 1: Implement GlassSurface**

组件 WXML：

```xml
<view class="lk-glass lk-glass--{{level}} {{interactive ? 'lk-pressable' : ''}}">
  <slot />
</view>
```

- [ ] **Step 2: Implement LiquidLens**

提供选中态、短尾焰和静态降级，不改变布局尺寸。

- [ ] **Step 3: Implement RewardGlyph**

至少覆盖 `store / dish / group / drink / balance / points / referral / ai` 和 `active / used / expired / paused`。

- [ ] **Step 4: Implement LiaoxiaoxingMoment**

组件根据 `sceneId` 从 manifest 选择图片；Hero 固定 `340rpx × 340rpx`，装饰模式设置无障碍隐藏语义。

- [ ] **Step 5: Implement SparkMotion**

使用原生 WXSS 提供轻量星点和成功光环；`reduced=true` 时完全静态。

- [ ] **Step 6: Run validation**

Run: `npm run validate:miniprogram && node --test tests/unit/miniprogram-visual-system.test.js`

Expected: 组件结构与核心样式断言 PASS，页面集成断言仍 FAIL。

---

### Task 4: 用户端五个主页面生产化

**Files:**
- Modify: `miniprogram/app.json`
- Modify: `miniprogram/pages/index/index.{js,json,wxml,wxss}`
- Modify: `miniprogram/pages/coupon/list.{js,json,wxml,wxss}`
- Modify: `miniprogram/pages/ai-play/index.{js,json,wxml,wxss}`
- Modify: `miniprogram/pages/reward/index.{js,json,wxml,wxss}`
- Modify: `miniprogram/pages/me/index.{js,json,wxml,wxss}`
- Modify: `miniprogram/components/coupon-card/*`

**Interfaces:**
- 页面继续调用现有 API 和导航方法。
- 页面只通过共享组件和 `scene-id` 表达视觉语义。

- [ ] **Step 1: Update tab contract**

Tab 文案锁定为：

```json
["首页", "权益", "AI创作", "积分", "我的"]
```

- [ ] **Step 2: Redesign 首页**

使用 `home-welcome` Hero、今日权益 CTA、权益/积分数据和 AI 入口；移除重复完整角色。

- [ ] **Step 3: Redesign 权益**

使用 `benefits-wallet` Hero、Liquid Lens 三分类、立体券 Glyph、Ash 状态和右箭头燎小星暗纹。

- [ ] **Step 4: Redesign AI 创作**

使用 `ai-magic` Hero、Acrylic 输入工作台、AI Cyan 仅用于 AI 状态、按压与上传状态反馈。

- [ ] **Step 5: Redesign 积分**

将“奖励”统一改为“积分”，使用 `points-reward` Hero、积分数、商城入口、任务和积分流水语义。

- [ ] **Step 6: Redesign 我的**

使用 `profile-phone` Hero、会员等级卡和“我的服务”列表，右箭头下使用低透明度角色暗纹。

- [ ] **Step 7: Run the contract test**

Run: `node --test tests/unit/miniprogram-visual-system.test.js`

Expected: PASS。

---

### Task 5: 交互状态、验收和交接

**Files:**
- Modify: `miniprogram/README.md`
- Modify: `miniprogram/TESTING.md`
- Modify: `miniprogram/INTEGRATION_CHECKLIST.md`
- Modify: `docs/brand-ip/08-mini-program-development-handoff.md`

**Interfaces:**
- Produces: 开发公司可执行的真机验收步骤和差异报告模板。

- [ ] **Step 1: Add state checklist**

五页面分别覆盖正常、加载、空、错误、禁用、成功状态。

- [ ] **Step 2: Add cross-platform checklist**

要求 iPhone 和 Android 同页面截图、关键交互录屏、暖白降级和减少动态效果记录。

- [ ] **Step 3: Run complete verification**

Run:

```bash
npm test
npm run validate:miniprogram
npm run smoke:miniprogram
npm run verify:all
git diff --check
```

Expected: 全部退出码为 0。

- [ ] **Step 4: Review changed scope**

确认提交只包含原生视觉系统、五页面、资产、测试和交接文档，不包含临时文件。

- [ ] **Step 5: Commit and push**

Commit:

```bash
git commit -m "feat: productionize customer mini program visual system"
```

Push current branch and update Draft PR 的生产化状态。
