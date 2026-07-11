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
    assert.match(moment, /liaoxiaoxing-ai-magic\.png/);
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
  assert.match(css, /\.reward-glyph--points,\.reward-glyph--referral\s*\{[^}]*color:\s*var\(--gold-400\)/s);
  assert.match(css, /\.reward-glyph--ai\s*\{[^}]*color:\s*var\(--ai-cyan\)/s);
  assert.match(css, /\.reward-glyph__reservoir\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
  assert.match(css, /\.reward-glyph__water-level\s*\{[^}]*height:\s*24px[^}]*background-image:\s*linear-gradient/s);
  assert.match(css, /\.reward-glyph--used,\.reward-glyph--expired,\.reward-glyph--paused\s*\{[^}]*color:\s*var\(--ink-600\)/s);

  assert.match(css, /\.glass-surface\.is-interactive:focus-visible,\.liquid-lens:focus-visible\s*\{/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*animation:\s*none;[^}]*transition:\s*none;[^}]*transform:\s*none;/s);
});
