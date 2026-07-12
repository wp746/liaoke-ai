# 燎客 AI 微信小程序工程

这是「燎客 AI / SparkFlow AI」的原生微信小程序 MVP 骨架，承接当前品牌、IP、VI 与产品原型。

## 当前包含

- 顾客端 Tab：
  - `pages/index/index`：扫码落地、今日权益、积分与 AI 创作入口。
  - `pages/coupon/list`：权益中心、Liquid Lens 状态筛选、券码弹层。
  - `pages/ai-play/index`：AI 创作、上传/拍照、输入感受、选择风格。
  - `pages/reward/index`：积分、等级进度、任务与积分流水。
  - `pages/me/index`：会员等级、我的服务、商家工具入口。
- 顾客端流程页：
  - `pages/ai-result/index`：AI 文案候选与选择。
  - `pages/poster/preview`：海报预览、复制文案、模拟保存。
  - `pages/group/join`：会员福利群引导、二维码放大、复制入群链接。
- 商家端：
  - `pages/merchant/verify`：生产化核销工作台，覆盖查询、可核销、处理中、成功和错误状态。
  - `pages/merchant/dashboard`：生产化今日经营首页，覆盖六项指标、转化率、最近核销和四种页面状态。
- 品牌组件：
  - `components/lk-glass-surface`：Acrylic / Lens / Solid 玻璃材质。
  - `components/lk-liquid-lens`：筛选与选中态液态焦点层。
  - `components/lk-reward-glyph`：透明立体业务 Glyph。
  - `components/lk-liaoxiaoxing-moment`：燎小星场景与统一 Hero 尺寸。
  - `components/lk-spark-motion`：高价值节点的轻量反馈。
  - `components/brand-lockup`：燎客 AI 品牌锁定。
  - `components/mascot-card`：燎小星 IP 引导卡。
  - `components/coupon-card`：统一吃肉券卡片。
- 品牌资产：
  - SVG 源文件：`assets/brand/*.svg`
  - 小程序优先引用 PNG：`assets/brand/png/*.png`
  - 燎小星标准 IP 动作：`assets/brand/ip/*.png`，统一使用有披肩 3D 版。
  - 五页面生产场景：`assets/brand/scenes/*.png`，来源锁定为正式场景母库。
- TabBar 图标：
  - 源 SVG：`assets/tabbar/svg/*.svg`
  - 小程序引用 PNG：`assets/tabbar/png/*.png`

## 本地校验

在项目根目录运行：

```bash
npm run validate:miniprogram
npm run validate:api-contract
npm run smoke:miniprogram
npm run smoke:api
npm run verify:all
```

`validate:miniprogram` 校验内容：

- `app.json` 声明的页面是否都有 `.js/.json/.wxml/.wxss`。
- `tabBar` 页面是否存在。
- 页面 `usingComponents` 指向的组件文件是否完整。
- 小程序 JS 内的本地 `require()` 路径是否存在。
- 品牌 SVG/PNG 资产是否存在。
- WXML 内引用的本地图片是否存在。
- 小程序 JS 是否能完成语法解析。

`smoke:miniprogram` 会在 Node 里跑通 mock 业务链路：

- 微信登录
- 发券
- 券列表
- AI 文案生成
- 海报生成
- 入群点击埋点
- 商家核销预览
- 商家核销
- 今日统计

`smoke:api` 会启动本地 HTTP mock server，并用真实 HTTP 请求跑通同一组接口。

`validate:api-contract` 会检查接口文档、小程序 `api.js` 和本地 HTTP mock server 是否覆盖同一组核心 endpoint。

`verify:all` 会串行运行品牌导出、小程序结构校验、接口契约校验、两套 smoke test 和网页构建。

## 打开方式

用微信开发者工具导入仓库内的 `miniprogram/`。

`appid` 当前为 `touristappid`，正式联调时替换为真实小程序 AppID。

## 当前真实可运行能力

这个目录不是网页截图，而是原生微信小程序工程。导入微信开发者工具后，可以直接跑：

- 首页扫码落地与发券。
- 一键进入会员福利群引导页。
- 券包查看与券码弹层。
- AI 创作输入、mock 上传、AI 文案生成。
- 海报预览与 canvas 保存到相册。
- 奖励任务页。
- 商家核销与今日数据页。

会员群入口的真实限制是：微信小程序不能静默把用户直接拉进微信群。当前实现采用可上线的结构：点击入口记录 `group_join_click`，进入原生引导页，展示群二维码并支持复制群引导链接。正式上线时，把门店配置里的 `groupChatUrl` / `groupQrImage` 替换为真实企微或微信群引导资源。

## 下一步接真实接口

当前数据集中在：

```text
utils/mock.js
```

接口服务层集中在：

```text
config.example.js
utils/config.js
utils/request.js
utils/api.js
utils/mock-service.js
utils/storage.js
```

当前 `utils/config.js` 中 `useMock: true`。正式接后端时：

1. 把 `baseUrl` 改成测试或生产 API 域名。
2. 把 `useMock` 改成 `false`。
3. 保持页面调用 `utils/api.js`，不要在页面里直接写 `wx.request`。

本地 HTTP mock 联调：

```bash
npm run dev:api
```

服务地址：

```text
http://127.0.0.1:5174
```

如果想让微信开发者工具走本地 HTTP mock，把 `utils/config.js` 改成 `config.example.js` 里的 `localHttpMock` 配置。

也可以直接运行：

```bash
npm run config:miniprogram:local
```

回到页面内 mock：

```bash
npm run config:miniprogram:mock
```

后续把 mock 替换为接口时，优先按这些模块拆：

- 登录与门店：`/api/user/login`、`/api/store/detail`、`/api/qr/parse`
- 优惠券：`/api/coupon/issue`、`/api/coupon/list`、`/api/coupon/verify`
- AI 创作：`/api/upload/token`、`/api/ai/text`、`/api/ai/image`
- 海报：`/api/poster/generate`
- 统计：`/api/stats/event`、`/api/stats/daily`

## 生产视觉约束

- 首页、权益、AI 创作、积分、我的分别使用 `home / benefits / ai / points / profile` 场景。
- 顶部燎小星固定 `340rpx × 340rpx`，必须有披风、透明背景。
- 页面不得自行新增品牌色、圆角、阴影或玻璃材质常量，统一使用 `app.wxss` 的 `--lk-*` Token 和共享组件。
- `backdrop-filter` 只作增强；关闭模糊后仍须呈现暖白实体玻璃。
- 根节点必须透传 `.reduce-motion`，关闭动画后不能改变布局或业务结果。
- iOS 与 Android 使用同一 WXML、WXSS、场景资产和动效参数，不维护“安卓扁平版”。
- 商家端比用户端更克制：工作表单、指标和记录优先使用 Solid；完整燎小星不进入表格、表单和普通列表。

## 海报生成

`pages/poster/preview` 已经包含隐藏 2D canvas：

- 按当前海报文案、门店名、slogan、scene 绘制分享海报。
- 使用燎小星 PNG 资产。
- 点击「保存到相册」时调用 `wx.canvasToTempFilePath` 和 `wx.saveImageToPhotosAlbum`。
- 当前小程序码为本地占位绘制，后端接入后应替换为真实小程序码图片。

接口细节见：

```text
docs/standard-mvp/10-api-contract.md
```

联调闸口见：

```text
miniprogram/INTEGRATION_CHECKLIST.md
```

面向手动测试的步骤见：

```text
miniprogram/TESTING.md
```
