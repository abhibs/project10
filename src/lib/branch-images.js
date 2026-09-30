import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import { BranchError } from "./branch-values.mjs";

// Use Sharp's CommonJS export for compatibility with the project's Node 20.9 runtime.
const sharp = createRequire(import.meta.url)("sharp");
const directory = path.join(process.cwd(), "uploads", "branches");
const filenamePattern = /^[a-zA-Z0-9_-]{1,64}-[0-9a-f-]{36}\.webp$/;

export async function saveBranchImage(file, branchId) {
  if (!file || (file instanceof File && !file.size)) return null;
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new BranchError("Choose a JPG, PNG or WebP branch image.");
  if (file.size > 10 * 1024 * 1024) throw new BranchError("Branch image must be 10 MB or smaller.");
  let image;
  try {
    const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25000000 });
    const metadata = await source.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages || 1) > 1) throw new Error("Invalid image");
    image = await source.rotate().resize({ width: 1600, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch { throw new BranchError("This image could not be read. Use a non-animated JPG, PNG or WebP under 25 megapixels."); }
  const filename = branchId + "-" + randomUUID() + ".webp";
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), image, { flag: "wx" });
  return filename;
}

export async function discardBranchImage(filename) {
  if (filenamePattern.test(filename || "")) await unlink(path.join(directory, filename)).catch(error => {
    if (error.code !== "ENOENT") console.error("Branch image cleanup failed:", error.code);
  });
}

export async function readBranchImage(filename) {
  if (!filenamePattern.test(filename)) return null;
  try { return await readFile(path.join(directory, filename)); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
