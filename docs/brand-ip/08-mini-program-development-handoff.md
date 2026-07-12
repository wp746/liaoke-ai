# 08 小程序开发公司视觉实施与交接契约

> **适用对象**：用户端小程序、商家端小程序和平台后台的开发、设计、测试与项目经理
> **规范状态**：随跨端 Liquid Glass 视觉系统正式生效
> **目的**：确保开发公司能够精准复现，而不是按个人理解重新设计

## 8.1 开工前必须阅读

开发团队必须按顺序阅读并确认：

1. [`../superpowers/specs/2026-07-12-liaoke-cross-platform-liquid-glass-visual-system.md`](../superpowers/specs/2026-07-12-liaoke-cross-platform-liquid-glass-visual-system.md)
2. [`05-visual-identity-system.md`](05-visual-identity-system.md)
3. [`07-liaoxiaoxing-asset-pack.md`](07-liaoxiaoxing-asset-pack.md)
4. [`../prototype/liaoke-three-surface-prototype-guide.md`](../prototype/liaoke-three-surface-prototype-guide.md)
5. `src/prototype/components/Glass.jsx`
6. `src/prototype/styles/tokens.css`
7. `src/prototype/styles/glass.css`
8. `public/brand/ip-liaoxiaoxing/scene-library/manifest.json`

项目经理应在启动会上逐项确认，不能只把截图转发给前端。

## 8.2 唯一实施基线

- React 原型负责展示已批准的结构、状态、组件关系和动态方向。
- 正式小程序可以使用 WXML / WXSS / TypeScript 重写，但视觉 Token、组件职责、布局、状态和动效参数必须等价。
- 用户端和商家端共用同一设计 Token 包；平台后台使用同源 Web Token。
- `display/` 为运行素材，场景库根目录为高清母版。
- 不允许从旧 `product-poses/` 或网络素材中挑图替代场景库。

## 8.3 开发方应建立的共享组件

| 组件 | 小程序建议名 | 职责 |
| --- | --- | --- |
| `GlassSurface` | `lk-glass-surface` | Base / Acrylic / Lens / Solid 材质 |
| `LiquidLens` | `lk-liquid-lens` | Tab、筛选和焦点滑动层 |
| `RewardGlyph` | `lk-reward-glyph` | 券、余额、积分、AI、风险对象 |
| `SparkTrail` | `lk-spark-motion` | 轻量 CSS/WXSS 尾焰与成功反馈 |
| `LiaoxiaoxingMoment` | `lk-liaoxiaoxing-moment` | 场景角色、统一尺寸和出现条件 |
| `MotionStage` | 后续 `lk-motion-stage` | 高价值节点的 Galacean 与静态降级 |

业务页面只能组合这些组件，不得复制其内部样式后自行修改。

首批原生实现位于 `miniprogram/components/lk-*`；新增页面必须直接复用，不得另起同义组件。

## 8.4 首批样板页

开发公司不得直接并行铺开全部页面。必须先完成并通过以下样板：

1. 用户端：首页。
2. 用户端：权益中心。
3. 用户端：AI 创作。
4. 用户端：积分。
5. 用户端：我的。
6. 商家端：经营首页。
7. 商家端：核销工作台。
8. 平台后台：经营总览。
9. 平台后台：门店详情和表格。

样板通过后才能复用组件扩展其他页面，避免全量返工。

## 8.5 每页交付物

每个页面必须同时提交：

- iPhone 真机截图。
- Android 真机截图。
- 关键点击、切换、滑动和成功反馈录屏。
- 正常、加载、空、错误、禁用、成功状态截图。
- 低性能或不支持模糊时的暖白实体玻璃截图。
- 减少动态效果开启后的录屏或测试记录。
- 使用的场景 ID、Glyph kind、材质 level 和主 CTA 说明。

只提交静态设计图、开发者工具截图或单一手机型号，不进入验收。

## 8.6 页面自检表

开发方每次提测前必须勾选：

