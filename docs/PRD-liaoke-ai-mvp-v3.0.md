<!--
Source: Apodex share fb2fb044, turn 43 assistant reporter.report
Fetched: 2026-07-08 Asia/Shanghai
Local note: v3.0 switches referral rewards from WeChat Pay profit sharing to delayed deduction coupons.
-->

# 燎客AI桌边私域裂变系统 MVP PRD v3.0

> **文档状态**：开发就绪 · **版本号**：v3.0-MVP · **最后更新**：2026-07-05
> **适用范围**：四人团队落地执行（创始人 + 技术合伙人 + 销售合伙人 + 运营合伙人），牛里牛气试点及前20家门店
> **开发路径**：技术合伙人主导 + AI工具辅助全部模块（**删除微信支付分账外包**，开发成本降至1–3万元量级）
> **核心变更**：老带新返利从"微信支付分账秒到账余额"改为"抵扣券形式"，无需第三方支付入驻，开发完成即可上线

---

## 第一节：版本说明与核心变更摘要

### 1.1 v3.0相对v2.0模块级变更对照表

| 模块 | v2.0状态 | v3.0变更 | 变更类型 |
|------|---------|---------|---------|
| 微信支付分账接口（服务商入驻/分账API） | 存在 | **完全删除** | `v3.0删除` |
| `retry_queue`表（分账重试队列） | 存在 | **完全删除** | `v3.0删除` |
| 分账重试定时任务（`CRON /task/referral-retry`） | 存在 | **完全删除** | `v3.0删除` |
| 错误码6001（分账比例超30%上限） | 存在 | **废弃** | `v3.0删除` |
| `orders`表`referral_reward_amount`字段 | 存在 | **删除**，改为关联`referral_coupons`表 | `v3.0修改` |
| **`referral_coupons`表** | 不存在 | **新增核心表** | `v3.0新增` |
| **接口18-A**（查询老带新抵扣券列表） | 不存在 | **新增** | `v3.0新增` |
| **接口18-B**（老带新抵扣券核销） | 不存在 | **新增** | `v3.0新增` |
| 抵扣券激活定时任务 | 不存在 | **新增** | `v3.0新增` |
| 抵扣券过期定时任务 | 不存在 | **新增** | `v3.0新增` |
| 逻辑3（老带新触发逻辑） | 微信支付分账 | **重构为发券逻辑** | `v3.0重构` |
| 商家端返现配置（`referral_reward`字段） | 金额→分账 | **改为券面值配置** | `v3.0修改` |
| 用户端模块4-B（老带新抵扣券页面） | 不存在 | **新增** | `v3.0新增` |
| 用户端券包页面 | 仅到店优惠券 | **新增老带新抵扣券分类** | `v3.0修改` |
| 用户协议 | 含余额声明 | **新增抵扣券性质声明** | `v3.0修改` |
| 错误码8001–8004 | 不存在 | **新增** | `v3.0新增` |
| 反作弊规则引擎 | 13条 | **新增每月领取上限规则** | `v3.0修改` |
| 退款追回逻辑 | 仅追回余额 | **补充追回/取消抵扣券** | `v3.0修改` |
| `store_credit_accounts`表（cashback余额） | 存在 | **保留，不受此次改动影响** | 无变化 |
| `store_credit_transactions`表 | 存在 | **保留** | 无变化 |
| `referral_relations`表 | 存在 | **保留，绑定逻辑不变** | 无变化 |
| `users`/`members`/`coupons`/`coupon_records`表 | 存在 | **保留** | 无变化 |
| `platform_admin_logs`表 | 存在 | **保留** | 无变化 |
| AI晒圈模块（通义万相异步调用） | 存在 | **保留** | 无变化 |
| 权限矩阵（5个角色） | 存在 | **保留** | 无变化 |
| 6个自动化定时任务（余额类） | 存在 | **保留，新增2个券类任务** | 小改 |

### 1.2 为什么切换到抵扣券方案

v2.0中微信支付分账是唯一不能靠加班压缩的时间节点——服务商入驻周期约2–4周，入驻审核本身1–3个工作日，但账户验证、签约、测试环境联调合计不可压缩 [1]。切换到抵扣券后，老带新返利触发变为纯数据库操作（`INSERT INTO referral_coupons`），无任何第三方接口依赖，开发完成即可上线。

| 维度 | 原微信分账方案 | v3.0抵扣券方案 |
|------|-------------|--------------|
| 上线前置条件 | 服务商入驻2–4周，不可压缩 [1] | 无，开发完成即上线 |
| 开发成本 | 分账接口外包约3–5万元 | 删除外包，AI工具辅助全部模块 |
| 合规复杂度 | 需服务商资质，分账比例30%上限 | 营销奖励券，无资金分账 [2] |
| 用户感知差异 | 余额"秒到账"数字变化 | 领到抵扣券，次日生效（T+0即时通知弥补） |
| 商家解释成本 | "分账"概念陌生 | "发张优惠券"，商家易理解 |

**消费返现余额（cashback）机制不受此次改动影响**：`store_credit_accounts`表、`store_credit_transactions`表继续保留，顾客消费后的cashback余额仍写入余额账户，只有老带新返利从"写入余额"改为"写入`referral_coupons`表"。

### 1.3 三条合规红线

以下三条合规约定必须在代码层面硬编码，不靠运营约束：

- **传销三要件**：《禁止传销条例》认定传销需同时满足缴纳入门费、拉人头计酬、团队计酬三要件 [3]。本系统零入门费、返利触发绑定核销回调而非注册事件、推荐关系只存一跳（数据库`UNIQUE(referred_id, store_id)`约束），三要件均不满足。
- **预付卡合规**：抵扣券为B消费后系统赠送给A的营销奖励，A未预先支付任何资金，不属于《单用途商业预付卡管理办法》规制的储值凭证，无需备案 [2]。`account_type=store_credit`字段硬编码，后端不提供任何提现路径。
- **PIPL数据合规**：手机号AES-256加密存储；手机号授权必须由用户主动点击`<button open-type="getPhoneNumber">`触发，不能在页面加载时自动弹出，否则小程序审核被拒 [4]；提供查询/导出/删除/撤回同意入口。

### 1.4 技术依赖清单（v3.0）

| 依赖项 | 关键约束 | v3.0变更 |
|--------|---------|---------|
| 通义万相V2 API | **必须异步调用**，HTTP请求头必须包含`X-DashScope-Async: enable`，否则直接报错；0.16元/张 [5] | 保留 |
| 通义千问Plus API | 文案生成约0.002–0.004元/次 [6] | 保留 |
| Redis | 分布式锁必须用`SET key value NX PX 3000`原子操作，禁止`SETNX`+`EXPIRE`两条命令 [7] | 保留 |
| 阿里云OSS / 腾讯云COS | 图片存储，配CDN加速 | 保留 |
| 内容安全API | AI文案违禁词过滤 + 用户上传图片审核 | 保留 |
| 微信支付分账SDK | — | **`v3.0删除`** |
| `retry_queue`表 | — | **`v3.0删除`** |

---

## 第二节：产品概述与MVP功能边界

### 2.1 一句话产品定位

- **商家视角**：用699元/月替代数十元/单的平台投流，把每桌真实到店顾客变成带新客的分享者
- **顾客视角**：消费有返现，分享朋友来消费有抵扣券，等级越高权益越好
- **平台视角**：SaaS订阅费+数据网络效应，商家使用越久迁移成本越高

### 2.2 MVP包含功能清单

- [ ] 桌边扫码进入 + 推荐关系绑定（防自我邀请/防循环/防并发）
- [ ] 燎小星欢迎弹窗 + 到店券领取（幂等控制）
- [ ] AI晒圈（通义万相V2异步调用 + 降级方案 + 专属小程序码嵌入）
- [ ] 消费返现余额账户（cashback，不可提现，30分钟有效抵扣码）
- [ ] **老带新抵扣券**（v3.0新增，T+0发券T+1生效，30天有效期）
- [ ] 会员等级与成长值（Lv1–Lv4，核销事务内同步升级）
- [ ] 我的页面（余额/券包/邀请记录/协议）
- [ ] 用户协议与隐私政策（首次进入强制确认）
- [ ] 商家端首页经营概览（6个核心指标 + 趋势图）
- [ ] 商家端核销（扫码/手动输入/余额抵扣/老带新抵扣券四种方式）
- [ ] 商家端会员管理（列表 + 360°视图）
- [ ] 商家端活动配置（4类模板）
- [ ] 商家端返现策略配置（cashback比例 + 抵扣券面值/有效期/月上限）
- [ ] 商家端员工与权限管理
- [ ] 商家端套餐与续费
- [ ] 商家端数据导出
- [ ] `platform_admin`跨商家只读后台
- [ ] 8个自动化定时任务（含2个v3.0新增券类任务）

### 2.3 明确排除功能清单（合同附件直接引用）

以下功能**不在本合同范围内**，开发方不得顺手实现后要求追加费用：

- 跨店余额（同品牌多店通用）
- 视频海报 / 动态海报
- 代运营后台（商家数据分析仪表盘的自动化运营功能）
- 多门店统一管理后台
- 积分商城 / 礼品兑换
- 外卖平台数据对接
- 微信群自动拉群
- 商家自助入驻流程
- **微信支付分账**（已由抵扣券方案替代，不在任何版本中实现）

### 2.4 角色定义与权限矩阵

**五角色定义**：

| 角色标识 | 角色名称 | 说明 |
|---------|---------|------|
| `customer` | 顾客 | 到店扫码用户，使用用户端小程序 |
| `owner` | 老板 | 门店所有者，最高权限 |
| `manager` | 店长 | 可查看数据、执行核销 |
| `staff` | 店员 | 仅可执行核销操作 |
| `platform_admin` | 平台运营 | 跨商家只读，由创始人后台直接创建，不走商家邀请码 |

**完整权限矩阵**：

| 功能模块 | customer | owner | manager | staff | platform_admin |
|---------|:-------:|:-----:|:-------:|:-----:|:--------------:|
| 用户端全部功能 | ✅ | — | — | — | — |
| 查看首页经营数据 | — | ✅ | ✅ | ❌ | ✅（只读） |
| 扫码核销/手动核销/余额核销 | — | ✅ | ✅ | ✅ | ❌ |
| 老带新抵扣券核销 | — | ✅ | ✅ | ✅ | ❌ |
| 查看会员列表/详情 | — | ✅ | ✅ | ❌ | ✅（只读） |
| 查看核销记录 | — | ✅ | ✅（仅自己） | ✅（仅自己） | ✅（只读） |
| 配置返现策略 | — | ✅ | ❌ | ❌ | ❌（返回7001） |
| 配置活动 | — | ✅ | ❌ | ❌ | ❌ |
| 添加/删除/修改员工角色 | — | ✅ | ❌ | ❌ | ❌ |
| 门店暂停营业开关 | — | ✅ | ❌ | ❌ | ❌ |
| 数据导出 | — | ✅ | ❌ | ❌ | ❌ |
| 套餐续费 | — | ✅ | ❌ | ❌ | ❌ |

