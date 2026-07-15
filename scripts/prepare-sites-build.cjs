const fs = require("node:fs");
const path = require("node:path");

const serverDir = path.join(process.cwd(), "dist", "server");
const workerPath = path.join(serverDir, "index.js");
const hostingSource = path.join(process.cwd(), ".openai", "hosting.json");
const hostingDir = path.join(process.cwd(), "dist", ".openai");
const hostingTarget = path.join(hostingDir, "hosting.json");

const worker = `const SPA_ENTRY = "/index.html";

export default {
  async fetch(request, env) {
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404 || request.method !== "GET") {
      return assetResponse;
    }

    const fallbackUrl = new URL(request.url);
    fallbackUrl.pathname = SPA_ENTRY;
    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};
`;

fs.mkdirSync(serverDir, { recursive: true });
fs.writeFileSync(workerPath, worker, "utf8");
fs.mkdirSync(hostingDir, { recursive: true });
fs.copyFileSync(hostingSource, hostingTarget);
console.log("Prepared Cloudflare Workers entrypoint for Sites.");
