# 燎客 AI 小程序测试说明

## 1. 导入项目

用微信开发者工具导入仓库内的 `miniprogram/`。

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

### 路径 D：积分

入口：

```text
pages/reward/index
```

测试：

1. 查看积分、等级进度和积分好物馆。
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
- 查询时显示明确加载状态。
- 核销处理中按钮不可重复提交。
- 核销成功后显示轻量星火反馈和“继续核销下一笔”。
- 无效券码或接口失败时显示可恢复的错误状态。

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
- 加载、空数据和错误状态保持与正常态相同的页面骨架宽度。
- 经营记录和指标区不出现完整燎小星。

### 商家端视觉状态矩阵

| 页面 | 正常 | 加载/处理中 | 空 | 错误 | 禁用 | 成功 |
| --- | --- | --- | --- | --- | --- | --- |
| 核销工作台 | 券详情、优惠、本单金额、应收金额 | 查询与核销按钮显示处理中 | 未输入券码时保留工作台结构 | 无效券码或接口错误显示恢复入口 | 处理中禁止重复提交 | 星火反馈、实收金额、继续下一笔 |
| 今日经营 | 六指标、转化率、最近核销 | 固定高度加载面板 | 无指标时显示经营空态 | 显示错误原因和重新加载 | 数据加载时核销入口仍可用 | 数据更新后回到正常态 |

商家端真机检查：

1. Solid 是工作表单、指标和记录的默认材质，Acrylic 只用于工作台入口或聚合信息。
2. 不在表单、指标、记录、设置中放完整燎小星；核销成功只使用轻量星火。
3. 核销确认前必须同时看见权益、订单金额、优惠金额和顾客应付。
4. iPhone 与 Android 的输入框、金额对齐、禁用状态和按钮高度一致。
5. 开启减少动态效果后，加载圆环和成功星火静止，但查询与核销结果不变。

## 4. 五主页面视觉与状态验收

每个页面必须在 iPhone 与 Android 真机各完成一轮，截图和录屏使用同一账号、同一数据与同一页面位置。

| 页面 | 场景 ID | 正常 | 加载 | 空 | 错误 | 禁用 | 成功 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 首页 | `home` | Hero、今日权益、积分、AI 入口 | 发券按钮显示“发券中” | 无券时显示领取卡 | 发券失败 Toast | 重复提交不可触发 | 领券成功提示并出现券卡 |
| 权益 | `benefits` | 三分类和立体券 Glyph | 列表加载期间保持骨架高度 | 分类无券显示空状态 | 加载失败 Toast | 已用/过期券为 Ash 状态 | 券码弹层正常打开 |
| AI 创作 | `ai` | 图片、文本、风格工作台 | AI Cyan 上传状态 | 无图片仍可创作 | 上传失败状态可见 | 生成条件不足时不可重复提交 | 上传完成显示“AI 已就绪” |
| 积分 | `points` | 积分、等级、任务、流水 | 数据加载不跳版 | 无任务时保留空容器 | 数据错误提示 | 已完成任务为 Ash 状态 | 任务完成 Toast 或正确跳转 |
| 我的 | `profile` | 会员卡、我的服务、商家工具 | 会员数据加载不跳版 | 未登录显示登录入口 | 加载失败提示 | 无权限商家入口禁用 | 页面跳转正确 |

额外视觉检查：

1. 五个 Hero 均为 `340rpx × 340rpx` 场景框，动作不同但尺寸一致。
2. 权益券和“我的服务”箭头下的燎小星暗纹透明度在 `0.04–0.09`。
3. 关闭模糊后，所有文字、按钮与状态仍清晰可读。
4. 开启 `liaoke_reduce_motion` 后无动画，但按压、筛选与业务流程仍可用。
5. 顶部 Hero 与下方模块、末模块与 TabBar 之间保留明显间距。

## 5. 核心代码位置

```text
miniprogram/app.js                         启动、登录、门店与会员状态
miniprogram/app.json                       页面与 TabBar 配置
miniprogram/pages/index/                   首页、领券、一键入群入口
miniprogram/pages/group/join/              会员群引导页
miniprogram/pages/coupon/list/             券包与券码弹层
miniprogram/pages/ai-play/                 上传/输入/选择风格
miniprogram/pages/ai-result/               AI 文案候选
miniprogram/pages/poster/preview/          海报预览与 canvas 保存
miniprogram/pages/reward/                  积分与任务
miniprogram/pages/merchant/verify/         商家核销
miniprogram/pages/merchant/dashboard/      商家数据
miniprogram/utils/api.js                   API 方法封装
miniprogram/utils/request.js               mock/HTTP 请求切换
miniprogram/utils/mock-service.js          页面内 mock 服务
miniprogram/utils/mock.js                  mock 数据
miniprogram/assets/brand/ip/               有披肩燎小星 IP 资产
miniprogram/assets/brand/scenes/           五页面正式场景资产
```

## 6. 本地自动校验

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

## 7. 切到本地 HTTP mock

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