**JWT token结构**：payload包含`user_id`/`store_id`/`role`/`exp`。`platform_admin`的`store_id=*`（通配）。所有商家端接口中间件三重验证：① token有效性；② role权限；③ token中`store_id`与请求参数`store_id`一致（`platform_admin`跳过归属校验，但写操作额外校验`role != platform_admin`，不满足返回7001）。所有`platform_admin`操作写入`platform_admin_logs`表审计。

---

## 第三节：用户端（小程序用户版）完整PRD

### 模块1：扫码进入与身份识别

**功能说明**：顾客扫桌牌二维码进入小程序，解析URL参数，完成身份识别和推荐关系绑定。

**完整交互逻辑**：

```
用户扫码 → 解析URL参数（store_id, table_id, ref=referrer_id）
 ↓
【首次进入判断】
 ├── 首次进入：弹出《用户协议与隐私政策》确认弹窗
 │ 用户点击"同意" → 记录 agreement_accepted_time → 继续
 │ 用户点击"不同意" → 停留协议页，无法进入任何功能
 └── 非首次进入：直接继续
 ↓
code换取openid（后端静默完成，用户无感知）
 ↓
【推荐关系判断】
 ├── 有ref参数 → 调用推荐关系绑定逻辑（见第七节逻辑1）
 │ ├── ref=自己的user_id → 忽略，不绑定（防自我邀请）
 │ ├── 已有推荐关系（首次绑定优先） → 忽略，不覆盖
 │ └── 正常绑定 → 写入 referral_relations，expire_time=NOW+30天
 └── 无ref参数 → 直接进入
 ↓
创建/更新会话（session_id=UUID，有效期24小时）
 ↓
进入首页，触发燎小星欢迎逻辑
```

**边界情况处理**：

| 场景 | 处理逻辑 |
|------|---------|
| 首次进入 | 弹出协议确认弹窗，同意后记录`agreement_accepted_time` |
| 再次进入（同日） | 不重新弹协议，直接进入 |
| 有ref参数（正常） | 后端绑定推荐关系，Redis原子锁防并发 [7] |
| ref=自己的user_id | 后端拦截，返回`SELF_REFERRAL`，不写入 |
| 推荐关系已存在 | `ON DUPLICATE KEY UPDATE`忽略，首次绑定优先 |
| 网络中断重试 | 接口幂等，重复调用返回已有状态，不重复写入 |
| store_id不存在 | 返回错误码1001，展示"门店不存在或已停用"页面 |

**字段定义表**：

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `user_id` | VARCHAR(32) | PK | 系统内部用户ID（Base62编码，8位） |
| `openid` | VARCHAR(64) | UNIQUE NOT NULL | 微信openid |
| `store_id` | VARCHAR(16) | NOT NULL | 门店ID（来自URL参数） |
| `table_id` | VARCHAR(16) | NULL | 桌台ID（仅用于统计，不影响用户维度逻辑） |
| `referrer_id` | VARCHAR(32) | NULL | 推荐人user_id（来自URL参数ref字段） |
| `entry_source` | ENUM | NOT NULL | `direct`/`referral_poster`/`referral_link` |
| `session_id` | VARCHAR(64) | NOT NULL | 当次会话ID |
| `agreement_accepted_time` | DATETIME | NULL | 用户同意协议时间（NULL=未同意，无法使用任何功能） |
| `today_verified` | BOOL | NOT NULL DEFAULT FALSE | 当日是否有核销记录（控制AI晒圈激活，从Redis读取） |

---

### 模块2：燎小星欢迎与领券

**功能说明**：燎小星在首页右下角以悬浮气泡形式弹出欢迎语，引导领取到店券。

**打扰边界规则**：
- **自动弹出条件**（同时满足）：① 本次会话内未弹出过（session维度）；② 距上次弹出超过4小时（`user_id+store_id`维度，Redis记录）；③ 用户未永久关闭燎小星（`user_preference.dismiss_lsxing=false`）
- **手动召唤**：用户点击右下角燎小星头像，任何时候均可响应
- **永久关闭**：用户点击弹窗右上角"×"，记录`dismiss_lsxing=true`，后续不再自动弹出（手动召唤仍有效）

**手机号授权时机**：用户点击"领取优惠券"按钮时触发，必须使用微信官方`<button open-type="getPhoneNumber">`组件，**不能在页面加载时自动弹出** [4]。用户拒绝授权时，以openid为唯一标识继续发券，不阻断主流程。

**幂等控制**：同一`user_id`+`store_id`+`coupon_type`+当日（北京时间自然日），只能领取1张同类型券。重复调用返回已有券信息（`is_new=false`），不创建新券。

**v3.0审核友好话术（5个场景）** [4]：

| 场景 | 审核友好话术（禁用：赚钱/奖励/收益/下线/层级/团队计酬） |
|------|------|
| 欢迎（首次） | "嗨！我是燎小星🔥 先领一张今天的到店福利，再一起玩AI晒圈吧！" |
| 领券成功 | "福利到手啦！结账时告诉店员或出示二维码就能用～" |
| 会员升级 | "惊喜！你升级啦🎉 新的专属权益已经解锁，快来看看！" |
| 老带新抵扣券发放（T+0） | "你的朋友刚刚到店消费，感谢你的分享，一张专属惊喜券已发放，明日起可用！" |
| 余额到期提醒 | "你有X元福利余额将在7天后到期，快来店里用掉吧～" |

**字段定义表**：

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `coupon_id` | VARCHAR(32) | PK | 券唯一ID |
| `coupon_type` | ENUM | NOT NULL | `checkin_discount`/`referral_reward`/`birthday`/`upgrade_gift` |
| `coupon_value` | DECIMAL(10,2) | NOT NULL | 面值（元）或折扣率（0.95=95折） |
| `min_amount` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | 使用门槛（0=无门槛） |
| `expire_time` | DATETIME | NOT NULL | 过期时间 |
| `issue_trigger` | ENUM | NOT NULL | `scan`/`referral_success`/`birthday`/`upgrade`/`activity` |

**错误处理**：今日已领取→返回已有券（`is_new=false`）；门店无活动→返回2002；手机号授权失败→跳过绑定，用openid继续。

---

### 模块3：AI晒圈功能

**功能说明**：用户上传照片+输入心情文字，AI生成带专属邀请码的海报。**激活条件**：当日在本店有核销记录（`today_verified=true`）。

**通义万相V2异步调用完整链路** [8]：

```
用户点击"生成大片"
 ↓
后端调用通义千问Plus生成文案（同步，约1–2秒）
 ↓
文案通过违禁词过滤（不通过则重新生成，最多2次；2次后仍不通过→使用预设文案）
 ↓
后端调用通义万相V2（必须包含 X-DashScope-Async: enable 头）[8]
 → 获取 async_task_id → 写入 ai_requests 表 → 返回 task_id 给前端
 ↓
前端每2秒轮询 GET /api/ai/task/{task_id}
 ├── 8秒内完成（task_status=done）：
 │ 后端合成海报（文案+背景图+专属小程序码）→ 上传OSS → 返回海报URL
 └── 超时（>8秒，async_poll_count>=4）：
 降级为纯文案海报（预设背景+文案+专属码），is_fallback=true，返回错误码3003
```

**用量限制**：每`user_id`每自然日最多3次；Redis计数器，key为`ai_count:{user_id}:{YYYYMMDD}`，TTL至次日0点。

**图片内容审核**：用户上传照片后，后端先调用内容安全API审核；审核不通过返回错误码3002，不进行AI处理。

**专属小程序码嵌入**：海报中嵌入携带`ref=user_id&store_id`参数的专属小程序码，任何人扫此码进入小程序，自动绑定推荐关系，用户无需手动操作。

**字段定义表**：

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `ai_request_id` | VARCHAR(32) | PK | 请求唯一ID（幂等键） |
| `user_id` | VARCHAR(32) | NOT NULL | 用户ID |
| `store_id` | VARCHAR(16) | NOT NULL | 门店ID |
| `input_photos` | JSON | NOT NULL | 上传照片OSS URL列表（1–3张） |
| `input_text` | VARCHAR(50) | NULL | 用户输入心情文字 |
| `style_type` | ENUM | NOT NULL | `hot`/`fresh`/`general` |
| `async_task_id` | VARCHAR(128) | NULL | **v2.0新增**：通义万相异步任务ID |
| `async_poll_count` | INT | NOT NULL DEFAULT 0 | **v2.0新增**：前端轮询次数（>=4时触发降级） |
| `task_status` | ENUM | NOT NULL DEFAULT 'pending' | `pending`/`processing`/`done`/`failed`/`fallback` |
| `generated_image_url` | VARCHAR(512) | NULL | 合成海报OSS URL |
| `referrer_qrcode_url` | VARCHAR(512) | NULL | 专属小程序码OSS URL |
| `is_fallback` | TINYINT(1) | NOT NULL DEFAULT 0 | 是否使用降级方案（纯文案海报） |
| `image_audit_result` | ENUM | NOT NULL DEFAULT 'pending' | `pending`/`pass`/`reject`/`review` |
| `ai_cost_yuan` | DECIMAL(10,4) | NULL | 本次AI调用成本（元，用于成本统计） |
| `expire_at` | DATETIME | NOT NULL | OSS文件过期时间（30天后删除） |
| `create_time` | DATETIME | NOT NULL | 创建时间 |

**错误处理**：

| 场景 | 错误码 | 前端文案 |
|------|--------|---------|
| 今日次数已用完（Redis计数≥3） | 3001 | 今日次数已用完，明天再来 |
| 图片审核不通过 | 3002 | 照片不符合要求，请更换 |
| 通义万相超时降级 | 3003 | 已为您生成文案版海报 |
| 通义万相API返回错误（非超时） | 3004 | 图片生成失败，已为您生成文案版海报 |

---

### 模块4：燎客余额账户（消费返现，cashback机制不变）

**功能说明**：展示消费返现余额（cashback），支持结账时出示抵扣码。**此模块仅覆盖消费返现余额；老带新返利已改为抵扣券，见模块4-B。**

**余额展示页**：大字显示可用余额；红色标注14天内即将到期金额；余额明细按时间倒序列出（来源类型+金额+时间+关联订单后4位）。

**抵扣码生成**：点击"结账时使用"→生成8位短码，有效期30分钟（展示倒计时）；到期前5分钟提示"即将过期"并提供一键刷新；同一用户同一时刻只能有一个有效抵扣码，生成新码时旧码自动失效。

**单笔抵扣上限**：不超过本单消费金额的30% [9]，前端展示时自动计算上限。

**退款追回逻辑**：退款确认后，系统在同一事务中执行：未使用的余额直接从账户扣减（乐观锁）；已使用的余额在对应流水记录上写入`refund_clawback_pending=true`，下次该用户核销时优先抵扣。`refund_clawback_pending=true`超过180天未追回，自动标记`clawback_expired`，商家承担损失（合同兜底条款）。

