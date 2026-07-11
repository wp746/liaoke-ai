import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

async function loadGlass() {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const vite = await createServer({ root, configFile: false, appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
  return { vite, module: await vite.ssrLoadModule("/src/prototype/components/Glass.jsx") };
}

test("glass primitives expose semantic material contracts", async () => {
  const { vite, module } = await loadGlass();
  try {
    const html = renderToStaticMarkup(React.createElement(module.GlassSurface, { level: "acrylic", interactive: true }, "权益"));
    assert.match(html, /data-glass-level="acrylic"/);
    assert.match(html, /is-interactive/);
  } finally { await vite.close(); }
});

test("glyphs expose kind and non-color state text", async () => {
  const { vite, module } = await loadGlass();
  try {
    const html = renderToStaticMarkup(React.createElement(module.RewardGlyph, { kind: "group", state: "used", value: "¥12" }));
    assert.match(html, /data-glyph-kind="group"/);
    assert.match(html, /data-glyph-state="used"/);
    assert.match(html, /已使用/);
  } finally { await vite.close(); }
});
