# 第 10 章：接口文档完善版

## 10.1 通用规范

### Base URL

```text
测试环境：https://test-api.xxx.com
生产环境：https://api.xxx.com
```

### Content-Type

```http
Content-Type: application/json
```

文件上传接口可使用 `multipart/form-data` 或后端签名直传对象存储。

### 统一返回格式

成功：

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

失败：

```json
{
  "code": 40001,
  "msg": "今日已领取过基础券",
  "data": null,
  "request_id": "req_20260627_xxx"
}
```

### 请求头

```http
Authorization: Bearer <session_token>
X-Request-Id: req_20260627_xxx
X-Idempotency-Key: idem_xxx
```

说明：

- 顾客端登录后接口带 `Authorization`。
- 发券、核销、海报生成必须带 `X-Idempotency-Key`。
- 如果前端不传 `X-Request-Id`，后端生成一个并返回。

## 10.2 错误码

| code | 含义 |
|------|------|
| 200 | 成功 |
| 40000 | 参数错误 |
| 40001 | 今日已领取 |
| 40002 | 优惠券不存在 |
| 40003 | 优惠券已使用 |
| 40004 | 优惠券已过期 |
| 40005 | 跨门店不可用 |
| 40100 | 未登录或登录过期 |
| 40300 | 无权限 |
| 40400 | 资源不存在 |
| 40900 | 幂等冲突或重复提交 |
| 42900 | 请求过于频繁 |
| 50000 | 服务器错误 |
| 51000 | AI 服务失败 |
| 51001 | AI 内容安全未通过 |
| 51002 | AI 配额不足 |
| 8001 | 老带新抵扣券不存在、已过期、已使用或已取消 |
| 8002 | 老带新抵扣券未满最低消费金额 |
| 8003 | 老带新抵扣券不属于本门店 |
| 8004 | 老带新抵扣券尚未生效 |
| 9001 | 积分账户不存在或已冻结 |
| 9002 | 积分不足 |
| 9003 | 积分商品不存在、已下架或售罄 |
| 9004 | 超过积分商品兑换上限 |
| 9005 | 积分兑换码不存在、已使用、已过期或已取消 |
| 9006 | 积分规则未启用 |
| 9007 | 今日已签到 |
| 9008 | 积分不可抵扣现金、提现或转让 |

## 10.3 鉴权

### 顾客端

1. 小程序调用 `wx.login()` 获取 `code`。
2. 调用 `/api/user/login`。
3. 后端返回 `session_token`。
4. 后续请求带 `Authorization: Bearer <session_token>`。

### 商家端

MVP 可用两种方案：

- 手机号 + 验证码/密码。
- 微信 openid 绑定操作员。

商家端接口必须校验 `operator.role`。

