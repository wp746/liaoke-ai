# 燎客 AI 三端交互原型使用与交接指南

## 1. 交付定位

本交付物是经批准用于交互评审的 React/Vite 高保真原型（the approved interactive review prototype），用来确认页面结构、业务闭环、场景状态和角色权限。它不是生产系统，不连接生产接口，也不存储真实顾客信息。

原生顾客端、商家端同步到 `miniprogram/`，是用户签字确认（user signoff）React 原型后的下一实施阶段；该同步不与本阶段混合实施。平台后台继续按 Web 应用演进。现有 `miniprogram/`、Mock API 和品牌资产验证仍保留为独立工程边界。

## 2. 本地启动与验证

在仓库根目录运行：

```bash
npm install
npm run dev
```

Vite 默认开发地址为 <http://localhost:5173/>。如果 5173 端口已被占用，以终端显示的实际地址为准，并保留下文的查询参数。

分别运行各验证命令：

```bash
npm test
npm run test:e2e
npm run verify:all
```

- `npm test`：运行 34 个 Node 单元测试，覆盖路由注册表、场景状态、权限、AI 直达状态、动效生命周期和 Spark Glass 降级合同。
- `npm run test:e2e`：启动 Playwright 配置的本地 Vite 服务并执行 146 个浏览器测试；覆盖全部 56 个路由、五条主流程、响应式、权限、动效降级、大面积玻璃层预算和稳定截图生成。
- `npm run verify:all`：依次验证 API 合同、导出品牌包、校验原生小程序、运行小程序/API 冒烟测试并构建 Vite 产物。它不替代 `npm test` 或 `npm run test:e2e`，三条命令应分别执行。

## 3. 三端架构

原型由一个共享评审外壳承载三套业务界面：

```text
Prototype Shell
├── Surface Switcher
│   ├── Customer Mini Program（顾客端）
│   ├── Merchant Mini Program（商家端）
│   └── Platform Admin（平台后台）
├── Route Registry（稳定路由 ID 与中文标题）
├── Shared Design System（Spark OS 设计系统）
├── Domain Components（券、积分、核销、会员、经营等组件）
├── Scenario State Store（可重置的演示状态）
├── Mock Data Fixtures（本地模拟数据）
└── Motion Layer（按需加载的 Galacean 与 CSS 降级）
```

路由注册表提供 56 个核心页面：

| 端 | `surface` | 路由数 | 默认路由 | 角色规则 |
|---|---|---:|---|---|
| 顾客端 | `customer` | 20 | `home` | 无角色；URL 中的 `role` 会被移除 |
| 商家端 | `merchant` | 20 | `merchant-dashboard` | 默认 `owner`；可切换 `manager`、`staff` |
| 平台后台 | `admin` | 16 | `admin-overview` | 默认 `super_admin`；`platform_admin` 为只读 |

页面下拉选项的中文标题与 `src/prototype/routeRegistry.js` 同源，避免页面目录和实际渲染脱节。无效的端、路由、场景或角色参数会被归一化为该端的有效默认值。

## 4. URL 查询参数与直达链接

| 参数 | 可用值 | 作用 |
|---|---|---|
| `surface` | `customer` / `merchant` / `admin` | 选择顾客端、商家端或平台后台 |
| `route` | 当前端注册表中的 route id | 直达指定页面或关键状态 |
| `scenario` | `new-customer` / `returning-customer` / `points-verification` | 重建新客领券、老客复访或积分礼品核销状态 |
| `role` | 商家：`owner` / `manager` / `staff`；后台：`super_admin` / `platform_admin` | 改变导航和操作权限；顾客端不使用该参数 |
| `variant` | AI 进度：`copy` / `image` / `fallback` / `rejected`；另有页面专属值 | 直达受支持的关键状态；应用会同步内部场景状态，并在交互推进时更新或移除参数 |

任务验收使用的精确相对链接如下：

```text
/?surface=customer&scenario=new-customer&route=entry-consent
/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub
/?surface=admin&role=platform_admin&route=admin-overview
/?surface=customer&scenario=returning-customer&route=ai-progress&variant=copy
/?surface=customer&scenario=returning-customer&route=ai-progress&variant=image
/?surface=customer&scenario=returning-customer&route=ai-progress&variant=fallback
/?surface=customer&scenario=returning-customer&route=ai-progress&variant=rejected
```

本地可直接点击：