**暂停营业期间余额顺延**：门店`is_paused=true`时，所有未到期余额流水标记`pause_pending=true`，有效期不计入暂停天数；恢复营业时批量顺延`expire_time`并推送"余额有效期已顺延"通知。

**字段定义表（`store_credit_accounts`）**：

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `balance_id` | VARCHAR(32) | PK | 余额账户ID（每个user_id+store_id唯一） |
| `account_type` | ENUM | NOT NULL DEFAULT 'store_credit' | 固定值，不可改，不开放提现接口 |
| `available_amount` | DECIMAL(10,2) | NOT NULL CHECK(>=0) | 当前可用余额（不可为负） |
| `expiring_amount` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | 14天内即将到期的余额 |
| `total_earned` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | 历史累计获得 |
| `total_used` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | 历史累计使用 |
| `deduction_code` | VARCHAR(16) | NULL | 当前有效抵扣码（8位短码） |
| `deduction_code_expire` | DATETIME | NULL | 抵扣码过期时间 |
| `version` | INT | NOT NULL DEFAULT 0 | 乐观锁版本号 |

**字段定义表（`store_credit_transactions`，含v2.0补充字段）**：

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `tx_id` | VARCHAR(32) | PK | 流水唯一ID |
| `balance_id` | VARCHAR(32) | NOT NULL FK | 关联余额账户ID |
| `tx_type` | ENUM | NOT NULL | `cashback`/`deduction`/`expired`/`refund_clawback` |
| `amount` | DECIMAL(10,2) | NOT NULL | 金额（正数=入账，负数=出账） |
| `balance_before` | DECIMAL(10,2) | NOT NULL | 交易前余额（用于对账） |
| `balance_after` | DECIMAL(10,2) | NOT NULL | 交易后余额（用于对账） |
| `order_id` | VARCHAR(32) | NULL | 关联订单ID |
| `cashback_rate_at_issue` | DECIMAL(5,4) | NULL | 发放时返现比例（退款追回计算用） |
| `expire_time` | DATETIME | NULL | 本笔余额过期时间（入账时设置，180天） |
| `refund_clawback_pending` | BOOL | NOT NULL DEFAULT FALSE | 是否有待追回金额 |
| `clawback_order_id` | VARCHAR(32) | NULL | 触发追回的退款订单ID |
| `pause_pending` | BOOL | NOT NULL DEFAULT FALSE | 是否在门店暂停期间待顺延 |
| `create_time` | DATETIME | NOT NULL | 交易时间 |

---

### 模块4-B（v3.0新增）：老带新抵扣券

**功能说明**：A推荐B进店首次消费后，系统向A发放一张抵扣券，A下次到店可用于消费抵扣。这是v3.0替代微信支付分账的核心新模块。

**券的完整生命周期**：

```
B核销完成（首次消费）
 ↓
T+0：系统写入 referral_coupons 表，status=pending
 effective_time = B核销完成时间 + 24小时
 expire_time = effective_time + 有效期天数（商家配置，默认30天）
 ↓
T+0即时：燎小星推送通知给A：
 "你的朋友刚刚到店消费，感谢你的分享，一张专属惊喜券已发放，明日起可用！"
 ↓
T+24小时：定时任务扫描 status=pending AND effective_time <= NOW
 批量更新 status=active
 ↓
T+24小时：燎小星二次推送通知给A：
 "你的10元惊喜券今日起可用了，快来店里用！"
 ↓
A到店出示券码（在用户端"我的券包→老带新抵扣券"中展示二维码）
 ↓
店员扫码核销（接口18-B）→ 验证状态/使用条件/门店归属
 ↓
核销成功：status=used，写入 used_order_id
 ↓
过期未用：定时任务每天凌晨1:00扫描 status=active AND expire_time < NOW
 批量更新 status=expired
```

**面值设计**：MVP阶段固定面值，默认10元，商家可在后台配置5–20元区间 [10]。低于5元用户感知不到，高于20元超过中小餐饮净利率8%–12%的可承受空间 [10]。梯度面值（按B消费金额区间）作为第2个月A/B测试方向，不在MVP中实现。

**使用条件**：满30元可用；每单限用1张；不可提现；不可转让；有效期内未使用则过期作废。

**每人每月领取上限**：商家可配置（默认10张/人/月），防刷量。Redis计数器：`referral_coupon_count:{referrer_id}:{store_id}:{YYYYMM}`，超限时静默处理（不发券不报错），记录日志。

**燎小星通知设计**：
- T+0即时通知（B核销完成后30秒内发出）：让A感受到"朋友刚消费，我马上知道"的即时感
- 次日生效时二次推送：制造第二次触达，提醒A来店使用
- 到期前7/3/1天分别推送提醒（复用余额到期提醒任务逻辑）

**券包页面展示**：四个分组Tab——待生效/可使用/已使用/已过期。每张券展示：面值、适用门店、生效时间（待生效状态）或到期时间（可使用状态）、使用条件（满30元可用）。

**字段定义表（`referral_coupons`，v3.0新增核心表）**：

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `coupon_id` | VARCHAR(32) | PK | 券唯一ID |
| `referrer_id` | VARCHAR(32) | NOT NULL FK→users | A（领券人，推荐人） |
| `referred_id` | VARCHAR(32) | NOT NULL FK→users | B（触发人，被推荐人） |
| `store_id` | VARCHAR(16) | NOT NULL FK→stores | 门店ID（券只能在本门店使用） |
| `face_value` | DECIMAL(10,2) | NOT NULL | 券面值（元），从stores.referral_coupon_value读取 |
| `min_order_amount` | DECIMAL(10,2) | NOT NULL DEFAULT 30.00 | 最低使用金额（满30元可用） |
| `effective_time` | DATETIME | NOT NULL | 生效时间（B核销时间+24小时） |
| `expire_time` | DATETIME | NOT NULL | 过期时间（effective_time+有效期天数） |
| `status` | ENUM | NOT NULL DEFAULT 'pending' | `pending`/`active`/`used`/`expired`/`cancelled` |
| `trigger_order_id` | VARCHAR(32) | NOT NULL | 触发该券的B的订单ID |
| `used_order_id` | VARCHAR(32) | NULL | A使用该券的订单ID（核销后写入） |
| `cancel_reason` | VARCHAR(64) | NULL | 取消原因（如`refund`） |
| `created_at` | DATETIME | NOT NULL | 创建时间 |

**关键索引**：
- `INDEX idx_referrer_store_status (referrer_id, store_id, status)`（用户查询我的券包）
- `INDEX idx_status_effective (status, effective_time)`（激活定时任务扫描）
- `INDEX idx_status_expire (status, expire_time)`（过期定时任务扫描）
- `INDEX idx_trigger_order (trigger_order_id)`（退款时查找对应券）

**错误处理**：

| 场景 | 错误码 | 前端文案 |
|------|--------|---------|
| 券不存在或已过期 | 8001 | 该券不存在或已过期 |
| 未满最低消费金额 | 8002 | 消费满30元才可使用此券 |
| 券不属于本门店 | 8003 | 该券不适用于本门店 |
| 券尚未生效（status=pending） | 8004 | 该券明日起生效，请明天再来使用 |

---

### 模块5：会员等级与成长值

**功能说明**：展示当前等级、成长值进度条、已解锁权益列表。升级触发**必须在核销事务内同步执行**（同一数据库事务），异步推送通知。

**等级体系**：

| 等级 | 升级阈值 | 核心权益 | 活跃度门槛 |
|------|---------|---------|---------|
| Lv1 普通会员 | 注册即得 | 入群见面礼券、生日券 | 无 |
| Lv2 熟客 | 500成长值 | 工作日（周一至周四）95折 | 无 |
| Lv3 铁杆 | 2000成长值 | 全时段9折 + 新品试吃优先报名 | 无 |
| Lv4 黑金 | 5000成长值 | 全时段85折 + 每月赠招牌菜 + 优先订座 | 当月至少1次核销记录 |

**成长值来源**：

| 行为 | 成长值增量 | 触发时机 |
|------|---------|---------|
| 消费 | 消费金额取整（1元=1成长值） | 核销成功，同一事务 |
| 到店核销 | +50 | 核销成功，同一事务（与消费成长值叠加） |
| 成功邀请新客首次消费 | +200 | 新客首次核销成功后（逻辑3-NEW中触发） |
| AI晒圈带来新客核销 | +100（叠加+200，合计+300） | 新客首次核销且`entry_source=referral_poster` |

**降级规则**：等级只升不降，成长值永久有效。Lv4黑金每月赠菜权益需当月有消费记录才激活（折扣权益无活跃度门槛）。

**字段定义表**：

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `member_id` | VARCHAR(64) | PK | 会员ID（user_id+"_"+store_id） |
| `current_level` | ENUM | NOT NULL DEFAULT 'lv1' | `lv1`/`lv2`/`lv3`/`lv4` |
| `growth_value` | INT | NOT NULL DEFAULT 0 | 成长值（只增不减） |
| `next_level_threshold` | INT | NULL | 下一等级所需总成长值（lv4时为NULL） |
| `pending_upgrade` | TINYINT(1) | NOT NULL DEFAULT 0 | 是否有待展示的升级动画（下次打开小程序时触发） |
| `last_visit_date` | DATE | NULL | 最近到店日期 |
| `total_visit_count` | INT | NOT NULL DEFAULT 0 | 累计到店次数 |
| `total_spend_amount` | DECIMAL(12,2) | NOT NULL DEFAULT 0 | 累计消费金额 |

---

### 模块6：我的页面

**功能说明**：个人信息汇总页，包含余额、券包、邀请记录、用户协议入口。

**页面内容清单**：头像+昵称+当前等级徽章；成长值进度条（当前值/下一等级阈值）；快捷入口（我的余额→模块4、我的券包→模块4-B、我的邀请）；用户协议/隐私政策/注销账户。

**v3.0变化——我的券包**：现在包含两类券，需要在UI上区分展示：
- **到店优惠券**（原有）：商家发放的活动券、生日券、升级礼券等
- **老带新抵扣券**（v3.0新增）：通过推荐新客获得的抵扣券，展示面值、生效状态、到期时间

两类券在同一"我的券包"页面内通过Tab或分区区分，不合并展示，避免用户混淆使用条件。

---

### 模块7：用户协议与隐私政策

**功能说明**：首次进入强制展示确认弹窗，"我的"页面提供随时查阅入口，提供数据导出和账户注销功能。

**必须包含的条款**：

1. **余额性质声明**：燎客余额为消费后赠送的营销奖励积分，不可提现，不可转让，有效期180天，到期自动清零
2. **v3.0新增——抵扣券性质声明**：老带新抵扣券为消费奖励，非预存资金，不可提现，不可转让，有效期XX天（以券面展示为准），过期作废 [2]
3. **老带新规则说明**：一级分销，仅直接推荐人获得奖励，推荐关系绑定30天有效期，新客首次消费核销后触发
4. **退款追回条款**：退款时已发放的消费返现余额和老带新抵扣券将被追回或取消
5. **门店停业说明**：余额和抵扣券为门店营销权益，门店停业时平台协助协调但不承担兑付责任
6. **数据权利**：用户可申请查询、导出、删除个人数据，5个工作日内处理

