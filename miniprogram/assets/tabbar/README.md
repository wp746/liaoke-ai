# TabBar 图标

本目录存放燎客 AI 小程序底部 TabBar 图标。

```text
svg/  源 SVG
png/  微信小程序实际引用 PNG
```

当前 `app.json` 引用：

- 首页：`home.png` / `home-active.png`
- 吃肉券：`coupon.png` / `coupon-active.png`
- AI 创作：`create.png` / `create-active.png`
- 奖励：`reward.png` / `reward-active.png`
- 我的：`me.png` / `me-active.png`

规范：

- 默认态：`#797A82`
- 选中态：`#FF4B1B`
- 导出尺寸：`96x96`
- 视觉风格：简单、厚重、小尺寸可识别

重新导出示例：

```bash
for f in miniprogram/assets/tabbar/svg/*.svg; do \
  name=$(basename "$f" .svg); \
  sips -s format png "$f" --out "miniprogram/assets/tabbar/png/$name.png"; \
  sips -Z 96 "miniprogram/assets/tabbar/png/$name.png"; \
done
```
