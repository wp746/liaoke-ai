# 06 品牌资产包索引

品牌资产包位于：

```text
brand-kit/
```

它把前面确定的「燎客 AI / SparkFlow AI / 燎小星 / AI 肉小签」沉淀成可交付文件，而不只是文字规范。

## 6.1 核心文件

```text
brand-kit/README.md
brand-kit/tokens/liaoke.tokens.json
brand-kit/guidelines/usage.md
brand-kit/guidelines/production-checklist.md
```

## 6.2 源资产

```text
brand-kit/assets/svg/liaoke-logo.svg
brand-kit/assets/svg/liaoke-mark.svg
brand-kit/assets/svg/liaoxiaoxing.svg
brand-kit/ip-liaoxiaoxing/
```

说明：

- `liaoke-logo.svg`：横版品牌锁定。
- `liaoke-mark.svg`：方形标识。
- `liaoxiaoxing.svg`：系统级 IP 燎小星。
- `ip-liaoxiaoxing/`：燎小星首版 3D 形象资产包，包含角色标准板、表情动作、业务场景动作。

## 6.3 应用模板

```text
brand-kit/templates/app-icon-1024.svg
brand-kit/templates/table-tent-ai-rouxiaoqian.svg
brand-kit/templates/share-poster-template.svg
brand-kit/templates/logo-clearspace-spec.svg
```

用途：

- 小程序图标草案。
- AI 肉小签桌牌。
- 顾客分享海报视觉基准。
- Logo 留白规范图。

## 6.4 导出命令

在项目根目录运行：

```bash
npm run export:brand-kit
```

导出文件位于：

```text
brand-kit/exports/
```

导出 manifest：

```text
brand-kit/exports/manifest.json
```

## 6.5 当前边界

本资产包可以用于：

- 产品原型展示。
- 小程序联调。
- 销售 PPT。
- 桌牌首版打样。
- 设计师继续精修的源材料。

正式商用前仍需要：

- 商标近似查询。
- 设计师矢量精修。
- 印刷打样。
- 微信开发者工具与真机验证。
