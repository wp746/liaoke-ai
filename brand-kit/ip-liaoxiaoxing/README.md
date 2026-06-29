# 燎小星 IP 资产包

本目录是「燎客 AI」系统级 IP「燎小星」的首版形象资产包，用于小程序原型、销售 PPT、品牌提案和后续设计精修。

## 资产定位

燎小星是一颗会说话的小火星，承担小程序内的欢迎、领券、AI 生成、海报完成、奖励提醒等引导任务。当前形象延续原型里的暖橙火焰、圆润脸型、轻 3D 质感和亲切表情。

## 标准形象

当前视觉系统锁定「单独有披肩 3D 版」燎小星：金黄色小披肩/领巾、胸前星形、暖橙火焰头发、大眼圆脸是固定识别点。

标准文件：

```text
assets/standard/liaoxiaoxing-standalone-no-star.png
```

硬性规则：

- 标准 IP 只出现角色本体。
- 头顶不要星星。
- 周围不要手机、扫码机、二维码、餐牌等道具。
- 旧无披肩 SVG 仅保留为早期概念源，不再作为小程序、PPT、海报、销售物料的主形象。

## 目录结构

```text
assets/boards/          总览资产板
assets/standard/        标准单独 IP 主图
assets/stickers/        表情与动作切片
assets/product-poses/   小程序业务场景动作切片
assets/source/          原始 SVG 参考形象
manifest.json           资产清单
```

## 总览板

| 文件 | 用途 |
|------|------|
| `assets/boards/liaoxiaoxing-character-sheet.png` | 角色标准板：正面、侧面、背面、挥手、举券 |
| `assets/boards/liaoxiaoxing-sticker-sheet.png` | 表情动作板：欢迎、点赞、惊喜、思考、举券、扫码等 |
| `assets/boards/liaoxiaoxing-product-poses.png` | 小程序场景板：首页、券包、上传、AI 生成、海报、奖励、核销、空状态 |

## 表情动作

| 文件 | 建议用途 |
|------|----------|
| `assets/stickers/liaoxiaoxing-welcome.png` | 首页欢迎、首次进入 |
| `assets/stickers/liaoxiaoxing-thumbs-up.png` | 操作成功、生成完成 |
| `assets/stickers/liaoxiaoxing-surprised.png` | 惊喜奖励、优惠提醒 |
| `assets/stickers/liaoxiaoxing-thinking.png` | AI 思考中、文案生成中 |
| `assets/stickers/liaoxiaoxing-coupon.png` | 领券成功、券包入口 |
| `assets/stickers/liaoxiaoxing-phone.png` | 上传照片、手机操作提示 |
| `assets/stickers/liaoxiaoxing-qr.png` | 扫码、核销、桌牌引导 |
| `assets/stickers/liaoxiaoxing-cheering.png` | 邀请成功、任务完成 |
| `assets/stickers/liaoxiaoxing-meat-lover.png` | 餐饮内容、吃肉券、门店氛围 |
| `assets/stickers/liaoxiaoxing-sleeping.png` | 暂无活动、休息中 |
| `assets/stickers/liaoxiaoxing-apology.png` | 失败、重试、内容不通过 |
| `assets/stickers/liaoxiaoxing-gift.png` | 奖励到账、礼包、积分兑换 |

## 小程序场景动作

| 文件 | 建议用途 |
|------|----------|
| `assets/product-poses/liaoxiaoxing-welcome-table.png` | 首页扫码桌牌欢迎 |
| `assets/product-poses/liaoxiaoxing-coupon-wallet.png` | 吃肉券、优惠钱包 |
| `assets/product-poses/liaoxiaoxing-upload-photo.png` | 上传随手拍 |
| `assets/product-poses/liaoxiaoxing-ai-magic.png` | AI 创作生成中 |
| `assets/product-poses/liaoxiaoxing-poster-saved.png` | 海报生成完成 |
| `assets/product-poses/liaoxiaoxing-reward-points.png` | 燎星值、积分奖励 |
| `assets/product-poses/liaoxiaoxing-merchant-verify.png` | 商家核销、扫码验证 |
| `assets/product-poses/liaoxiaoxing-empty-error.png` | 空状态、错误、稍后重试 |

## 使用建议

- 小程序内优先使用 `product-poses/`，因为这些动作已经贴合具体业务页面。
- 运营物料、表情包、社群话术优先使用 `stickers/`。
- 对外提案先使用 `boards/` 三张总览图，能最快说明 IP 的完整性。
- 当前切片为白底版本，适合评审和原型。正式嵌入界面前，建议再输出透明底 PNG、WebP、SVG 精修版。

## 下一步精修清单

1. 选定 6-8 个高频动作，统一透明底、尺寸、安全边距。
2. 补一版扁平/小尺寸头像，保证底部 Tab、Toast、悬浮入口里仍然清晰。
3. 补商用版权与商标近似检查。
4. 结合微信真机页面，校正实际显示尺寸、压缩体积和深浅背景适配。