---

## 第四节：商家端（小程序商家版）完整PRD

### 模块1：登录与权限验证

**JWT token结构**：payload包含`user_id`/`store_id`/`role`/`exp`（有效期2小时，refresh token 7天，无感知刷新）。

**中间件三重验证**（所有商家端接口必须经过）：① JWT签名有效且未过期→否则返回401；② role有权限访问该接口→否则返回403；③ token中`store_id`与请求参数`store_id`一致→否则返回403。

**`platform_admin`登录流程**：创始人在后台管理界面直接创建账号，绑定运营合伙人微信openid，`store_id=*`，不走商家邀请码流程。所有`platform_admin`操作写入`platform_admin_logs`表。

---

### 模块2：首页经营概览

**今日数据卡片（6个核心指标）**：

| 字段名 | 说明 |
|-------|------|
| `today_scan_count` | 今日扫码进入的独立用户数 |
| `today_coupon_claim_count` | 今日成功领取到店券的用户数 |
| `today_new_member_count` | 今日首次进入本店的用户数 |
| `today_ai_share_user_count` | 今日至少生成1次AI海报的用户数 |
| `today_referral_order_count` | 今日老带新核销订单数 |
| `today_estimated_extra_sales` | 预估新增营业额（`today_referral_order_count × avg_customer_price`，示意性测算） |

**趋势图**：近7天/近30天切换，展示扫码人数和老带新订单数两条折线。

**门店暂停营业开关**：老板可切换暂停/恢复状态，填写预计恢复日期；暂停期间首页展示"暂停营业中，余额有效期已自动顺延"；暂停期间不可执行任何核销（返回7003）。

**燎小星经营提醒**：每日最多1条，示例："本月有3位铁杆会员生日，发张生日券试试"，点击可跳转对应操作页面。

---

### 模块3：核销功能

**四种核销方式**（v3.0新增第四种）：

1. **扫码核销**：调起扫一扫，扫顾客展示的到店优惠券码
2. **手动输入**：输入8位短码，适用于扫码不便场景
3. **余额抵扣核销**：扫顾客展示的余额抵扣码，验证余额并扣减
4. **老带新抵扣券核销（v3.0新增）**：扫顾客展示的老带新抵扣券码，验证券状态/使用条件/门店归属

**核销公共约束**：
- 所有核销记录必须关联`verifier_id`（从JWT token获取，不允许为空）
- 核销员工openid不能等于被核销顾客openid（防止自我核销，返回5006）
- 门店`is_paused=true`时，所有核销接口返回7003

**超时处理**：接口超时（>5秒）时，前端自动调用`GET /api/store/verify/status?order_id=xxx`查询核销状态；若已核销显示"核销成功（已完成）"；若未核销提供"重新核销"按钮。所有核销接口幂等：同一券码只能核销一次，重复调用返回5002（已核销）。

---

### 模块4：会员管理

**会员列表**：支持筛选（等级/最近到店/老带新数）、关键字搜索（手机后4位或昵称）、排序（最近到店/累计消费/老带新次数）。

**会员360°视图**：基本信息（昵称/手机脱敏/入会时间/等级/成长值）、消费记录（最近10条）、AI晒圈记录（累计次数/最近时间）、券包（当前可用券）、等级进度（成长值进度条）。

**v3.0变化——老带新记录**：展示"发放的老带新抵扣券"列表，字段包含：被推荐人昵称（脱敏）、触发时间（B的首次消费时间）、券面值、券状态（待生效/可使用/已使用/已过期/已取消）。不再展示"发放的余额金额"。

---

### 模块5：活动配置

**4类活动模板**：

| 模板 | 配置项 | 说明 |
|-----|------|------|
| 老带新奖励（常驻） | 抵扣券面值/有效期/每月上限 | 核心裂变机制，建议长期开启 |
| 生日礼 | 提前发送天数（3/5/7天）、礼品类型/金额 | 系统自动在会员生日前发送 |
| 工作日福利 | 有效日期（周一至周四）、折扣力度/菜品 | 填淡谷，提升工作日客流 |
| 晒圈送券 | 用户发圈后截图核销、奖励券面值 | 激励AI晒圈参与率 |

活动发布后，燎小星话术模板自动更新（存数据库，无需发版）。

---

### 模块6：返现策略配置（v3.0重构）

**配置项（v3.0变更）**：

| 配置项 | 类型 | 范围 | v3.0变更 | 写入字段 |
|-------|-----|------|---------|---------|
| 消费返现比例 | 滑动条 | 3%–15% | 无变化 | `stores.cashback_rate` |
| **老带新抵扣券面值** | 输入框（元） | 5–20元 | `v3.0修改`（原为分账金额） | `stores.referral_coupon_value` |
| **抵扣券有效期** | 下拉选择 | 30/45/60天 | `v3.0新增` | `stores.referral_coupon_valid_days` |
| **每人每月领取上限** | 输入框（张） | 1–20张，默认10 | `v3.0新增` | `stores.referral_coupon_monthly_limit` |
| 新客首单优惠券面值 | 输入框（元） | 0–30元 | 无变化 | `stores.new_customer_reward` |
| 成本预警阈值 | 输入框（%） | 默认12% | 无变化 | `stores.monthly_cost_alert` |

**v3.0删除**：原分账比例30%校验（`cashback_rate + referral_reward/avg_customer_price ≤ 0.30`）——分账接口已删除，此校验废弃。

**保留**：成本预警——基于本月已核销金额，预估当月总返现成本（cashback实际支出 + 抵扣券预计核销成本，按60%核销率估算）；超过`monthly_cost_alert`阈值时显示黄色警告。

---

### 模块7–9：员工管理/套餐续费/数据导出

**无变化**，保留v2.0全部内容（员工软删除、套餐到期30/90天数据保留策略、Excel异步导出）。

---

## 第五节：数据库表结构设计（v3.0完整版）

### 表1：`users`（无变化）

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `user_id` | VARCHAR(32) | PK | 系统内部用户ID（Base62编码，8位） |
| `openid` | VARCHAR(64) | UNIQUE NOT NULL | 微信openid |
| `phone_encrypted` | VARCHAR(256) | NULL | 手机号（AES-256加密存储） |
| `phone_masked` | VARCHAR(20) | NULL | 手机号脱敏展示（如138\*\*\*\*1234） |
| `nickname` | VARCHAR(64) | NULL | 微信昵称 |
| `avatar_url` | VARCHAR(512) | NULL | 头像URL |
| `agreement_accepted_time` | DATETIME | NULL | 同意用户协议时间 |
| `created_at` | DATETIME | NOT NULL | 创建时间 |
| `updated_at` | DATETIME | NOT NULL | 更新时间 |

---

### 表2：`stores`（v3.0新增3个字段，删除分账相关字段）

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `store_id` | VARCHAR(16) | PK | 门店ID（Base62编码，6位） |
| `store_name` | VARCHAR(128) | NOT NULL | 门店名称 |
| `store_type` | ENUM | NOT NULL | `hotpot`/`bbq`/`cafe`/`casual`/`other` |
| `ai_tag_name` | VARCHAR(64) | NOT NULL | 桌牌IP名（如"AI肉小签"） |
| `avg_customer_price` | DECIMAL(10,2) | NOT NULL | 人均客单价（元） |
| `cashback_rate` | DECIMAL(5,4) | NOT NULL DEFAULT 0.08 | 当前消费返现比例 |
| `referral_coupon_value` | DECIMAL(10,2) | NOT NULL DEFAULT 10.00 | **v3.0新增**：老带新抵扣券面值（元，5–20元） |
| `referral_coupon_valid_days` | INT | NOT NULL DEFAULT 30 | **v3.0新增**：抵扣券有效期（天，30/45/60） |
| `referral_coupon_monthly_limit` | INT | NOT NULL DEFAULT 10 | **v3.0新增**：每人每月领取上限（张） |
| `new_customer_reward` | DECIMAL(10,2) | NOT NULL DEFAULT 10.00 | 新客首单优惠券面值（元） |
| `monthly_cost_alert` | DECIMAL(5,4) | NOT NULL DEFAULT 0.12 | 成本预警阈值 |
| `is_active` | TINYINT(1) | NOT NULL DEFAULT 1 | 是否启用 |
| `package_type` | ENUM | NOT NULL | `standard`/`pro`/`enterprise` |
| `package_expire_at` | DATETIME | NOT NULL | 套餐到期时间 |
| `is_paused` | TINYINT(1) | NOT NULL DEFAULT 0 | 是否暂停营业 |
| `pause_resume_at` | DATETIME | NULL | 预计恢复营业时间 |
| `pause_start_at` | DATETIME | NULL | 暂停开始时间（余额顺延计算用） |
| `created_at` | DATETIME | NOT NULL | 创建时间 |

**v3.0删除**：原`referral_reward`字段（老带新分账金额）——已由`referral_coupon_value`替代。

---

### 表3–5：`members`/`coupons`/`coupon_records`（无变化）

表结构与v2.0完全一致，不重复列出。关键索引：`members`表`UNIQUE INDEX uk_user_store (user_id, store_id)`；`coupon_records`表`UNIQUE INDEX uk_user_store_type_date (user_id, store_id, coupon_type, DATE(created_at))`。

---

### 表6–7：`store_credit_accounts`/`store_credit_transactions`（无变化，见模块4字段定义）

cashback机制不受v3.0改动影响，两表完整保留。

---

### 表8：`referral_relations`（无变化）

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `referral_id` | VARCHAR(32) | PK | 推荐关系ID |
| `referrer_id` | VARCHAR(32) | NOT NULL FK→users | 推荐人user_id |
| `referred_id` | VARCHAR(32) | NOT NULL FK→users | 被推荐人user_id |
| `store_id` | VARCHAR(16) | NOT NULL FK→stores | 门店ID |
| `entry_source` | ENUM | NOT NULL | `referral_poster`/`referral_link` |
| `bind_time` | DATETIME | NOT NULL | 绑定时间 |
| `expire_time` | DATETIME | NOT NULL | 推荐关系过期时间（bind_time+30天） |
| `status` | ENUM | NOT NULL DEFAULT 'active' | `active`/`expired`/`consumed` |
| `first_order_id` | VARCHAR(32) | NULL | 触发返利的首单ID（consumed后写入） |
| `reward_amount` | DECIMAL(10,2) | NULL | **v3.0含义变更**：实际发放的抵扣券面值（原为分账金额） |
| `reward_paid_at` | DATETIME | NULL | 券发放时间（原为分账到账时间） |
| `created_at` | DATETIME | NOT NULL | 创建时间 |

**关键索引**：`UNIQUE INDEX uk_referred_store (referred_id, store_id)`；`INDEX idx_status_expire (status, expire_time)`。

