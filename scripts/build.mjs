import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const files = [
  "index.html",
  "styles.css",
  "script.js",
  "assets/vendor/lucide.min.js",
  "assets/images/dra-caroline-hero-v2.png",
  "assets/images/dra-caroline-card.png",
  "assets/images/textura-marfil-rosa.png",
];

if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== "dist") {
  throw new Error("Invalid publication directory");
}

await rm(output, { recursive: true, force: true });
for (const file of files) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(root, file), destination);
}

console.log(`Prepared ${files.length} public files in dist.`);
