import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

// Frame the existing AG emblem without the source image's white margins or wordmark.
const mark = await sharp(new URL("../public/logo.jpeg", import.meta.url).pathname)
  .extract({ left: 400, top: 332, width: 280, height: 280 })
  .png()
  .toBuffer();

await writeFile(new URL("../public/aryan-mark.png", import.meta.url), mark);
await sharp(mark).resize(192, 192).toFile(new URL("../src/app/icon.png", import.meta.url).pathname);
await sharp(mark).resize(180, 180).toFile(new URL("../src/app/apple-icon.png", import.meta.url).pathname);

// Next.js requires RGBA PNG entries in ICO files, matching the 32-bit directory entries.
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map((size) => sharp(mark).resize(size, size).ensureAlpha().png().toBuffer()));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(new URL("../src/app/favicon.ico", import.meta.url), Buffer.concat([directory, ...images]));