## 10.4 接口列表

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户 | POST | `/api/user/login` | 微信登录并创建会员 |
| 门店 | GET | `/api/store/detail` | 获取门店详情 |
| 桌码 | GET | `/api/qr/parse` | 解析 scene |
| 优惠券 | POST | `/api/coupon/issue` | 发券 |
| 优惠券 | GET | `/api/coupon/list` | 我的券列表 |
| 优惠券 | GET | `/api/coupon/detail` | 券详情 |
| 优惠券 | POST | `/api/coupon/verify` | 商家核销 |
| 文件 | POST | `/api/upload/token` | 获取上传凭证 |
| AI | POST | `/api/ai/text` | 文案生成 |
| AI | POST | `/api/ai/image` | 图片增强 |
| 海报 | POST | `/api/poster/generate` | 生成海报 |
| 邀请 | POST | `/api/invite/bind` | 绑定邀请 |
| 老带新抵扣券 | GET | `/api/user/referral-coupons` | 查询我的老带新抵扣券 |
| 老带新抵扣券 | POST | `/api/store/verify/referral-coupon` | 商家核销老带新抵扣券 |
| 积分 | GET | `/api/points/account` | 查询积分账户与概览 |
| 积分 | GET | `/api/points/transactions` | 查询积分流水 |
| 积分 | GET | `/api/points/products` | 查询积分商城商品 |
| 积分 | POST | `/api/points/redeem` | 用户兑换积分商品 |
| 积分 | GET | `/api/points/redemptions` | 查询我的积分兑换记录 |
| 积分 | POST | `/api/points/sign-in` | 用户每日签到领积分 |
| 积分 | POST | `/api/store/verify/points-redemption` | 商家核销积分兑换码 |
| 钱包 | GET | `/api/wallet/balance` | 查询返现余额 |
| 钱包 | GET | `/api/wallet/transactions` | 查询余额流水 |
| 钱包 | POST | `/api/wallet/spend` | 核销时抵扣余额 |
| 等级 | GET | `/api/member/level` | 查询店长等级与进度 |
| 统计 | POST | `/api/stats/event` | 通用埋点 |
| 统计 | GET | `/api/stats/daily` | 日统计 |
| 商家 | POST | `/api/merchant/login` | 商家登录 |
| 商家 | GET | `/api/merchant/verify/preview` | 核销前查询 |
| 私域群 | GET | `/api/merchant/private-group` | 老板和店长查看本店群配置与漏斗 |
| 私域群 | PUT | `/api/merchant/private-group` | 仅老板保存本店群配置 |

## 10.5 代表性接口详情

### POST `/api/user/login`

请求：

```json
{
  "code": "wx_login_code_xxx",
  "store_id": "STORE001",
  "table_id": "A01",
  "scene": "s=STORE001&t=A01&i=MEM202606260045&p=POST001"
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "session_token": "jwt_or_random_token",
    "openid": "oAbCdEfGhIjKlMnOpQrStUvWxYz",
    "member_id": "MEM202606270001",
    "is_new_member": true,
    "store": {
      "store_id": "STORE001",
      "store_name": "牛里牛气潮汕牛肉火锅",
      "slogan": "吃肉的人终会相遇",
      "store_logo_url": "https://oss.xxx.com/logo.png"
    },
    "coupon_status": {
      "base_coupon_issued_today": false
    }
  }
}
```

后端处理：

1. 使用 code 换 openid。
2. 查找或创建 `users`。
3. 查找或创建 `members`。
4. 如果 scene 包含 inviter，创建邀请关系。
5. 写入 scan/login 事件。

### GET `/api/store/detail`

请求：

```http
GET /api/store/detail?store_id=STORE001
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "store_id": "STORE001",
    "store_name": "牛里牛气潮汕牛肉火锅",
    "slogan": "吃肉的人终会相遇",
    "brand_keywords": ["潮汕牛肉火锅", "05后女生老板", "肉好实惠"],
    "group_chat_url": "https://xxx.com/group-guide",
    "group_chat_name": "牛里牛气会员福利群",
    "group_join_guide": "进群领隐藏福利、生日券和新品试吃提醒。",
    "group_qr_image": "https://cdn.example.com/store/STORE001/group-live-code.png",
    "group_enabled": true,
    "group_qr_expires_at": "2026-12-31",
    "group_assistant_name": "牛气群福利助手",
    "group_welcome_message": "群内只发门店福利、新品和生日提醒，不刷屏。",
    "poster_template": "hotpot_standard",
    "activity_enabled": true
  }
}
```

### GET / PUT `/api/merchant/private-group`

查看权限：老板、店长。修改权限：仅老板。`PUT` 必须校验当前账号授权的 `store_id`，不能信任客户端提交的门店归属。

保存请求：

```json
{
  "enabled": true,
  "name": "牛里牛气会员福利群",
  "guide": "进群领隐藏福利、生日券和新品试吃提醒。",
  "join_url": "https://work.weixin.qq.com/example",
  "qr_image": "https://cdn.example.com/store/STORE001/group-live-code.png",
  "qr_expires_at": "2026-12-31",
  "assistant_name": "牛气群福利助手",
  "welcome_message": "群内只发门店福利、新品和生日提醒，不刷屏。"
}
```

