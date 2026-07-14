# 微信小程序发布就绪状态

> 状态日期：2026-07-12
> 当前结论：代码侧 READY，微信工具链与账号侧 BLOCKED

## 已完成

- 原生用户端五个主页面生产化。
- 原生商家端核销工作台与今日经营生产化。
- Liquid Glass Token、共享组件、场景资产、减少动态效果和实体玻璃降级。
- 小程序结构校验、接口合同、页面内 Mock、HTTP Mock 和生产构建。
- 用户端、商家端、平台后台自动化视觉合同。
- iPhone / Android 真机验收报告模板。

## 当前外部阻塞

### 1. 真实小程序 AppID

`project.config.json` 当前为：

```json
"appid": "touristappid"
```

正式预览、上传、体验版和真机 API 联调前，必须由燎客微信公众平台管理员提供真实 AppID，并确认开发者账号已加入项目成员。

### 2. 微信开发者工具

当前验收机器只安装了普通微信 `/Applications/WeChat.app`，未检测到微信开发者工具 CLI。

需要安装微信开发者工具，并在“设置 → 安全设置”中开启服务端口，之后重新运行严格检查。

## 自动检查命令

普通检查只输出报告，不因外部阻塞中断：

```bash
npm run preflight:wechat
```

CI 或正式发布闸口：

```bash
npm run preflight:wechat:strict
```

严格检查只有在以下条件同时满足时退出码为 0：

- `project.config.json` 使用格式正确的真实 AppID。
- 本机能找到微信开发者工具 CLI。
- `compileType` 为 `miniprogram`。
- `miniprogram/` 项目目录存在。

## 工具链就绪后的执行顺序

1. 运行 `npm run preflight:wechat:strict`。
2. 在微信开发者工具导入仓库内 `miniprogram/`。
3. 使用 Mock 环境完成首次编译，处理全部 WXML / WXSS / 基础库警告。
4. 切换 Test API，完成登录、领券、AI、积分、核销和经营数据联调。
5. 生成体验版二维码。
6. 在一台 iPhone 和一台 Android 真机完成 `DEVICE_ACCEPTANCE_REPORT.md`。
7. 上传截图、录屏、API 日志和已知偏差清单。
8. 三方签字后才能把 Draft PR 标记为 Ready。

## 不允许绕过

- 不得使用 `touristappid` 宣称完成正式真机验收。
- 不得只用开发者工具模拟器替代 iPhone / Android 真机。
- 不得跳过减少动态效果、暖白实体玻璃降级和弱网状态。
- 不得在缺少签字报告时宣称可以上线。
