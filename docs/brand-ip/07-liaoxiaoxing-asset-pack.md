# 07 燎小星形象资产包

本资产包位于：

```text
public/brand/ip-liaoxiaoxing/
```

它把原型里已经跑通的「燎小星」形象，扩展成一套可看、可评审、可继续精修的 IP 资产。

## 7.0 标准形象锁定

本项目从当前版本开始，统一使用「单独有披肩 3D 版」燎小星：

- 固定金黄色小披肩/领巾。
- 固定胸前星形识别点。
- 固定圆脸、大眼、暖橙火焰头发。
- 头顶不要星星。
- 标准主图不带手机、扫码机、二维码、餐牌等周边物品。
- 页面里不再混用无披肩旧 SVG 形象。
- 所有场景动作同样必须保留橙金披风，不得因拿手机、优惠券或道具而省略。

旧 SVG 保留为早期概念源，不作为正式视觉系统主图。

机器可读场景清单：

```text
public/brand/ip-liaoxiaoxing/scene-library/manifest.json
```

## 7.1 已输出内容

| 类型 | 数量 | 路径 |
|------|------|------|
| 角色总览板 | 1 | `brand-kit/ip-liaoxiaoxing/assets/boards/liaoxiaoxing-character-sheet.png` |
| 表情动作总览板 | 1 | `brand-kit/ip-liaoxiaoxing/assets/boards/liaoxiaoxing-sticker-sheet.png` |
| 小程序场景动作总览板 | 1 | `brand-kit/ip-liaoxiaoxing/assets/boards/liaoxiaoxing-product-poses.png` |
| 表情动作切片 | 12 | `brand-kit/ip-liaoxiaoxing/assets/stickers/` |
| 业务场景动作切片 | 8 | `brand-kit/ip-liaoxiaoxing/assets/product-poses/` |
| 原始 SVG 参考 | 1 | `brand-kit/ip-liaoxiaoxing/assets/source/liaoxiaoxing-original.svg` |
| 正式透明场景母版 | 5 | `public/brand/ip-liaoxiaoxing/scene-library/` |
| 界面运行版 | 5 | `public/brand/ip-liaoxiaoxing/scene-library/display/` |

## 7.2 当前可用于哪些地方

- 小程序原型里的欢迎、领券、AI 创作、海报完成、奖励页面。
- 销售 PPT 里的 IP 体系展示页。
- 给设计师的角色方向参考。
- 给开发的占位图片和动效素材参考。
- 给客户看的第一版品牌完整度证明。

## 7.3 正式页面匹配

| 页面 | 推荐资产 |
|------|----------|
| 首页 / 扫码入口 | `scene-library/display/scene-home-welcome-transparent-v1-display.png` |
| 吃肉券 / 优惠钱包 | `scene-library/display/scene-benefits-wallet-transparent-v1-display.png` |
| AI 创作 / 生成 / 完成 | `scene-library/display/scene-ai-magic-transparent-v1-display.png` |
| 奖励 / 积分 / 升级 | `scene-library/display/scene-points-reward-transparent-v1-display.png` |
| 我的 / 账户 / 服务 | `scene-library/display/scene-profile-phone-cape-transparent-v2-display.png` |
| 核销 / 商家端 | `product-poses/liaoxiaoxing-merchant-verify.png` |
| 空状态 / 错误 | `product-poses/liaoxiaoxing-empty-error.png` 或 `stickers/liaoxiaoxing-apology.png` |

旧 `product-poses/` 与 `stickers/` 仅作历史参考；用户端五个主页面必须使用正式场景库。

## 7.4 尺寸、透明与暗纹

- 根目录场景 PNG 是透明高清母版。
- `display/` 是运行版，最长边控制在 600px。
- 顶部 Hero 统一使用 `170 × 170px` 视觉框。
- 列表和右箭头下方暗纹使用已批准场景资产的局部裁切，透明度 0.04–0.09。
- 不允许白色矩形背景、拉伸、变形或裁掉披风身份特征。

## 7.5 后续资产边界

- 商家端和平台后台新增完整角色场景时，必须先登记到 `manifest.json`。
- 新资产必须通过披风、领结、胸前星标、手套鞋子、透明背景六项校验。
- 正式商用前仍需完成版权归属、商标近似和商用授权检查。
