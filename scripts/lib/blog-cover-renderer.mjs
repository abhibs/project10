import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { selectBlogVisual } from "../../src/lib/blog-visuals.mjs";

const escape = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
let logo;
export async function renderBlogCover(post, filename) {
  const selected = selectBlogVisual(post);
  logo ||= await sharp("public/aryan-mark.webp").resize(78, 78).png().toBuffer();
  const photo = await sharp(path.join(process.cwd(), "public", selected.asset))
    .resize(1200, 630, { fit: "cover", position: "right" }).flatten({ background: "#f6efdf" }).toBuffer();
  const lines = [];
  for (const word of post.title.split(/\s+/)) {
    if (!lines.length || `${lines.at(-1)} ${word}`.length > 26) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  const fontSize = lines.length > 4 ? 35 : 40;
  const spacing = lines.length > 4 ? 45 : 54;
  const headline = lines.map((line, index) => `<tspan x="54" y="${267 + index * spacing}">${escape(line)}</tspan>`).join("");
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="shade"><stop offset="0" stop-color="#003e3a"/><stop offset=".38" stop-color="#003e3a" stop-opacity=".98"/><stop offset=".57" stop-color="#003e3a" stop-opacity=".82"/><stop offset=".72" stop-color="#003e3a" stop-opacity=".08"/><stop offset="1" stop-color="#003e3a" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/><rect x="18" y="18" width="1164" height="594" rx="16" fill="none" stroke="#ffd35c" stroke-opacity=".55" stroke-width="2"/><text x="149" y="87" fill="#fffaf3" font-family="Georgia" font-size="34" font-weight="bold">ARYAN</text><text x="150" y="118" fill="#ffd35c" font-family="Georgia" font-size="23">Gold Buyers</text><path d="M54 164H170" stroke="#ffd35c" stroke-width="3"/><text x="54" y="204" fill="#ffd35c" font-family="Arial" font-size="16" letter-spacing="2.5">${escape(selected.label)}</text><text fill="#fffaf3" font-family="Georgia" font-size="${fontSize}" font-weight="bold">${headline}</text><text x="54" y="575" fill="#fffaf3" fill-opacity=".8" font-family="Arial" font-size="18">aryangoldbuyers.com</text></svg>`);
  await mkdir(path.dirname(filename), { recursive: true });
  await sharp(photo).composite([{ input: svg }, { input: logo, left: 54, top: 49 }]).webp({ quality: 86 }).toFile(filename);
  return selected;
}