---

### 表9：`orders`（v3.0修改）

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `order_id` | VARCHAR(32) | PK | 订单ID |
| `user_id` | VARCHAR(32) | NOT NULL FK→users | 顾客用户ID |
| `store_id` | VARCHAR(16) | NOT NULL FK→stores | 门店ID |
| `verifier_id` | VARCHAR(32) | NOT NULL FK→employees | 核销员工ID（必填，不允许为空） |
| `verify_type` | ENUM | NOT NULL | `coupon_scan`/`coupon_manual`/`balance_deduction`/`referral_coupon` |
| `coupon_id` | VARCHAR(32) | NULL | 核销的到店优惠券ID |
| `referral_coupon_id` | VARCHAR(32) | NULL | **v3.0新增**：核销的老带新抵扣券ID（关联referral_coupons表） |
| `order_amount` | DECIMAL(10,2) | NOT NULL | 本单消费金额 |
| `cashback_amount` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | 本单返现金额 |
| `deduction_amount` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | 本单余额抵扣金额 |
| `referral_coupon_deduction` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | **v3.0新增**：本单老带新抵扣券抵扣金额 |
| `cashback_rate_snapshot` | DECIMAL(5,4) | NOT NULL | 核销时的返现比例快照 |
| `is_refunded` | TINYINT(1) | NOT NULL DEFAULT 0 | 是否已退款 |
| `refunded_at` | DATETIME | NULL | 退款时间 |
| `status` | ENUM | NOT NULL DEFAULT 'completed' | `completed`/`refunded`/`suspicious` |
| `created_at` | DATETIME | NOT NULL | 核销时间 |

**v3.0删除**：原`referral_reward_amount`字段（老带新分账金额）——改为关联`referral_coupons`表通过`referral_coupon_id`查询。

---

### 表10：`ai_requests`（无变化，含v2.0新增字段）

含`async_task_id`和`async_poll_count`字段，见第三节模块3字段定义表。

---

### 表11：`referral_coupons`（v3.0新增核心表）

见第三节模块4-B字段定义表。

**关键索引**（重申）：
```sql
INDEX idx_referrer_store_status (referrer_id, store_id, status)
INDEX idx_status_effective (status, effective_time)
INDEX idx_status_expire (status, expire_time)
INDEX idx_trigger_order (trigger_order_id)
UNIQUE INDEX uk_trigger_order (trigger_order_id) -- 同一B的首单只能发一张券，防重复
```

---

### 表12：`platform_admin_logs`（无变化）

| 字段名 | 类型 | 约束 | 说明 |
|-------|-----|------|------|
| `log_id` | VARCHAR(32) | PK | 日志ID |
| `admin_id` | VARCHAR(32) | NOT NULL | platform_admin的user_id |
| `store_id` | VARCHAR(16) | NOT NULL | 被访问的门店ID |
| `operation_type` | VARCHAR(64) | NOT NULL | 操作类型（如`view_dashboard`） |
| `request_path` | VARCHAR(256) | NOT NULL | 请求路径 |
| `operated_at` | DATETIME | NOT NULL | 操作时间 |

**v3.0删除**：`retry_queue`表（分账重试队列，随分账接口一起删除）。

---

## 第六节：核心API接口设计（v3.0完整版）

### 全局约定

- 所有接口使用HTTPS
- 请求头携带：`Authorization: Bearer {JWT_TOKEN}`
- 响应格式：`{"code": 0, "msg": "success", "data": {...}}`
- 时间格式：ISO 8601（`2026-07-05T12:30:00+08:00`）
- 写操作接口请求头携带`Idempotency-Key`，后端校验幂等

---

### 保留接口（v2.0已有，v3.0无变化或小改）

**接口1**：`POST /api/user/entry` — 扫码进入，推荐关系绑定（无变化）

**接口2**：`POST /api/user/coupon/claim` — 领取到店券（幂等）（无变化）

**接口3**：`POST /api/ai/generate` — AI晒圈提交异步任务（无变化）

**接口3-轮询**：`GET /api/ai/task/{ai_request_id}` — 查询AI任务状态（无变化）

**接口4**：`GET /api/user/balance` — 查询cashback余额账户（无变化）

**接口5**：`POST /api/user/balance/deduction-code` — 生成余额抵扣码（无变化）

**接口6**：`GET /api/user/member` — 查询会员等级与成长值（无变化）

**接口7**：`GET /api/user/referrals` — 查询我的邀请记录（无变化）

**接口8**：`GET /api/store/dashboard` — 首页经营概览数据（无变化）

**接口9**：`POST /api/store/verify/scan` — 扫码核销（**v3.0小改**：核销成功后触发发券逻辑，而非分账逻辑）

**接口10**：`POST /api/store/verify/manual` — 手动输入核销（**v3.0小改**：同接口9）

**接口11**：`POST /api/store/verify/balance` — 余额抵扣核销（无变化）

**接口12**：`GET /api/store/members` — 会员列表（无变化）

**接口13**：`PUT /api/store/cashback-config` — 更新返现策略配置（**v3.0修改**：删除分账比例30%校验，新增`referral_coupon_value`/`referral_coupon_valid_days`/`referral_coupon_monthly_limit`三个参数）

**接口15**：`GET /api/platform/stores/{store_id}/dashboard` — platform_admin跨商家数据（无变化）

**接口16**：`POST /api/store/refund` — 退款处理（**v3.0补充**：退款时检查并取消对应`referral_coupons`记录，见逻辑5）

**接口17**：`PUT /api/store/pause` — 门店暂停/恢复营业（无变化）

---

### v3.0新增接口

**接口18-A（v3.0新增）**：`GET /api/user/referral-coupons`

**功能**：查询我的老带新抵扣券列表，按状态分组展示。

**请求参数**：`store_id`（Query参数）

**响应结构**：

```json
{
 "code": 0,
 "data": {
 "pending": [
 {
 "coupon_id": "RC_XXXXXXXX",
 "face_value": 10.00,
 "effective_time": "2026-07-06T18:30:00+08:00",
 "expire_time": "2026-08-05T18:30:00+08:00",
 "trigger_nickname": "微信用户***",
 "status": "pending"
 }
 ],
 "active": [...],
 "used": [...],
 "expired": [...]
 }
}
```

**说明**：`trigger_nickname`为B（被推荐人）的脱敏昵称，让A知道是哪位朋友触发了这张券。

---

**接口18-B（v3.0新增）**：`POST /api/store/verify/referral-coupon`

**功能**：老带新抵扣券核销。顾客出示券码，店员扫码，系统验证券状态和使用条件，核销成功后status=used。

**请求参数**：

```json
{
 "store_id": "门店ID",
 "coupon_id": "RC_XXXXXXXX",
 "order_amount": 80.00,
 "verifier_id": "员工ID（从JWT token获取）"
}
```

**执行逻辑**：

```
1. 验证 coupon_id 存在 → 否则返回 8001
2. 验证 status=active → pending 返回 8004；used/expired 返回 8001
3. 验证 store_id 归属（coupon.store_id == 请求 store_id）→ 否则返回 8003
4. 验证 order_amount >= min_order_amount（30元）→ 否则返回 8002
5. 验证 verifier_id 不等于 coupon.referrer_id 对应的 openid → 否则返回 5006
6. 同一事务：
 UPDATE referral_coupons SET status='used', used_order_id=新订单ID WHERE coupon_id=?
 INSERT INTO orders（verify_type='referral_coupon', referral_coupon_id=coupon_id,
 referral_coupon_deduction=face_value）
7. 返回核销成功信息
```

**响应结构**：

```json
{
 "code": 0,
 "data": {
 "order_id": "订单ID",
 "deducted_amount": 10.00,
 "member_nickname": "微信用户***",
 "member_level": "lv2"
 }
}
```

**错误码**：8001/8002/8003/8004/5006（含义见第八节）

---

### v3.0删除接口

**原接口14**（`CRON /task/referral-retry`分账重试定时任务）——随分账接口一起删除，不再实现。

---

### 定时任务接口（v3.0更新版）

**保留任务**：

| 任务 | 执行频率 | 无变化 |
|------|---------|------|
| 余额到期提醒 | 每天凌晨2:00 | 保留 |
| 商家数据周报 | 每周一凌晨2:00 | 保留 |
| 日度对账 | 每天凌晨3:00 | 保留 |
| 推荐关系过期 | 每天凌晨1:00 | 保留 |
| 套餐到期提醒 | 每天凌晨9:00 | 保留 |

**v3.0新增任务**：

**`CRON /task/referral-coupon-activate`（v3.0新增）**：

- **执行频率**：每小时
- **触发条件**：`status='pending' AND effective_time <= NOW`
- **核心SQL**：
```sql
UPDATE referral_coupons
SET status = 'active'
WHERE status = 'pending' AND effective_time <= NOW;
```
- **执行后**：对每张刚激活的券，异步推送燎小星"券已生效"服务通知给`referrer_id`对应用户
- **失败处理**：通知失败标记`notify_failed`，运营合伙人次日处理；SQL更新失败重试1次，仍失败写入告警日志

**`CRON /task/referral-coupon-expire`（v3.0新增）**：

- **执行频率**：每天凌晨1:00
- **触发条件**：`status='active' AND expire_time < NOW`
- **核心SQL**：
```sql
UPDATE referral_coupons
SET status = 'expired'
WHERE status = 'active' AND expire_time < NOW;
```
- **失败处理**：任务失败重试1次，仍失败写入告警日志，不影响主流程

---

## 第七节：后台核心业务逻辑（v3.0完整版）

### 逻辑1：推荐关系绑定（无变化）

```python
def bind_referral(referred_id, referrer_id, store_id):
 # 防自我邀请
 if referrer_id == referred_id:
 return {"success": False, "reason": "SELF_REFERRAL"}
 
 # 首次绑定优先
 existing = query(
 "SELECT * FROM referral_relations WHERE referred_id=? AND store_id=?",
 referred_id, store_id
 )
 if existing:
 return {"success": False, "reason": "ALREADY_BOUND"}
 
 # 防循环邀请
 reverse = query(
 "SELECT * FROM referral_relations WHERE referrer_id=? AND referred_id=? AND store_id=?",
 referred_id, referrer_id, store_id
 )
 if reverse:
 return {"success": False, "reason": "CIRCULAR_REFERRAL"}
 
 # 加分布式锁（原子操作，防并发写入）[7]
 lock_key = f"referral_lock:{referred_id}:{store_id}"
 lock = redis.SET(lock_key, "1", NX=True, PX=3000) # 原子操作，3秒超时
 if not lock:
 return {"success": False, "reason": "CONCURRENT_REQUEST"}
 
 try:
 execute("""
 INSERT INTO referral_relations
 (referrer_id, referred_id, store_id, entry_source, bind_time, expire_time, status)
 VALUES (?, ?, ?, ?, NOW, DATE_ADD(NOW, INTERVAL 30 DAY), 'active')
 ON DUPLICATE KEY UPDATE referral_id = referral_id
 """, referrer_id, referred_id, store_id, entry_source)
 return {"success": True}
 finally:
 redis.DEL(lock_key)
```

