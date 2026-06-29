# 燎客 AI 小程序测试说明

## 1. 导入项目

用微信开发者工具导入这个目录：

```text
/Users/wangpeng/Documents/Playground/AI 扫码牌/miniprogram
```

当前 `project.config.json` 使用：

```text
appid: touristappid
```

可以直接用游客 AppID 预览 mock 版本。正式联调时再换真实小程序 AppID。

## 2. 当前测试模式

默认是页面内 mock，不需要后端服务：

```js
// miniprogram/utils/config.js
useMock: true
```

所以你导入后可以直接点页面测试。

## 3. 核心测试路径

### 路径 A：首页扫码落地

入口：

```text
pages/index/index
```

测试：

1. 查看首页门店信息、AI 肉小签、燎小星有披肩形象。
2. 点击「领取今日吃肉券」。
3. 点击「一键入群」。

预期：

- 吃肉券进入券包。
- 一键入群进入 `pages/group/join`。
- 入群点击会记录 `group_join_click` mock 埋点。

### 路径 B：券包核销码

入口：

```text
pages/coupon/list
```

测试：

1. 点击任意可用券的「出示」。
2. 查看券码弹层。
3. 关闭弹层。

预期：

- 可看到券名、权益、二维码占位和券码。

### 路径 C：AI 创作海报

入口：

```text
pages/ai-play/index
```

测试：

1. 可不上传图片，直接输入一句感受。
2. 选择风格。
3. 点击「生成我的朋友圈素材」。
4. 在文案候选页选择一版。
5. 点击「生成分享海报」。
6. 在海报页点击「复制文案」或「保存到相册」。

预期：

- 文案候选由 mock AI 接口返回。
- 海报页能看到燎小星有披肩形象。
- 保存海报会走小程序 canvas 保存流程。

### 路径 D：奖励

入口：

```text
pages/reward/index
```

测试：

1. 查看燎星值、今日进度。
2. 点击任务按钮。
3. 点击邀请好友相关入口。

预期：

- 海报任务跳到 AI 创作。
- 用券任务跳到券包。
- 其他任务显示成功提示。

### 路径 E：商家核销

入口：

```text
pages/merchant/verify
```

默认券码：

```text
8827639401
```

测试：

1. 输入或保留默认券码。
2. 点击「查询券详情」。
3. 修改本单金额。
4. 点击「确认核销」。

预期：

- 能看到优惠金额和应收金额。
- 核销后券状态变为已使用。

### 路径 F：商家数据

入口：

```text
pages/merchant/dashboard
```

测试：

1. 查看扫码人数、发券数量、核销数量、AI 使用人数、海报生成、入群点击。

预期：

- 今日数据正常展示。
- 入群点击指标存在。

## 4. 核心代码位置

```text
miniprogram/app.js                         启动、登录、门店与会员状态
miniprogram/app.json                       页面与 TabBar 配置
miniprogram/pages/index/                   首页、领券、一键入群入口
miniprogram/pages/group/join/              会员群引导页
miniprogram/pages/coupon/list/             券包与券码弹层
miniprogram/pages/ai-play/                 上传/输入/选择风格
miniprogram/pages/ai-result/               AI 文案候选
miniprogram/pages/poster/preview/          海报预览与 canvas 保存
miniprogram/pages/reward/                  奖励与任务
miniprogram/pages/merchant/verify/         商家核销
miniprogram/pages/merchant/dashboard/      商家数据
miniprogram/utils/api.js                   API 方法封装
miniprogram/utils/request.js               mock/HTTP 请求切换
miniprogram/utils/mock-service.js          页面内 mock 服务
miniprogram/utils/mock.js                  mock 数据
miniprogram/assets/brand/ip/               有披肩燎小星 IP 资产
```

## 5. 本地自动校验

在项目根目录运行：

```bash
npm run verify:all
```

会自动检查：

- API 契约是否完整。
- 品牌资产是否能导出。
- 小程序页面、组件、图片路径是否完整。
- 页面内 mock 业务链路是否跑通。
- HTTP mock API 是否跑通。
- Web 演示页是否能构建。

## 6. 切到本地 HTTP mock

如果你想让微信开发者工具发真实 HTTP 请求到本机 mock API：

```bash
npm run config:miniprogram:local
npm run dev:api
```

然后在微信开发者工具里重新编译小程序。

回到页面内 mock：

```bash
npm run config:miniprogram:mock
```