返回同时包含 `page_view_count`、`join_click_count`、`link_copy_count`、`assistant_request_count` 和 `confirmed_join_count`。服务端必须校验 HTTPS、字段长度和日期，并写入修改前后值、操作人和请求 ID。关闭入口只停止新的入群操作，不改变顾客既有权益。

### POST `/api/coupon/issue`

请求：

```json
{
  "member_id": "MEM202606270001",
  "store_id": "STORE001",
  "coupon_type": "base"
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "coupon_id": "CPN202606270001",
    "coupon_code": "8827639401",
    "type": "base",
    "title": "今日吃肉券",
    "discount_rate": 0.85,
    "status": "unused",
    "expire_time": "2026-06-27 23:59:59"
  }
}
```

幂等规则：

- `store_id + member_id + coupon_type + 当天日期` 唯一。
- 重复请求返回第一次发放的券，或返回 `40001`，二选一。建议返回已发券数据，前端体验更稳。

### GET `/api/coupon/list`

请求：

```http
GET /api/coupon/list?member_id=MEM202606270001&status=unused&page=1&page_size=20
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 1,
    "list": [
      {
        "coupon_id": "CPN202606270001",
        "coupon_code": "8827639401",
        "type": "base",
        "title": "今日吃肉券",
        "discount_rate": 0.85,
        "status": "unused",
        "expire_time": "2026-06-27 23:59:59"
      }
    ]
  }
}
```

### GET `/api/merchant/verify/preview`

请求：

```http
GET /api/merchant/verify/preview?coupon_code=8827639401&store_id=STORE001
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "coupon_id": "CPN202606270001",
    "coupon_code": "8827639401",
    "title": "今日吃肉券",
    "coupon_type": "base",
    "discount_rate": 0.85,
    "gift_name": null,
    "status": "unused",
    "expire_time": "2026-06-27 23:59:59",
    "member": {
      "member_id": "MEM202606270001",
      "nickname": "微信用户"
    }
  }
}
```

### POST `/api/coupon/verify`

请求：

```json
{
  "coupon_code": "8827639401",
  "store_id": "STORE001",
  "operator_id": "STAFF001",
  "order_amount": 256.00
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "coupon_id": "CPN202606270001",
    "original_amount": 256.00,
    "discount_amount": 38.40,
    "final_amount": 217.60,
    "verified_time": "2026-06-27 20:13:22",
    "referral_coupon": {
      "triggered": true,
      "inviter_member_id": "MEM202606260045",
      "coupon_id": "RFC202607050001",
      "status": "pending",
      "effective_time": "2026-06-28 20:13:22"
    }
  }
}
```

后端校验：

- 券存在。
- 券属于当前门店。
- 券未使用。
- 券未过期。
- 操作员有核销权限。
- 使用 Redis 锁防止重复核销。

### POST `/api/upload/token`

请求：

```json
{
  "store_id": "STORE001",
  "member_id": "MEM202606270001",
  "file_name": "hotpot.jpg",
  "file_mime": "image/jpeg",
  "asset_type": "original_image"
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "asset_id": "AST202606270001",
    "upload_url": "https://oss.xxx.com/presigned-url",
    "file_url": "https://oss.xxx.com/store001/20260627/hotpot.jpg",
    "expires_in": 600
  }
}
```

### POST `/api/ai/text`

请求：

```json
{
  "member_id": "MEM202606270001",
  "store_id": "STORE001",
  "raw_text": "吊龙太嫩了",
  "style": "meat_girl",
  "image_asset_ids": ["AST202606270001"]
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "task_id": "AIT202606270001",
    "candidates": [
      "今天这顿吊龙嫩到离谱，05后女生老板真的太会选肉了。",
      "肉食少女打卡成功，吊龙嫩嫩的，钱包也很轻松。",
      "这家偏一点，但肉真的值得跑一趟。"
    ],
    "usage": {
      "text_used": 16,
      "text_quota": 1000,
      "remaining": 984
    },
    "fallback": false
  }
}
```

