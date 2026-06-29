# 燎客 AI 小程序联调清单

## 1. 微信侧配置

- 替换 `project.config.json` 中的真实 `appid`。
- 微信公众平台配置服务器域名：
  - `request合法域名`：API Base URL。
  - `uploadFile合法域名`：对象存储上传域名。
  - `downloadFile合法域名`：图片/CDN/小程序码域名。
- 微信开发者工具打开 `miniprogram/`，确认：
  - 首页可通过 scene 进入。
  - TabBar 五项正常。
  - `wx.login()` 能返回真实 code。
  - 相册保存权限弹窗正常。

## 2. 前端环境切换

文件：

```text
utils/config.js
config.example.js
```

联调时改为：

```js
useMock: false
baseUrl: "https://test-api.your-domain.com"
```

也可以先复制 `config.example.js` 中的 test/production 字段，保持字段名一致。

推荐用脚本切换，避免手改错字段：

```bash
npm run config:miniprogram:mock
npm run config:miniprogram:local
npm run config:miniprogram:test
npm run config:miniprogram:prod
```

本地 HTTP mock 联调时：

```bash
npm run dev:api
```

然后把 `utils/config.js` 临时切成：

```js
env: "local-http-mock"
useMock: false
baseUrl: "http://127.0.0.1:5174"
uploadBaseUrl: "http://127.0.0.1:5174"
cdnBaseUrl: "http://127.0.0.1:5174"
```

注意：微信开发者工具需要开启“不校验合法域名”才能访问本地 HTTP。

页面不应直接写 `wx.request`，统一通过：

```text
utils/api.js
utils/request.js
```

## 3. 必须先通的接口

按顺序联调：

1. `POST /api/user/login`
   - 输入：微信 `code`、`store_id`、`table_id`、`scene`。
   - 输出：`session_token`、`store`、`member`。
2. `GET /api/coupon/list`
   - 首页和券页依赖。
3. `POST /api/coupon/issue`
   - 必须支持幂等。
4. `POST /api/upload/token`
   - 返回对象存储上传参数。
5. `POST /api/ai/text`
   - 返回 3 条候选文案。
6. `POST /api/poster/generate`
   - 返回 `post_id`、`scene`、`qrcode_url`。
7. `GET /api/merchant/verify/preview`
   - 商家核销前查询。
8. `POST /api/coupon/verify`
   - 商家确认核销。
9. `GET /api/stats/daily`
   - 商家数据页。

## 4. 海报与小程序码

当前 `pages/poster/preview` 会：

- 优先使用后端返回的 `qrcode_url` 绘制到 canvas。
- 如果 `qrcode_url` 不可用，绘制本地占位码。
- 使用 `scene` 绑定 `store_id`、`inviter_id`、`post_id`。

后端建议：

- 生成永久或可缓存的小程序码图片。
- `qrcode_url` 必须在微信 `downloadFile合法域名` 内。
- 海报码 scene 最少包含：
  - `s`: store_id
  - `i`: inviter/member_id
  - `p`: post_id

## 5. 真机验证路径

- 扫桌牌码进入首页。
- 领取今日吃肉券。
- 打开我的券，出示券码。
- 进入 AI 创作，拍照/上传图。
- 生成文案，选择一版。
- 生成海报，保存到相册。
- 从“我的”进入商家核销，输入券码并核销。
- 打开商家数据页，看扫码/发券/核销/AI 数据。

## 6. 当前自动化验证

项目根目录：

```bash
npm run validate:miniprogram
npm run validate:api-contract
npm run smoke:miniprogram
npm run smoke:api
npm run build
npm run verify:all
```

注意：这三项不能替代微信开发者工具和真机验证，但可以提前挡掉页面结构、组件路径、业务 mock 链路和网页原型构建问题。
