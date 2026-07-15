const fs = require("node:fs");
const path = require("node:path");

const serverDir = path.join(process.cwd(), "dist", "server");
const workerPath = path.join(serverDir, "index.js");

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
console.log("Prepared Cloudflare Workers entrypoint for Sites.");