内容安全：

- 用户输入先审。
- AI 输出后审。
- 未通过则返回 `51001` 或兜底文案。

### POST `/api/ai/image`

请求：

```json
{
  "member_id": "MEM202606270001",
  "store_id": "STORE001",
  "asset_id": "AST202606270001",
  "styles": ["natural", "warm", "premium"]
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "task_id": "AIT202606270002",
    "original_asset_id": "AST202606270001",
    "enhanced_images": [
      {
        "style": "natural",
        "asset_id": "AST202606270101",
        "url": "https://oss.xxx.com/enhanced_natural.jpg"
      },
      {
        "style": "warm",
        "asset_id": "AST202606270102",
        "url": "https://oss.xxx.com/enhanced_warm.jpg"
      }
    ],
    "fallback": false
  }
}
```

### POST `/api/poster/generate`

请求：

```json
{
  "member_id": "MEM202606270001",
  "store_id": "STORE001",
  "selected_text": "今天这顿吊龙嫩到离谱，05后女生老板真的太会选肉了。",
  "enhanced_asset_id": "AST202606270102",
  "template_code": "hotpot_standard"
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "post_id": "POST202606270001",
    "poster_asset_id": "AST202606270201",
    "poster_url": "https://oss.xxx.com/poster/20260627/poster.jpg",
    "share_scene": "s=STORE001&i=MEM202606270001&p=POST202606270001"
  }
}
```

### POST `/api/invite/bind`

请求：

```json
{
  "store_id": "STORE001",
  "inviter_member_id": "MEM202606270001",
  "invitee_member_id": "MEM202606280001",
  "post_id": "POST202606270001"
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "relation_id": "INV202606280001",
    "inviter_member_id": "MEM202606270001",
    "invitee_member_id": "MEM202606280001",
    "bind_time": "2026-06-28 12:01:00"
  }
}
```

规则：

- 自己不能邀请自己。
- 同一门店同一 invitee 只绑定一次。
- 邀请奖励只在新客完成首次核销后发放。
- v3.0 起，老带新奖励不再写入余额或微信分账，而是创建一张次日生效的老带新抵扣券。

### GET `/api/user/referral-coupons`

请求：

```http
GET /api/user/referral-coupons?store_id=STORE001&member_id=MEM202606270001&status=active
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "pending": [
      {
        "coupon_id": "RFC202607050001",
        "face_value": 10.00,
        "min_order_amount": 30.00,
        "effective_time": "2026-07-06 19:30:00",
        "expire_time": "2026-08-05 23:59:59",
        "trigger_order_id": "ORD202607050088",
        "status": "pending"
      }
    ],
    "active": [],
    "used": [],
    "expired": []
  }
}
```

规则：

- `pending` 表示已发放但尚未生效，默认 T+24 小时后生效。
- `active` 才能被核销。
- 每张券只能在发放门店使用。
- 每单最多使用一张老带新抵扣券。

### POST `/api/store/verify/referral-coupon`

请求：

```json
{
  "store_id": "STORE001",
  "operator_id": "OP202606270001",
  "coupon_id": "RFC202607050001",
  "order_id": "ORD202607080016",
  "order_amount": 88.00
}
```

请求头必须包含：

```http
X-Idempotency-Key: referral_coupon_verify_STORE001_RFC202607050001_ORD202607080016
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "coupon_id": "RFC202607050001",
    "deduction_amount": 10.00,
    "order_amount": 88.00,
    "final_amount": 78.00,
    "status": "used",
    "used_time": "2026-07-08 20:15:00"
  }
}
```

规则：

- 券不存在、过期、已使用或已取消，返回 `8001`。
- 订单未满最低消费金额，返回 `8002`。
- 券不属于本门店，返回 `8003`。
- 券未到生效时间，返回 `8004`。
- 核销成功后写入 `used_order_id`，重复请求返回同一结果，不重复抵扣。

### GET `/api/points/account`

请求：

