# 燎客 AI 品牌资产包

本目录是「燎客 AI / SparkFlow AI」第一版可交付品牌包，用于小程序、桌牌、PPT、海报和后续设计精修。

## 品牌定位

- 中文名：燎客 AI
- 英文名：SparkFlow AI
- Slogan：One Scan, Spark Your Flow
- 系统 IP：燎小星
- 桌牌 IP：AI × 小签；牛里牛气试点为 AI 肉小签
- 核心场景：线下餐饮顾客扫码领券、AI 晒圈、海报生成、奖励裂变

## 目录结构

```text
assets/svg/        源 SVG 资产
assets/png/        常用 PNG 导出
ip-liaoxiaoxing/   燎小星 IP 形象资产包
tokens/            色彩、字号、圆角、阴影等设计 token
templates/         桌牌、海报、小程序图标等应用模板
guidelines/        使用规范、生产检查清单
exports/           批量导出的交付文件
```

## 快速导出

在项目根目录运行：

```bash
npm run export:brand-kit
```

会导出：

- Logo 横版 PNG
- Logo 标识 PNG
- 燎小星 PNG
- 小程序图标 PNG
- 桌牌模板 PNG
- 海报模板 PNG

## 重要说明

当前版本是 MVP/提案级资产，已经可以用于原型、小程序联调和销售材料。

正式商用前仍建议补三道关：

1. 设计师矢量精修：字重、间距、曲线、角点、极小尺寸识别。
2. 商标近似检查：中文名、英文名、图形标识都要查。
3. 印刷打样：桌牌颜色、二维码可扫率、餐厅灯光下可读性。