- [顾客端：新客扫码与协议确认](http://localhost:5173/?surface=customer&scenario=new-customer&route=entry-consent)
- [商家端：店员执行积分礼品核销](http://localhost:5173/?surface=merchant&role=staff&scenario=points-verification&route=verify-hub)
- [平台后台：平台运营只读总览](http://localhost:5173/?surface=admin&role=platform_admin&route=admin-overview)

当前受支持的评审状态会写回地址栏，因此评审人完成切换后，可以复制 URL 复现同一端、页面、场景、角色和关键 `variant`。AI 进度直达链接刷新后会重建匹配的内部状态；继续操作时，`copy` 会推进为 `image`，进入结果或返回输入页后会移除不再适用的 `variant`，避免污染普通流程。

## 5. 使用实时检查器

页面顶部的端切换器用于切换「顾客端 / 商家端 / 平台后台」。切换后会进入该端默认路由，并按该端规则保留或归一化角色。

右侧「原型控制台 / 实时检查器」提供：

1. 「当前页面」：从当前端的全部注册路由中切换页面。
2. 「演示场景」：切换后会重新创建对应的本地模拟状态，适合重复评审流程。
3. 「演示角色」：仅在商家端和平台后台显示。商家端可选老板、店长、店员；后台可选超级管理员、平台运营（只读）。切换为店员时会直接进入 `verify-hub`。
4. 上下文摘要：显示当前 `Surface`、`Route` 和 `Scenario`，便于核对地址栏状态。

桌面宽度下检查器默认展开；窄屏下默认收起，可点击「原型控制台」展开。切换不需要刷新页面。

### 角色默认值与权限边界

- 顾客端没有角色。即使直达 URL 带有 `role=super_admin`，应用也会删除该参数。
- 商家端默认 `owner`。`owner` 可看经营并配置运营；`manager` 聚焦经营、核销、会员与记录；`staff` 只保留核销、记录和我的，并默认落到核销工作台。
- 平台后台默认 `super_admin`，可执行创建和编辑类操作。
- `platform_admin` 是跨门店只读运营角色：可以查看经营、风险、续费和任务状态，写入按钮会隐藏或禁用，直接访问写操作路由也不会获得写权限。

## 6. 评审建议

建议按以下顺序完成交互评审：

1. 新客扫码、同意协议并领取权益。
2. AI 创作、生成海报并创建推荐内容。
3. 顾客积分兑换。
4. 店员执行积分礼品核销。
5. 平台进入门店 360° 详情，并对比 `super_admin` 与只读 `platform_admin`。

所有状态都来自本地 fixture；刷新或切换场景可以重新开始评审，不会修改生产数据。

## Spark Glass visual system

The prototype uses restrained Fluent Acrylic structure with Liquid Glass reserved for interactive focus. Liaoxiaoxing contributes flame, spark, trail, soft-arc, and ash glyph language. The UI provides a solid warm-white fallback when backdrop filtering is unavailable and removes spring/trail motion under reduced-motion preferences.

三端共享同一套凝光玻璃语义，但强度按使用场景收敛：顾客端保留亲和的 IP 与奖励图形，商家端使用较低模糊的任务工作台，平台后台仅在导航和上下文层使用玻璃，表格始终保持高对比实心材质。同一视口最多两个大面积 Acrylic 层。

新增的五张 Spark Glass 视觉验收图位于：

- [`artifacts/screenshots/glass/customer-benefits.png`](../../artifacts/screenshots/glass/customer-benefits.png)
- [`artifacts/screenshots/glass/customer-benefits-phone.png`](../../artifacts/screenshots/glass/customer-benefits-phone.png)
- [`artifacts/screenshots/glass/customer-home.png`](../../artifacts/screenshots/glass/customer-home.png)
- [`artifacts/screenshots/glass/merchant-verification.png`](../../artifacts/screenshots/glass/merchant-verification.png)
- [`artifacts/screenshots/glass/admin-overview.png`](../../artifacts/screenshots/glass/admin-overview.png)

其中 `customer-benefits-phone.png` 是与[批准的权益中心方向稿](../superpowers/specs/assets/liaoke-restrained-glass-benefits.png)对应的手机主体裁切。自动验收要求两者均为竖向手机主体、宽高比差值不超过 `0.1`，并同时验证单个 Hero IP、三段选择 Lens、单一 Acrylic 券组、四类券图形及 Ash 已使用态。该门槛用于复现构图与语义一致性，不把概念图中的生成式高光当作像素级生产规范。

## 7. 交接截图

已验证的八张交接截图位于：

- [`artifacts/screenshots/prototype/customer-home.png`](../../artifacts/screenshots/prototype/customer-home.png)
- [`artifacts/screenshots/prototype/customer-benefits.png`](../../artifacts/screenshots/prototype/customer-benefits.png)
- [`artifacts/screenshots/prototype/customer-ai-poster.png`](../../artifacts/screenshots/prototype/customer-ai-poster.png)
- [`artifacts/screenshots/prototype/customer-points-store.png`](../../artifacts/screenshots/prototype/customer-points-store.png)
- [`artifacts/screenshots/prototype/merchant-dashboard.png`](../../artifacts/screenshots/prototype/merchant-dashboard.png)
- [`artifacts/screenshots/prototype/merchant-verification.png`](../../artifacts/screenshots/prototype/merchant-verification.png)
- [`artifacts/screenshots/prototype/admin-overview.png`](../../artifacts/screenshots/prototype/admin-overview.png)
- [`artifacts/screenshots/prototype/admin-store-detail.png`](../../artifacts/screenshots/prototype/admin-store-detail.png)

运行 `npm run test:e2e` 会按测试定义重新生成这些截图。

## 8. 已知的 Galacean 构建提示

Galacean Effects 仅在批准的高价值动效节点按需加载，场景资源完全本地化，组件卸载时会销毁播放器；加载失败或用户启用减少动态效果时，会降级为不阻塞业务的 CSS 星火效果。

生产构建会出现已知的 Vite chunk-size warning：独立的懒加载 Galacean chunk 超过 500 kB。该提示不会让构建失败，且 Galacean 仍在初始应用 chunk 之外；不要把它误判为 `verify:all` 失败。若后续进入生产性能优化阶段，再单独评估运行时拆分或包体策略。

## 9. 签字确认后的下一阶段

本阶段的验收对象是以上三端可交互评审原型。用户签字确认页面、流程、场景与权限后，下一阶段才执行：

- 把顾客端核心页面同步到现有 `miniprogram/` 骨架。
- 把商家端核心页面同步到现有 `miniprogram/` 骨架。
- 保持平台后台为 Web 应用并继续演进。

在签字确认前，不把 React 原型实现与原生小程序同步混在同一阶段，以便评审反馈能够先在统一原型中收敛。