---

### 逻辑2：核销回调处理（v3.0重构）

```python
def handle_verify_callback(order_id, user_id, store_id, order_amount, verifier_id, coupon_code=None):
 store = get_store(store_id)
 cashback_amount = order_amount * store.cashback_rate
 
 with db.transaction:
 # 1. 创建订单记录
 insert_order(order_id, user_id, store_id, verifier_id,
 order_amount, cashback_amount, store.cashback_rate)
 
 # 2. 更新cashback余额账户（乐观锁防并发）
 for attempt in range(3):
 old = query("SELECT available_amount, version FROM store_credit_accounts "
 "WHERE user_id=? AND store_id=?", user_id, store_id)
 rows = execute("""
 UPDATE store_credit_accounts
 SET available_amount = available_amount + ?,
 total_earned = total_earned + ?,
 version = version + 1
 WHERE user_id=? AND store_id=? AND version=?
 """, cashback_amount, cashback_amount, user_id, store_id, old.version)
 if rows > 0:
 break
 else:
 raise OptimisticLockException
 
 # 3. 写入余额流水
 insert_tx(tx_type='cashback', amount=cashback_amount, order_id=order_id,
 cashback_rate_at_issue=store.cashback_rate,
 expire_time=datetime.now + timedelta(days=180))
 
 # 4. 更新会员成长值（同一事务，不可分离）
 growth = floor(order_amount) + 50
 execute("UPDATE members SET growth_value = growth_value + ?, "
 "last_visit_date = CURDATE, total_visit_count = total_visit_count + 1, "
 "total_spend_amount = total_spend_amount + ? "
 "WHERE user_id=? AND store_id=?", growth, order_amount, user_id, store_id)
 
 # 5. 检查升级（同一事务）
 member = get_member(user_id, store_id)
 new_level = calculate_level(member.growth_value)
 if new_level != member.current_level:
 execute("UPDATE members SET current_level=?, pending_upgrade=1 "
 "WHERE user_id=? AND store_id=?", new_level, user_id, store_id)
 insert_upgrade_event(user_id, store_id, member.current_level, new_level, order_id)
 
 # 6. 更新核销券状态（若有）
 if coupon_code:
 execute("UPDATE coupon_records SET status='used', used_at=NOW, order_id=? "
 "WHERE coupon_code=?", order_id, coupon_code)
 
 # 7. 事务外异步：触发发券逻辑（v3.0替换原分账逻辑）
 async_task(trigger_referral_coupon, user_id, store_id, order_id, store)
 
 # 8. 事务外异步：推送核销通知
 async_task(send_verify_notification, user_id, cashback_amount)
```

---

### 逻辑3-NEW（v3.0替换）：老带新抵扣券发放逻辑

此逻辑**替换**原v2.0的微信支付分账逻辑（逻辑3）。

```python
def trigger_referral_coupon(referred_id, store_id, order_id, store):
 # 1. 查找有效推荐关系
 referral = query("""
 SELECT * FROM referral_relations
 WHERE referred_id=? AND store_id=? AND status='active' AND expire_time > NOW
 """, referred_id, store_id)
 if not referral:
 return
 
 # 2. 验证是否首单（防重复触发）
 order_count = query("SELECT COUNT(*) FROM orders WHERE user_id=? AND store_id=?",
 referred_id, store_id)
 if order_count != 1:
 return # 只有首单触发
 
 # 3. 检查每人每月领取上限（Redis计数器）
 month_key = f"referral_coupon_count:{referral.referrer_id}:{store_id}:{datetime.now.strftime('%Y%m')}"
 current_count = int(redis.GET(month_key) or 0)
 if current_count >= store.referral_coupon_monthly_limit:
 # 静默处理，记录日志，不报错
 log_info(f"referral_coupon_monthly_limit_exceeded: referrer={referral.referrer_id} "
 f"store={store_id} count={current_count}")
 return
 
 # 4. 计算生效时间和过期时间
 effective_time = datetime.now + timedelta(hours=24)
 expire_time = effective_time + timedelta(days=store.referral_coupon_valid_days)
 
 # 5. 写入 referral_coupons 表（status=pending）
 coupon_id = generate_id
 execute("""
 INSERT INTO referral_coupons
 (coupon_id, referrer_id, referred_id, store_id, face_value, min_order_amount,
 effective_time, expire_time, status, trigger_order_id, created_at)
 VALUES (?, ?, ?, ?, ?, 30.00, ?, ?, 'pending', ?, NOW)
 """, coupon_id, referral.referrer_id, referred_id, store_id,
 store.referral_coupon_value, effective_time, expire_time, order_id)
 
 # 6. 更新推荐关系状态
 execute("""
 UPDATE referral_relations
 SET status='consumed', first_order_id=?, reward_amount=?, reward_paid_at=NOW
 WHERE referral_id=?
 """, order_id, store.referral_coupon_value, referral.referral_id)
 
 # 7. 更新推荐人成长值
 growth = 300 if referral.entry_source == 'referral_poster' else 200
 execute("UPDATE members SET growth_value = growth_value + ? "
 "WHERE user_id=? AND store_id=?", growth, referral.referrer_id, store_id)
 
 # 8. Redis计数器+1（月度领取上限）
 redis.INCR(month_key)
 redis.EXPIRE(month_key, 35 * 24 * 3600) # TTL约35天，覆盖跨月场景
 
 # 9. 异步推送T+0即时通知给推荐人（券明日生效）
 async_task(send_referral_coupon_notification, referral.referrer_id, store_id,
 store.referral_coupon_value, effective_time)
```

---

### 逻辑4：反作弊规则引擎（v3.0更新，共14条规则）

```
规则1：防自我邀请 — referrer_id == referred_id → 绑定失败，返回SELF_REFERRAL
规则2：防循环邀请 — A推荐B后B再推荐A → 绑定失败，返回CIRCULAR_REFERRAL
规则3：AI晒圈每日用量上限 — Redis key ai_count:{user_id}:{date} >= 3 → 返回3001
规则4：IP维度AI用量上限 — Redis key ai_ip:{ip}:{hour} >= 10 → 返回429
规则5：领券幂等控制 — 同一user_id+store_id+coupon_type+当日已有记录 → 返回已有券
规则6：核销员工账号必填 — verifier_id为空或不属于该门店 → 返回5005
规则7：余额抵扣上限30% — deduction_amount > order_amount * 0.30 → 返回5003 [9]
规则8：同一用户单日核销金额异常 — 单日核销金额 > 500元 → 标记suspicious，推送告警
规则9：同一员工单日核销笔数异常 — 单日核销笔数 > 30笔 → 推送告警给owner
规则10：同一用户单日核销次数异常 — 单日核销次数 > 3次 → 标记suspicious，推送告警
规则11：核销员工与被核销用户为同一人 — verifier openid == 顾客openid → 返回5006
规则12：门店月度算力成本告警 — 当月AI成本 > 100元 → 推送告警给平台运营
规则13：platform_admin访问审计 — 所有platform_admin数据访问写入platform_admin_logs表
规则14（v3.0新增）：每人每月老带新抵扣券领取上限 —
 Redis key referral_coupon_count:{referrer_id}:{store_id}:{YYYYMM} >= monthly_limit
 → 静默处理（不发券不报错），记录日志
```

---

### 逻辑5：退款追回逻辑（v3.0补充）

```python
def handle_refund(order_id, store_id):
 order = get_order(order_id)
 
 with db.transaction:
 # 标记订单已退款
 execute("UPDATE orders SET is_refunded=1, refunded_at=NOW WHERE order_id=?", order_id)
 
 # 追回消费返现余额（cashback）
 tx = query("SELECT * FROM store_credit_transactions "
 "WHERE order_id=? AND tx_type='cashback'", order_id)
 if tx:
 balance = get_balance(tx.user_id, store_id)
 if balance.available_amount >= tx.amount:
 # 未使用：直接扣减（乐观锁）
 execute("""
 UPDATE store_credit_accounts
 SET available_amount = available_amount - ?, version = version + 1
 WHERE balance_id=? AND version=?
 """, tx.amount, balance.balance_id, balance.version)
 insert_tx(tx_type='refund_clawback', amount=-tx.amount, order_id=order_id)
 else:
 # 已使用：标记待追回
 execute("UPDATE store_credit_transactions "
 "SET refund_clawback_pending=TRUE, clawback_order_id=? "
 "WHERE tx_id=?", order_id, tx.tx_id)
 
 # v3.0补充：取消已发放的老带新抵扣券
 # 查找由此订单触发的抵扣券（trigger_order_id=order_id）
 ref_coupon = query("SELECT * FROM referral_coupons "
 "WHERE trigger_order_id=? AND status IN ('pending', 'active')",
 order_id)
 if ref_coupon:
 execute("""
 UPDATE referral_coupons
 SET status='cancelled', cancel_reason='refund'
 WHERE coupon_id=?
 """, ref_coupon.coupon_id)
 # 同步回退推荐关系状态（如有必要，允许重新触发）
 execute("""
 UPDATE referral_relations
 SET status='active', first_order_id=NULL, reward_amount=NULL, reward_paid_at=NULL
 WHERE first_order_id=?
 """, order_id)
 # 回退推荐人成长值
 growth_back = 300 if ref_coupon_entry_source == 'referral_poster' else 200
 execute("UPDATE members SET growth_value = GREATEST(0, growth_value - ?) "
 "WHERE user_id=? AND store_id=?",
 growth_back, ref_coupon.referrer_id, store_id)
```

---

### 逻辑6：门店暂停营业余额顺延逻辑（无变化）

见v2.0逻辑6，完整保留。

---

### 逻辑7：通义万相异步调用完整链路（无变化）

