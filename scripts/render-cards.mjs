import sharp from "sharp";
import { readFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../public/", import.meta.url));
const slots = JSON.parse(await readFile(path.join(root, "slots.json"), "utf8"));
const width = 1200, height = Math.round(width * slots.mapSize.height / slots.mapSize.width);
await mkdir(path.join(root, "cards"), { recursive: true });
const diameter = Math.round(width * slots.stampDiameterPct / 100);
const overlays = [];
for (const stop of slots.stops) {
  const { data, info } = await sharp(path.join(root, stop.stamp)).resize(diameter, diameter).rotate(stop.rotate, { background: "#00000000" }).png().toBuffer({ resolveWithObject: true });
  overlays.push({ input: data, left: Math.round(width * stop.xPct / 100 - info.width / 2), top: Math.round(height * stop.yPct / 100 - info.height / 2) });
}
for (let n = 0; n <= 10; n++) {
  const target = path.join(root, "cards", `card-${String(n).padStart(2, "0")}.jpg`);
  await sharp(path.join(root, "map.png")).resize(width, height).composite(overlays.slice(0, n)).jpeg({ quality: 82, mozjpeg: true }).toFile(target);
  const size = (await stat(target)).size;
  if (size >= 400000) throw new Error(`Card ${n} exceeds 400 KB`);
  console.log(`card-${String(n).padStart(2, "0")}.jpg: ${Math.round(size / 1024)} KB`);
}
await sharp(path.join(root, "android-chrome-512x512.png")).resize(192, 192).png().toFile(path.join(root, "icon-192.png"));
