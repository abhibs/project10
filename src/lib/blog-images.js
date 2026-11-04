import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { AdminAccessError } from "./admin-access.mjs";

const sharp = createRequire(import.meta.url)("sharp");
const directory = path.join(process.cwd(), "uploads", "blogs");
const pattern = /^[0-9a-f-]{36}\.webp$/;
export async function saveBlogImage(file) {
  if (!(file instanceof File) || !file.size || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new AdminAccessError("Choose a JPG, PNG or WebP image.");
  if (file.size > 10 * 1024 * 1024) throw new AdminAccessError("Image must be 10 MB or smaller.", 413);
  let image;
  try {
    const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25000000 });
    const metadata = await source.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages || 1) > 1) throw new Error("Invalid image");
    image = await source.rotate().resize({ width: 1800, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch { throw new AdminAccessError("Use a non-animated JPG, PNG or WebP under 25 megapixels."); }
  const filename = `${randomUUID()}.webp`;
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), image, { flag: "wx" });
  return filename;
}
export async function readBlogImage(filename) {
  if (!pattern.test(filename)) return null;
  try { return await readFile(path.join(directory, filename)); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
export async function discardBlogImage(filename) {
  if (pattern.test(filename || "")) await unlink(path.join(directory, filename)).catch(error => {
    if (error.code !== "ENOENT") console.error("Blog image cleanup failed:", error.code);
  });
}
