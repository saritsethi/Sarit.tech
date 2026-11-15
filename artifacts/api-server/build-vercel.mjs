// Vercel build: bundle api/index.ts (Express app) to plain JS api/index.js. Keep api/index.ts in the checkout so Vercel can read it after the build.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactDir, "..", "..");

async function buildVercel() {
  await rm(path.resolve(repoRoot, "api/index.js"), { force: true });

  await esbuild({
    entryPoints: [path.resolve(repoRoot, "api/index.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(repoRoot, "api/index.js"),
    logLevel: "info",
      footer: { js: "module.exports = module.exports.default;" },
    // Bundle everything into the single file: the function lives at api/index.js, where workspace node_modules cannot be resolved at runtime, so only native addons stay external.
    external: ["*.node"],
    sourcemap: false,
  // No pino plugin: it adds worker entry points (incompatible with a single outfile), and the production logger uses no transport.
  });
}

buildVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
