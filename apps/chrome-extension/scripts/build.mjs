import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const root = new URL("..", import.meta.url).pathname;
const dist = resolve(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

await Promise.all([
  bundle("src/background.ts", "background.js", "esm"),
  bundle("src/content.ts", "content.js", "iife"),
  bundle("src/popup.ts", "popup.js", "iife"),
  bundle("src/options.ts", "options.js", "iife")
]);

await Promise.all([
  cp(resolve(root, "public/manifest.json"), resolve(dist, "manifest.json")),
  cp(resolve(root, "popup.html"), resolve(dist, "popup.html")),
  cp(resolve(root, "options.html"), resolve(dist, "options.html")),
  cp(resolve(root, "src/ui.css"), resolve(dist, "ui.css"))
]);

async function bundle(entry, outfile, format) {
  await build({
    entryPoints: [resolve(root, entry)],
    outfile: resolve(dist, outfile),
    bundle: true,
    format,
    platform: "browser",
    target: "chrome120",
    sourcemap: true,
    logLevel: "info"
  });
}