```http
GET /api/points/account?store_id=STORE001&member_id=MEM202606270001
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "account_id": "PACC202607090001",
    "available_points": 1250,
    "total_earned_points": 1880,
    "total_used_points": 630,
    "expire_soon_points": 120,
    "expire_soon_date": "2026-08-01",
    "rules": {
      "points_per_yuan": 1,
      "sign_in_value": 5,
      "ai_share_value": 50,
      "expire_days": 365
    }
  }
}
```

规则：

- 积分只用于兑换门店配置的赠品或服务，不得抵扣现金、提现、转让。
- 积分账户按 `store_id + member_id` 唯一。
- 门店关闭积分功能时返回 `9006`。

### GET `/api/points/products`

请求：

```http
GET /api/points/products?store_id=STORE001&member_id=MEM202606270001&type=drink
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "available_points": 1250,
    "list": [
      {
        "product_id": "PPRD202607090001",
        "product_name": "酸梅汤一杯",
        "product_type": "drink",
        "points_price": 300,
        "stock_quantity": 99,
        "can_redeem": true,
        "description": "到店堂食可兑换"
      }
    ]
  }
}
```

### POST `/api/points/redeem`

请求：

```json
{
  "store_id": "STORE001",
  "member_id": "MEM202606270001",
  "product_id": "PPRD202607090001"
}
```

请求头必须包含：

```http
X-Idempotency-Key: points_redeem_STORE001_MEM202606270001_PPRD202607090001_20260709
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "redemption_id": "PRDM202607090001",
    "redemption_code": "PNT839201",
    "product_name": "酸梅汤一杯",
    "points_cost": 300,
    "points_after": 950,
    "status": "pending",
    "expire_time": "2026-07-16 23:59:59"
  }
}
```

规则：

- 积分不足返回 `9002`。
- 商品下架、售罄或不存在返回 `9003`。
- 超过每人每月兑换上限返回 `9004`。
- 兑换成功后扣减积分、生成兑换码，重复请求返回同一结果。

### GET `/api/points/redemptions`

请求：

```http
GET /api/points/redemptions?store_id=STORE001&member_id=MEM202606270001&status=pending
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "pending": [
      {
        "redemption_id": "PRDM202607090001",
        "redemption_code": "PNT839201",
        "product_name": "酸梅汤一杯",
        "points_cost": 300,
        "status": "pending",
        "expire_time": "2026-07-16 23:59:59"
      }
    ],
    "used": [],
    "expired": []
  }
}
```

### POST `/api/points/sign-in`

请求：

```json
{
  "store_id": "STORE001",
  "member_id": "MEM202606270001"
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "earned_points": 5,
    "available_points": 1255,
    "signed_at": "2026-07-09 12:30:00"
  }
}
```

规则：

- 同一门店同一会员每天只能签到一次，重复签到返回 `9007`。

### POST `/api/store/verify/points-redemption`

请求：

```json
{
  "store_id": "STORE001",
  "operator_id": "OP202606270001",
  "redemption_code": "PNT839201"
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "redemption_id": "PRDM202607090001",
    "redemption_code": "PNT839201",
    "product_name": "酸梅汤一杯",
    "status": "used",
    "used_time": "2026-07-09 19:20:00"
  }
}
```

规则：

- 兑换码不存在、已使用、已过期或已取消，返回 `9005`。
- 核销动作只交付赠品/服务，不产生现金抵扣。

### GET `/api/wallet/balance`

请求：

```http
GET /api/wallet/balance?store_id=STORE001&member_id=MEM202606270001
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "account_id": "WAL202606270001",
    "available_amount": 28.80,
    "frozen_amount": 0.00,
    "total_earned_amount": 58.80,
    "total_used_amount": 30.00,
    "expire_soon_amount": 10.00,
    "expire_soon_date": "2026-07-29"
  }
}
```

规则：

- 余额不能提现、不可转赠。
- 余额只能在本门店或商家配置的适用门店抵扣。
- 余额来源必须能追溯到消费返现或手动调整。v3.0 起老带新奖励通过抵扣券承接，不写入余额。