```python
def generate_ai_poster(user_id, store_id, input_photos, input_text, style_type):
 # 1. 调用通义千问生成文案（同步）
 copy = qwen_generate(input_text, style_type)
 copy = filter_sensitive_words(copy) # 违禁词过滤，最多重试2次
 
 # 2. 提交通义万相异步任务（必须包含异步头）[8]
 response = requests.post(
 "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
 headers={
 "Authorization": f"Bearer {API_KEY}",
 "X-DashScope-Async": "enable" # 必须项，否则直接报错 [8]
 },
 json={"model": "wanx-v1", "input": {"prompt": copy}}
 )
 async_task_id = response.json["output"]["task_id"]
 
 # 3. 写入ai_requests表
 insert_ai_request(user_id, store_id, async_task_id, copy, input_photos)
 
 # 4. 返回task_id给前端（前端每2秒轮询）
 return {"task_id": async_task_id, "estimated_seconds": 5}

def poll_ai_task(task_id):
 """前端每2秒调用，async_poll_count递增，>=4时触发降级"""
 execute("UPDATE ai_requests SET async_poll_count = async_poll_count + 1 WHERE async_task_id=?",
 task_id)
 req = get_ai_request(task_id)
 
 if req.async_poll_count >= 4:
 # 超时降级
 fallback_url = generate_fallback_poster(req.generated_copy, req.referrer_qrcode_url)
 execute("UPDATE ai_requests SET task_status='fallback', is_fallback=1, "
 "generated_image_url=? WHERE async_task_id=?", fallback_url, task_id)
 return {"status": "fallback", "generated_image_url": fallback_url}
 
 result = query_dashscope_task(task_id)
 if result.status == "SUCCEEDED":
 poster_url = composite_poster(result.image_url, req.generated_copy, req.referrer_qrcode_url)
 oss_url = upload_to_oss(poster_url)
 execute("UPDATE ai_requests SET task_status='done', generated_image_url=? "
 "WHERE async_task_id=?", oss_url, task_id)
 return {"status": "done", "generated_image_url": oss_url}
 elif result.status == "FAILED":
 fallback_url = generate_fallback_poster(req.generated_copy, req.referrer_qrcode_url)
 execute("UPDATE ai_requests SET task_status='fallback', is_fallback=1, "
 "generated_image_url=? WHERE async_task_id=?", fallback_url, task_id)
 return {"status": "fallback", "generated_image_url": fallback_url, "error_code": 3004}
 else:
 return {"status": "processing"}
```

---

## 第八节：错误码设计（v3.0完整版）

| 错误码 | HTTP状态码 | 错误描述 | 前端文案 | v3.0变更 |
|-------|---------|---------|---------|---------|
| 0 | 200 | 成功 | — | — |
| 401 | 401 | token无效或过期 | 请重新打开小程序 | — |
| 403 | 403 | 无权限 | 您没有权限执行此操作 | — |
| 429 | 429 | 请求频率超限 | 操作太频繁，请稍后再试 | — |
| 500 | 500 | 服务器内部错误 | 系统繁忙，请稍后重试 | — |
| 1001 | 400 | store_id不存在 | 门店不存在或已停用 | — |
| 1002 | 400 | 微信code无效 | 登录失败，请重新打开小程序 | — |
| 2001 | 200 | 今日券已领取（幂等） | 今日福利已领取 | — |
| 2002 | 200 | 门店无可用活动 | 当前暂无可领取的优惠 | — |
| 3001 | 200 | AI今日次数已用完 | 今日次数已用完，明天再来 | — |
| 3002 | 400 | 图片审核不通过 | 照片不符合要求，请更换 | — |
| 3003 | 200 | AI服务超时降级 | 已为您生成文案版海报 | — |
| 3004 | 400 | 通义万相API返回错误 | 图片生成失败，已为您生成文案版海报 | — |
| 4001 | 400 | 余额不足 | 余额不足，可用余额：X元 | — |
| 4002 | 400 | 抵扣码已过期 | 抵扣码已过期，请重新生成 | — |
| 4003 | 400 | 抵扣金额超30%上限 | 最多可抵扣X元（本单30%） | — |
| 5001 | 400 | 到店券不存在 | 券码无效，请检查后重试 | — |
| 5002 | 200 | 到店券已核销（幂等） | 该券已核销 | — |
| 5003 | 400 | 到店券已过期 | 该券已过期，无法核销 | — |
| 5004 | 400 | 到店券不属于本门店 | 该券不属于本门店 | — |
| 5005 | 400 | 无效核销员 | 员工账号异常，请重新登录 | — |
| 5006 | 400 | 核销员与顾客为同一人 | 不允许自我核销 | — |
| **6001** | — | **废弃**（原分账比例超30%上限） | — | **`v3.0删除`** |
| 6002 | 400 | 推荐关系已存在 | 该顾客已绑定推荐人 | — |
| 6003 | 400 | 自我邀请 | 不允许邀请自己 | — |
| 6004 | 400 | 循环邀请 | 推荐关系存在循环，无法绑定 | — |
| 7001 | 403 | platform_admin尝试写入 | 平台运营账号不可修改商家配置 | — |
| 7002 | 400 | 退款追回余额不足 | 余额不足，已标记待追回 | — |
| 7003 | 400 | 门店暂停营业期间不可核销 | 门店暂停营业中，无法核销 | — |
| **8001** | **400** | **老带新抵扣券不存在或已过期** | 该券不存在或已过期 | **`v3.0新增`** |
| **8002** | **400** | **未满最低消费金额** | 消费满30元才可使用此券 | **`v3.0新增`** |
| **8003** | **400** | **券不属于本门店** | 该券不适用于本门店 | **`v3.0新增`** |
| **8004** | **400** | **券尚未生效（status=pending）** | 该券明日起生效，请明天再来使用 | **`v3.0新增`** |

---

## 第九节：MVP验收标准（v3.0完整版）

以下所有测试用例全部通过，方可支付验收款。

### 用例1：完整老带新闭环（v3.0预期结果变化）

**步骤**：
1. 用户A扫桌牌进入（无ref参数），领取到店券
2. 用户A消费100元，店员扫码核销
3. 检查A的cashback余额账户：应到账8元（8%返现）
4. 用户A进入AI晒圈，生成海报（海报中有A的专属小程序码）
5. 用户B通过A的海报扫码进入（URL携带ref=A的user_id）
6. 检查`referral_relations`表：应存在referrer=A、referred=B的记录，status=active
7. 用户B消费80元，店员核销（B的首次消费）
8. 检查`referral_coupons`表：应存在一张referrer_id=A、status=pending的抵扣券，face_value=10元，effective_time=核销时间+24小时

**v3.0预期结果**：A不再收到"余额到账"通知，而是收到"一张10元惊喜券已发放，明日起可用"通知；次日（effective_time后）定时任务激活，A的券包中出现一张status=active的抵扣券；`referral_relations`状态变为consumed。

---

### 用例2：幂等控制（无变化）

**步骤**：用户C当日扫码3次，每次调用领券接口。

**预期结果**：第2、3次返回第1次的coupon_id（`is_new=false`），`coupon_records`表中用户C当日只有1条记录。

---

### 用例3：升级触发（无变化）

**步骤**：手动将测试用户D的成长值设为490，消费10元（+10成长值+50到店=+60，合计550）。

**预期结果**：核销完成后`current_level`变为lv2，`pending_upgrade=true`，`upgrade_events`表有记录。

---

### 用例4：分账失败重试（v3.0删除此用例）

分账接口已删除，此用例不再需要测试。

---

### 用例5：自我邀请拦截（无变化）

**步骤**：构造`ref=自己user_id`的入口链接，调用`/api/user/entry`。

**预期结果**：后端返回错误码6003，`referral_relations`表无新记录。

---

### 用例6：退款追回（v3.0补充）

**步骤（cashback未使用场景）**：顾客消费100元获得8元返现（未使用）→ 次日申请退款 → 商家调用退款接口。

**预期结果**：顾客cashback余额直接扣除8元，流水表出现`tx_type=refund_clawback`记录。

**步骤（referral_coupon取消场景）**：B首次消费触发A的抵扣券发放（status=pending）→ B申请退款。

**预期结果**：对应`referral_coupons`记录status变为cancelled，cancel_reason=refund；`referral_relations`状态回退为active；推荐人成长值回退。

---

### 用例7：通义万相异步调用（无变化）

**步骤**：用户触发AI晒圈，检查后端HTTP请求头是否包含`X-DashScope-Async: enable`。

**正常预期**：8秒内完成，返回海报URL，`is_fallback=false`，`async_task_id`已写入`ai_requests`表。

**超时预期**（mock延迟>8秒）：前端收到降级海报URL，`is_fallback=true`，`task_status=fallback`。

---

### 用例8：platform_admin权限隔离（无变化）

**步骤A**：用`platform_admin`账号调用`PUT /api/store/cashback-config`（写操作）。

**预期结果**：返回错误码7001，商家配置未变更，`platform_admin_logs`表记录该次操作。

**步骤B**：用`platform_admin`账号调用`GET /api/platform/stores/{store_id}/dashboard`（读操作）。

**预期结果**：正常返回数据，`platform_admin_logs`表记录该次访问。

---

### 用例9：门店暂停营业余额顺延（无变化）

**步骤**：顾客有一笔7天后到期的cashback余额 → 商家设置`is_paused=true` → 暂停3天后恢复。

**预期结果**：恢复后该笔余额`expire_time`顺延3天；顾客收到"余额有效期已顺延"通知。

---

### 用例10（v3.0新增）：老带新抵扣券完整生命周期

**步骤**：
1. B核销完成 → 检查`referral_coupons`表，status=pending，effective_time=核销时间+24小时
2. T+0通知：A收到"一张10元惊喜券已发放，明日起可用"
3. 等待effective_time到达 → 定时任务激活 → status=active
4. 次日生效通知：A收到"你的10元惊喜券今日起可用了"
5. A到店消费80元，出示券码，店员调用接口18-B核销
6. 检查`referral_coupons`表：status=used，used_order_id已写入
7. 检查`orders`表：verify_type=referral_coupon，referral_coupon_deduction=10.00

**预期结果**：全流程无人工干预，7步全部符合预期。

---

### 用例11（v3.0新增）：抵扣券使用条件验证

**步骤**：A持有一张status=active、min_order_amount=30元的抵扣券 → 消费25元时尝试使用。

**预期结果**：接口18-B返回错误码8002，券状态不变（status仍为active）。

---

### 用例12（v3.0新增）：每人每月领取上限

**步骤**：将某推荐人当月Redis计数器手动设为商家配置上限（默认10张）→ 再次触发老带新（B新客首次消费）。

**预期结果**：`referral_coupons`表无新记录（不发券），日志中有`referral_coupon_monthly_limit_exceeded`记录，整个核销流程正常完成（不影响B的核销和A的cashback）。

---

### 用例13（v3.0新增）：抵扣券退款取消

**步骤**：B首次消费触发A的抵扣券（status=pending或active）→ B申请退款 → 商家调用退款接口。

**预期结果**：对应`referral_coupons`记录status=cancelled，cancel_reason=refund；`referral_relations`状态回退为active（允许B未来再次消费时重新触发）；推荐人A的成长值已回退。

---

## 第十节：自动化定时任务完整说明（v3.0更新版）

### 任务汇总表

| 任务名称 | 执行频率 | 触发条件 | 预计人工介入频率 | v3.0变更 |
|---------|---------|---------|--------------|---------|
| 分账重试 | — | — | — | **`v3.0删除`** |
| **抵扣券激活** | **每小时** | **status=pending AND effective_time<=NOW** | **零** | **`v3.0新增`** |
| **抵扣券过期** | **每天凌晨1:00** | **status=active AND expire_time<NOW** | **零** | **`v3.0新增`** |
| 余额到期提醒 | 每天凌晨2:00 | 14天内有余额到期 | 零 | 无变化 |
| 商家数据周报 | 每周一凌晨2:00 | 门店active且未暂停 | 每周0–1次 | 无变化 |
| 日度对账 | 每天凌晨3:00 | 全量扫描 | 每月0–2次 | 无变化 |
| 推荐关系过期 | 每天凌晨1:00 | expire_time<NOW AND status=active | 零 | 无变化 |
| 套餐到期提醒 | 每天凌晨9:00 | 套餐7/3/1天内到期 | 零 | 无变化 |

