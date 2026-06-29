# 燎客 AI 本地 Mock API

这是给微信开发者工具和本地联调使用的轻量 HTTP mock 服务，不依赖数据库和外部服务。

## 启动

```bash
npm run dev:api
```

默认地址：

```text
http://127.0.0.1:5174
```

健康检查：

```text
GET /health
```

## 覆盖接口

- `POST /api/user/login`
- `GET /api/store/detail`
- `GET /api/qr/parse`
- `POST /api/coupon/issue`
- `GET /api/coupon/list`
- `GET /api/coupon/detail`
- `POST /api/upload/token`
- `POST /api/ai/text`
- `POST /api/ai/image`
- `POST /api/poster/generate`
- `GET /api/merchant/verify/preview`
- `POST /api/coupon/verify`
- `POST /api/stats/event`
- `GET /api/stats/daily`
- `POST /api/merchant/login`

## 验证

```bash
npm run smoke:api
npm run validate:api-contract
```

这会自动启动服务，然后用真实 HTTP 请求跑通登录、发券、上传 token、AI 文案、海报、核销和统计。

`validate:api-contract` 会检查接口文档、小程序客户端封装和本地 mock server 是否覆盖一致的核心 endpoint。

## 微信开发者工具

如果小程序要走本地 HTTP mock：

1. 启动 `npm run dev:api`。
2. 在微信开发者工具中打开“不校验合法域名”。
3. 运行：

```bash
npm run config:miniprogram:local
```

或手动把 `miniprogram/utils/config.js` 切为：

```js
env: "local-http-mock",
useMock: false,
baseUrl: "http://127.0.0.1:5174"
```