### GET `/api/wallet/transactions`

请求：

```http
GET /api/wallet/transactions?store_id=STORE001&member_id=MEM202606270001&page=1&page_size=20
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "page": 1,
    "page_size": 20,
    "total": 2,
    "list": [
      {
        "transaction_id": "WTX202606270001",
        "transaction_type": "earn",
        "source_type": "order_cashback",
        "amount": 10.00,
        "balance_after": 28.80,
        "status": "succeeded",
        "created_at": "2026-06-27 19:20:00",
        "expire_at": "2026-09-25 23:59:59"
      }
    ]
  }
}
```

### POST `/api/wallet/spend`

请求：

```json
{
  "store_id": "STORE001",
  "member_id": "MEM202606270001",
  "coupon_code": "8827639401",
  "order_amount": 256.00,
  "spend_amount": 20.00
}
```

请求头必须包含：

```http
X-Idempotency-Key: wallet_spend_STORE001_MEM202606270001_8827639401
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "transaction_id": "WTX202606270188",
    "spent_amount": 20.00,
    "balance_after": 8.80,
    "final_amount": 197.60
  }
}
```

规则：

- 抵扣金额不能大于可用余额。
- 抵扣必须和核销订单绑定。
- 幂等键重复提交时返回同一笔流水，不重复扣减。
- 抵扣失败时不得扣减余额。

### GET `/api/member/level`

请求：

```http
GET /api/member/level?store_id=STORE001&member_id=MEM202606270001
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "level_code": "LV2",
    "level_name": "吃肉达人",
    "star_points": 128,
    "next_level": {
      "level_code": "LV3",
      "level_name": "邀请店长",
      "required_verified_invites": 1,
      "current_verified_invites": 0
    },
    "tasks": [
      {
        "task_key": "daily_checkin",
        "title": "每日签到",
        "reward_points": 10,
        "status": "available"
      },
      {
        "task_key": "create_poster",
        "title": "创作海报",
        "reward_points": 20,
        "status": "done"
      }
    ]
  }
}
```

### POST `/api/stats/event`

私域群允许的事件包括 `group_join_page_show`、`group_join_click`、`group_join_qr_preview`、`group_join_link_copy`、`group_join_assistant_request` 和 `group_join_confirmed`。其中只有 `group_join_confirmed` 可以计入实际入群人数，且应来自企业微信可信回调或可审计人工核验。

请求：

```json
{
  "store_id": "STORE001",
  "member_id": "MEM202606270001",
  "table_id": "A01",
  "event_type": "group_join_click",
  "event_payload": {
    "page": "home",
    "button": "join_group"
  }
}
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "event_id": "EVT202606270001"
  }
}
```

### GET `/api/stats/daily`

请求：

```http
GET /api/stats/daily?store_id=STORE001&date=2026-06-27
```

返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "date": "2026-06-27",
    "scan_count": 42,
    "new_member_count": 30,
    "coupon_issue_count": 38,
    "coupon_verify_count": 35,
    "ai_text_count": 18,
    "ai_image_count": 12,
    "poster_count": 7,
    "group_join_click_count": 12,
    "group_join_confirmed_count": 8,
    "invite_bind_count": 3,
    "new_customer_verified_count": 1,
    "ai_cost_amount": 4.86,
    "order_amount_sum": 8960.00,
    "discount_amount_sum": 1280.00
  }
}
```

## 10.6 非功能要求

| 项 | 要求 |
|----|------|
| 登录接口 | P95 < 800ms |
| 发券接口 | P95 < 500ms |
| 核销接口 | P95 < 500ms |
| 文案生成 | 常规 < 4s，超时 8s 降级 |
| 图片增强 | 常规 < 10s，超时 15s 降级 |
| 海报生成 | < 3s |
| 日志 | 所有 P0 接口记录 request_id |
| 安全 | AI 密钥不得下发小程序 |
| 数据 | 核销、发券、邀请必须可追溯 |