---

### 任务详情：抵扣券激活任务（v3.0新增）

**执行频率**：每小时（整点执行）

**核心SQL**：
```sql
-- 步骤1：找出待激活的券
SELECT coupon_id, referrer_id, store_id, face_value
FROM referral_coupons
WHERE status = 'pending' AND effective_time <= NOW
LIMIT 500; -- 批量处理，防止单次执行时间过长

-- 步骤2：批量更新状态
UPDATE referral_coupons
SET status = 'active'
WHERE status = 'pending' AND effective_time <= NOW
LIMIT 500;
```

**执行后**：对每张刚激活的券，异步推送燎小星"券已生效"服务通知给`referrer_id`对应用户，话术："你的10元惊喜券今日起可用了，快来店里用！"

**失败处理**：通知失败（用户未授权）标记`notify_failed`，运营合伙人次日处理；SQL更新失败重试1次，仍失败写入告警日志，下次执行时自动补偿（幂等）。

**预计人工介入频率**：零（仅通知失败时次日处理，约每月0–2次）。

---

### 任务详情：抵扣券过期任务（v3.0新增）

**执行频率**：每天凌晨1:00

**核心SQL**：
```sql
UPDATE referral_coupons
SET status = 'expired'
WHERE status = 'active' AND expire_time < NOW;
```

**失败处理**：任务失败重试1次，仍失败写入告警日志，不影响主流程（下次执行时自动补偿，幂等）。

**预计人工介入频率**：零。

---

### 保留任务核心SQL（余额到期提醒，含暂停顺延逻辑）

```sql
-- 查询14天内有余额到期的用户（跳过暂停门店）
SELECT DISTINCT sca.user_id, sca.store_id,
 DATEDIFF(sct.expire_time, NOW) AS days_left,
 SUM(sct.amount) AS expiring_amount
FROM store_credit_transactions sct
JOIN store_credit_accounts sca ON sct.balance_id = sca.balance_id
JOIN stores s ON sca.store_id = s.store_id
WHERE sct.expire_time BETWEEN NOW AND DATE_ADD(NOW, INTERVAL 14 DAY)
 AND sct.tx_type IN ('cashback')
 AND s.is_paused = 0 -- 跳过暂停门店
 AND sct.pause_pending = 0
GROUP BY sca.user_id, sca.store_id, DATEDIFF(sct.expire_time, NOW)
HAVING days_left IN (14, 7, 3, 1);
```

---

## 第十一节：迭代路线图（v3.0更新版）

| 月份 | 功能方向 | 触发指标 | 受益方 | 优先级 | v3.0变更 |
|-----|---------|---------|------|------|---------|
| 第1个月 | 核心闭环上线（含8个定时任务） | — | 商家+顾客 | 🔴 必须 | — |
| **第2个月** | **固定面值vs梯度面值A/B测试** | 试点4周后老带新转化率数据出来 | 商家+顾客 | 🔴 高 | **`v3.0新增`** |
| 第2个月 | 核销撤销（24小时内可撤销误操作） | 商家端收到2次以上误核销投诉 | 商家 | 🔴 高 | — |
| 第2–3个月 | 商家端数据报表升级（高价值顾客画像、老带新时段分析） | 商家续费率低于80% | 商家 | 🔴 高 | — |
| 第3个月 | 商家自助入驻流程 | 新商家签约速度成为瓶颈（每周>3家等待） | 商家 | 🟡 中 | — |
| 第3个月 | 会员等级可视化优化（成长值动画+升级动画） | Lv3+会员占比低于10% | 顾客 | 🟡 中 | — |
| 第4–5个月 | AI晒圈内容模板库（节日/品类预设，商家一键启用） | AI晒圈参与率低于25%连续4周 | 商家+顾客 | 🟡 中 | — |
| **第6个月** | **cashback余额统一为抵扣券评估** | 系统稳定运行且用户反馈显示两套机制混淆 | 顾客 | 🟡 中 | **`v3.0新增`** |
| 第6个月 | 跨店数据benchmark报告（需10+家门店） | 接入门店超过10家 | 商家 | 🟡 中 | — |
| 第6个月 | 多门店管理（连锁品牌统一后台） | 有商家提出多门店需求 | 商家 | 🟡 中 | — |
| 第9–12个月 | 跨店通用余额（同品牌多店通用） | 接入同一品牌多家门店 | 顾客 | 🟢 低 | — |

---

## 第十二节：MVP验收清单（v3.0完整版，可打勾）

### v2.0保留检查项（标注有变化的项）

- [ ] 推荐关系绑定逻辑测试通过（5个场景：直接进入/通过海报/推荐码过期/重复绑定/推荐人是自己）
- [ ] 消费返现（cashback）计算逻辑测试通过（核销后余额到账金额正确）
- [ ] 余额核销流程测试通过（顾客出示30分钟有效抵扣码，店员扫码，余额正确扣减）
- [ ] AI晒圈用量上限保护测试通过（超过每日3次上限后无法继续生成）
- [ ] 燎小星话术全部配置完成（20条审核友好版本，无金融类敏感词）[4]
- [ ] 桌牌物料印刷完成，摆放到位
- [ ] 商家端核销功能测试通过（扫码核销+手动输入两种方式）
- [ ] 员工培训完成（核心话术：扫码有券+AI出大片）
- [ ] 用户协议和隐私政策入口已添加，首次进入强制展示确认弹窗
- [ ] 多商家数据隔离验证通过（A商家员工无法访问B商家数据）
- [ ] 通义万相所有调用均包含`X-DashScope-Async: enable`头（技术合伙人逐行确认）[8]
- [ ] platform_admin角色可跨商家只读，不可修改任何商家配置（用例8通过）
- [ ] 退款追回cashback逻辑测试通过（用例6通过，未使用和已使用两种场景）
- [ ] 门店暂停营业余额顺延测试通过（用例9通过）
- [ ] 余额到期/周报/对账/推荐关系过期/套餐到期5个保留定时任务已配置并测试
- [ ] platform_admin_logs表已创建并记录所有跨商家访问操作
- [ ] 错误码7001/7002/7003/3004已实现并测试
- [ ] 日度对账任务测试通过（手动制造余额不一致，验证告警写入日志）

### v3.0新增检查项

- [ ] **微信支付分账相关代码已完全删除**（含SDK引用、retry_queue表、分账相关接口、原接口14）
- [ ] **`referral_coupons`表已创建**，含完整字段和4个关键索引（含`UNIQUE INDEX uk_trigger_order`防重复发券）
- [ ] **老带新抵扣券发放逻辑测试通过**（用例10通过，T+0发券→次日激活→店员核销全流程）
- [ ] **抵扣券激活定时任务已配置并测试**（每小时执行，pending→active，推送生效通知）
- [ ] **抵扣券过期定时任务已配置并测试**（每天凌晨1:00，active→expired）
- [ ] **商家端返现配置页面已更新**（`referral_coupon_value`/有效期/每月上限三个新字段已实现）
- [ ] **用户端券包页面已更新**（到店优惠券+老带新抵扣券分类展示，两类券UI区分明确）
- [ ] **接口18-A（查询老带新抵扣券列表）已实现并测试**（按4个状态分组返回）
- [ ] **接口18-B（老带新抵扣券核销）已实现并测试**（用例10/11通过，4个错误码8001–8004均已验证）
- [ ] **退款时抵扣券取消逻辑测试通过**（用例13通过，status=cancelled，成长值已回退）
- [ ] **燎小星T+0通知和次日生效通知均已配置并测试**（用例10步骤2和步骤4通过）
- [ ] **用户协议中抵扣券性质声明已添加**（消费奖励/不可提现/有效期/过期作废）[2]
- [ ] **错误码8001–8004已实现并测试**（用例11通过8002；用例10通过8004）
- [ ] **每人每月领取上限Redis计数器已实现并测试**（用例12通过，超限静默处理，日志记录）
- [ ] **`orders`表新字段已完成**（`referral_coupon_id`/`referral_coupon_deduction`）
- [ ] **`stores`表新字段已完成**（`referral_coupon_value`/`referral_coupon_valid_days`/`referral_coupon_monthly_limit`）
- [ ] **通义万相商业使用授权已确认**（上线前创始人+技术合伙人签字确认阿里云服务条款）

---

## 附录A：非功能性需求（无变化）

**性能要求**：
- 核销接口（`/api/store/verify/*`）响应时间 < 500ms（P99）
- AI生成任务提交响应 < 1s（P99），任务完成时间 < 8s（P95），超时降级
- 首页数据接口响应时间 < 1s（P99）

**可用性要求**：
- 核心链路（扫码/核销/发券）99.9%可用（月度不可用时间 < 44分钟）
- AI晒圈功能99%可用（允许降级为纯文案海报）

**安全要求**：
- 所有接口JWT鉴权，商家端接口额外验证`store_id`归属
- 手机号AES-256加密存储
- `account_type=store_credit`硬编码，无提现路径
- Redis分布式锁使用`SET key value NX PX`原子操作 [7]
- 所有资金和券操作写结构化审计日志，保留180天
- `platform_admin`所有操作写入`platform_admin_logs`表

**算力成本参考**（示意性测算）：通义万相0.16元/张 [5] + 通义千问Plus约0.002–0.004元/次 [6]，单次AI晒圈合计约0.16–0.17元；单店月均120–300次生成，月度算力成本约20–50元，占699元月费比例约3%–7%。中小独立餐饮净利率通常在8%–12%区间，抵扣券面值5–20元区间的设计在商家可承受范围内 [10]。

## 参考文献

[1] Product Introduction_Product Capability|WeChat Pay Open Platform. https://pay.weixin.qq.com/doc/global/v3/en/4012356412
[2] 单用途商业预付卡管理办法（试行）. https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=4050
[3] 传销三大要件法律分析. https://www.allbrightlaw.com/CN/10475/5373d6b4c4b692bc.aspx
[4] 微信小程序运营规范. https://developers.weixin.qq.com/miniprogram/product/
[5] 通义万相文生图API价格. https://help.aliyun.com/zh/model-studio/text-to-image-api-reference
[6] 通义千问各模型输入输出价格. https://help.aliyun.com/zh/model-studio/model-pricing
[7] Redis SET命令文档. https://redis.io/commands/set/
[8] 万相-文生图V2版API参考. https://help.aliyun.com/zh/model-studio/text-to-image-v2-api-reference
[9] 产品介绍_分账 | 微信支付商户文档中心. https://pay.weixin.qq.com/doc/v3/merchant/4012067962
[10] 2025年餐饮企业发展报告. https://assets.kpmg.com/content/dam/kpmgsites/cn/pdf/zh/2025/05/2025-china-food-and-beverage-enterprise-development-report.pdf