- [ ] 页面使用共享 Token，没有私有品牌色、圆角、阴影和动效常量。
- [ ] 顶部主标题、关键数字和底部导航清晰醒目。
- [ ] Hero 与下方模块、最后模块与底部导航之间有足够空隙。
- [ ] 所有容器和按钮符合圆角规则。
- [ ] 用户端业务主图标为透明立体 Glyph，不是普通扁平图标。
- [ ] 燎小星有披风、无白底、场景动作正确。
- [ ] 手机顶部燎小星位于统一 `170 × 170px` 视觉框。
- [ ] 右箭头下方暗纹不影响文字和点击。
- [ ] Press、Tab Lens、滑动和关键成功反馈已实现。
- [ ] iOS 与 Android 的布局、尺寸、层级、文案和动效一致。
- [ ] 不支持模糊时仍保留暖白实体玻璃、圆角、阴影和状态。
- [ ] 动效关闭后所有流程可用。

## 8.7 验收与付款建议

以下应列为开发合同视觉 P0：

- 共用设计系统和组件已建立，并可由代码审查确认。
- 首批样板页全部通过双方真机验收。
- 燎小星身份、透明背景、场景映射和 Hero 尺寸全部合格。
- 用户端所有关键图标完成透明立体化。
- iOS 与 Android 同页面差异仅限系统字体渲染等不可控细节。
- 低性能降级、减少动态效果和无障碍状态通过。
- 新增 CRUD 页面可证明继承同一组件和 Token。

P0 未全部通过，不应认定视觉交付完成。

## 8.8 禁止开发公司自行变更

未经书面批准，不得：

- 更换主色调。
- 把 Liquid Glass 改成普通白卡或蓝紫玻璃。
- 缩小或删除燎小星。
- 使用无披风、白底或同一动作覆盖不同场景。
- 更换底部导航数量、顺序或主入口层级。
- 删除点击、滑动和关键成功反馈。
- 为 Android 单独制作低配扁平版。
- 在平台后台大面积使用高透明玻璃。

如因技术限制确需调整，必须先提交问题、影响、替代方案和对比截图，由燎客负责人书面确认。

## 8.9 最终交付清单

- 设计 Token 源文件及三端构建产物。
- 共享组件源码和组件使用文档。
- 燎小星场景库及 manifest。
- Galacean 本地场景、加载与销毁说明。
- 全页面路由截图索引。
- iOS / Android / Web 兼容性报告。
- 性能、减少动态效果和无障碍测试报告。
- 已知偏差清单；无偏差时明确写“无”。
- 视觉验收签字表。

## 8.10 原生用户端生产基线

仓库内以下内容已作为开发公司可直接执行的首批生产基线：

- `miniprogram/app.wxss`：跨页面 `--lk-*` Token、暖白降级、Press 与减少动态效果。
- `miniprogram/assets/brand/scenes/manifest.js`：五页面场景唯一映射。
- `miniprogram/components/lk-*`：五个共享视觉组件。
- `miniprogram/pages/index/`：首页样板。
- `miniprogram/pages/coupon/`：权益样板。
- `miniprogram/pages/ai-play/`：AI 创作样板。
- `miniprogram/pages/reward/`：积分样板。
- `miniprogram/pages/me/`：我的样板。
- `tests/unit/miniprogram-visual-system.test.js`：视觉合同自动化闸口。

任何后续增删改查都必须保持该测试通过；如果业务需求确需改变视觉合同，应先修改正式规范并获得书面批准，再更新测试和实现。

## 8.11 原生商家端生产基线

首批商家端样板已经落在：

- `miniprogram/pages/merchant/verify.*`：核销工作台。
- `miniprogram/pages/merchant/dashboard.*`：今日经营首页。
- `tests/unit/miniprogram-merchant-production.test.js`：商家端视觉与状态合同。

商家端必须遵守：

- 工作表单、经营指标、记录和设置默认使用 `Solid`，聚合入口可使用低透明 `Acrylic`。
- 完整燎小星不得进入表格、表单、普通列表和连续经营操作；成功节点使用 `lk-spark-motion` 或静态 Glyph。
- 核销必须具备查询、可核销、处理中、成功、错误状态，处理中禁止重复提交。
- 经营首页必须具备加载、正常、空、错误状态，状态切换不得改变主要页面宽度与信息层级。
- 角色权限由接口和状态层决定，视觉改造不得让店员看到老板或店长专属能力。
