import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

async function loadGlass() {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const vite = await createServer({ root, configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
  return { vite, module: await vite.ssrLoadModule("/src/prototype/components/Glass.jsx") };
}

async function loadGlassCss() {
  return readFile(new URL("../../src/prototype/styles/glass.css", import.meta.url), "utf8");
}

async function loadMotionCss() {
  return readFile(new URL("../../src/prototype/styles/motion.css", import.meta.url), "utf8");
}

async function loadTokensCss() {
  return readFile(new URL("../../src/prototype/styles/tokens.css", import.meta.url), "utf8");
}

function relativeLuminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + .05) / (darker + .05);
}

test("glass primitives expose semantic material contracts", async () => {
  const { vite, module } = await loadGlass();
  try {
    const html = renderToStaticMarkup(React.createElement(module.GlassSurface, { level: "acrylic", interactive: true }, "权益"));
    assert.match(html, /data-glass-level="acrylic"/);
    assert.match(html, /is-interactive/);
  } finally { await vite.close(); }
});

test("lens, trail, and mascot moment expose their state contracts", async () => {
  const { vite, module } = await loadGlass();
  try {
    const lens = renderToStaticMarkup(React.createElement(module.LiquidLens, { active: true, className: "tab-lens" }, "当前"));
    assert.match(lens, /class="liquid-lens is-active tab-lens"/);
    assert.match(lens, /data-lens-active="true"/);
    assert.match(lens, />当前</);

    const trail = renderToStaticMarkup(React.createElement(module.SparkTrail, { active: true, className: "tab-trail" }));
    assert.match(trail, /aria-hidden="true"/);
    assert.match(trail, /class="spark-trail is-active tab-trail"/);

    const moment = renderToStaticMarkup(React.createElement(module.LiaoxiaoxingMoment, { kind: "ai", className: "hero-moment" }, "生成完成"));
    assert.match(moment, /class="liaoxiaoxing-moment liaoxiaoxing-moment--ai hero-moment"/);
    assert.match(moment, /scene-ai-magic-transparent-v1-display\.png/);
    assert.match(moment, /生成完成/);
  } finally { await vite.close(); }
});

test("glyphs expose every kind and state-specific assistive text", async () => {
  const { vite, module } = await loadGlass();
  try {
    for (const kind of ["store", "dish", "group", "drink", "balance", "points", "referral", "risk", "ai"]) {
      const html = renderToStaticMarkup(React.createElement(module.RewardGlyph, { kind, value: "12" }));
      assert.match(html, new RegExp(`reward-glyph--${kind}`));
      assert.match(html, new RegExp(`data-glyph-kind="${kind}"`));
      assert.match(html, /data-glyph-state="active"/);
    }

    for (const [state, label] of [["used", "已使用"], ["expired", "已过期"], ["paused", "已暂停"]]) {
      const html = renderToStaticMarkup(React.createElement(module.RewardGlyph, { kind: "group", state, value: "¥12" }));
      assert.match(html, new RegExp(`reward-glyph--${state}`));
      assert.match(html, new RegExp(`data-glyph-state="${state}"`));
      assert.match(html, new RegExp(`<span class="sr-only">${label}</span>`));
      assert.doesNotMatch(html, /aria-label=/);
    }
  } finally { await vite.close(); }
});

test("balance RewardGlyph owns droplets reservoir and water-level semantics", async () => {
  const { vite, module } = await loadGlass();
  try {
    const html = renderToStaticMarkup(React.createElement(module.RewardGlyph, { kind: "balance", state: "active" }));
    assert.match(html, /lucide-droplets/);
    assert.doesNotMatch(html, /lucide-ticket-check/);
    assert.match(html, /class="reward-glyph__reservoir"/);
    assert.match(html, /class="reward-glyph__water-level"/);
  } finally { await vite.close(); }
});

test("glass CSS preserves fallback, palette, focus, and motion contracts", async () => {
  const css = await loadGlassCss();

  assert.match(css, /\.glass-surface\s*\{[^}]*background:\s*var\(--glass-solid\)/s);
  assert.match(css, /\.glass-surface--acrylic\s*\{[^}]*-webkit-backdrop-filter:\s*blur\(18px\)[^}]*backdrop-filter:\s*blur\(18px\)/s);
  assert.match(css, /\.glass-surface--lens,\.liquid-lens\s*\{[^}]*-webkit-backdrop-filter:\s*blur\(24px\)[^}]*backdrop-filter:\s*blur\(24px\)/s);

  assert.match(css, /\.reward-glyph--store\s*\{[^}]*color:\s*var\(--ember-600\)/s);
  assert.match(css, /\.reward-glyph--points,\.reward-glyph--referral\s*\{[^}]*color:\s*var\(--gold-ink\)/s);
  assert.match(css, /\.reward-glyph--ai\s*\{[^}]*color:\s*var\(--ai-cyan-ink\)/s);
  assert.match(css, /\.reward-glyph__reservoir\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
  assert.match(css, /\.reward-glyph__water-level\s*\{[^}]*height:\s*24px[^}]*background-image:\s*linear-gradient/s);
  assert.match(css, /\.reward-glyph--used,\.reward-glyph--expired,\.reward-glyph--paused\s*\{[^}]*color:\s*var\(--ink-600\)/s);

  assert.match(css, /\.glass-surface\.is-interactive:focus-visible,\.liquid-lens:focus-visible\s*\{/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*transform:\s*none !important;[^}]*animation:\s*none !important;[^}]*transition:\s*none !important;/s);
});

test("glass CSS includes a solid warm fallback", async () => {
  const css = await loadGlassCss();

  assert.match(css, /@supports not/);
  assert.match(css, /rgba\(255,253,248,\.96\)/);
});

test("reward gold and AI cyan inks meet text and non-text contrast on warm white", async () => {
  const tokens = await loadTokensCss();
  const glass = await loadGlassCss();
  const tokenValue = (name) => tokens.match(new RegExp(`--${name}:\\s*(#[a-fA-F0-9]{6})`))?.[1];
  const warmWhite = "#fffdf8";

  for (const name of ["gold-ink", "ai-cyan-ink"]) {
    const color = tokenValue(name);
    assert.ok(color, `${name} token must exist`);
    assert.ok(contrastRatio(color, warmWhite) >= 4.5, `${name} must reach 4.5:1 for small text`);
    assert.ok(contrastRatio(color, warmWhite) >= 3, `${name} must reach 3:1 for non-text glyphs`);
  }

  assert.match(glass, /\.reward-glyph--points,\.reward-glyph--referral\s*\{[^}]*color:\s*var\(--gold-ink\)/s);
  assert.match(glass, /\.reward-glyph--ai\s*\{[^}]*color:\s*var\(--ai-cyan-ink\)/s);
  assert.match(tokens, /--gold-400:\s*#f8b84d/);
  assert.match(tokens, /--ai-cyan:\s*#00c2ff/);
});

test("reduced motion keeps the spark fallback static", async () => {
  const css = await loadMotionCss();

  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.spark-fallback::before,[\s\S]*\.spark-fallback i\s*\{[^}]*animation:\s*none !important;/);
});
