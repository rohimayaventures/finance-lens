/**
 * Resize/compress landing + OG images and build favicons from the mark.
 * Run: npm run optimize-assets
 *
 * Sources (first match wins):
 * - Hero: public/finance-lens-hero.png | public/hero.webp | public/finance-lens-hero.webp
 * - Mark: public/finance-lens-mark.svg | public/finance-lens-mark.png
 */
import { access, mkdir, open } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pub = join(root, "public");
const appDir = join(root, "app");

const HERO_MAX_W = 1400;
const OG_W = 1200;
const OG_H = 630;

async function exists(p) {
  try {
    await access(p, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/** Avoid using a corrupt or placeholder .webp as the hero source (Windows-safe reads). */
async function isReadableWebp(p) {
  try {
    const fh = await open(p, "r");
    const buf = Buffer.alloc(12);
    await fh.read(buf, 0, 12, 0);
    await fh.close();
    const riff = buf.toString("ascii", 0, 4);
    const webp = buf.toString("ascii", 8, 12);
    if (riff !== "RIFF" || webp !== "WEBP") return false;
    await sharp(p).metadata();
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const heroPng = join(pub, "finance-lens-hero.png");
  const heroWebpLegacy = join(pub, "finance-lens-hero.webp");
  const heroWebp = join(pub, "hero.webp");
  const heroOg = join(pub, "og-image.jpg");
  let heroPath = null;
  if (await exists(heroPng)) heroPath = heroPng;
  else if (await exists(heroWebp) && (await isReadableWebp(heroWebp))) heroPath = heroWebp;
  else if (await exists(heroWebpLegacy) && (await isReadableWebp(heroWebpLegacy))) heroPath = heroWebpLegacy;
  else if (await exists(heroOg)) heroPath = heroOg;
  if (!heroPath) {
    throw new Error("No hero source: add public/finance-lens-hero.png, hero.webp, finance-lens-hero.webp, or og-image.jpg");
  }

  const svgPath = join(pub, "finance-lens-mark.svg");
  const markPngPath = join(pub, "finance-lens-mark.png");
  const markPath = (await exists(svgPath)) ? svgPath : markPngPath;
  if (!(await exists(markPath))) {
    throw new Error("No mark source: add public/finance-lens-mark.svg or .png");
  }

  const heroBuf = await sharp(heroPath).toBuffer();
  const heroMeta = await sharp(heroBuf).metadata();
  const srcW = heroMeta.width ?? 1400;
  const srcH = heroMeta.height ?? 739;
  const heroOutW = Math.min(srcW, HERO_MAX_W);
  const heroOutH = Math.round(srcH * (heroOutW / srcW));

  await sharp(heroBuf)
    .resize(heroOutW, heroOutH, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 6 })
    .toFile(join(pub, "hero.webp"));

  const ogOutPath = join(pub, "og-image.jpg");
  const heroIsOgOnly = heroPath === ogOutPath;
  if (!heroIsOgOnly) {
    await sharp(heroBuf)
      .resize(OG_W, OG_H, { fit: "cover", position: "centre" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(ogOutPath);
  }

  const markIsSvg = markPath.endsWith(".svg");
  const rasterizeMark = async () => {
    const markInputBuf = markIsSvg
      ? await sharp(markPath, { density: 144, limitInputPixels: false }).toBuffer()
      : await sharp(markPath).toBuffer();

    const mark256 = await sharp(markInputBuf)
      .resize(256, null, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await sharp(mark256).toFile(join(pub, "finance-lens-mark.png"));

    await sharp(mark256).resize(32, 32, { fit: "cover", position: "centre" }).png().toFile(join(pub, "icon-32.png"));

    await sharp(mark256).resize(192, 192, { fit: "cover", position: "centre" }).png().toFile(join(pub, "icon-192.png"));

    await sharp(mark256)
      .resize(180, 180, { fit: "cover", position: "centre" })
      .png()
      .toFile(join(pub, "apple-touch-icon.png"));

    await mkdir(appDir, { recursive: true });
    await sharp(mark256).resize(48, 48, { fit: "cover", position: "centre" }).png().toFile(join(appDir, "icon.png"));

    await sharp(mark256)
      .resize(180, 180, { fit: "cover", position: "centre" })
      .png()
      .toFile(join(appDir, "apple-icon.png"));
  };

  try {
    await rasterizeMark();
  } catch (err) {
    console.warn("Mark rasterize failed, falling back to hero crop for icons:", err?.message ?? err);
    const fallback = sharp(heroBuf).resize(512, 512, { fit: "cover", position: "centre" });
    const fbBuf = await fallback.toBuffer();
    await sharp(fbBuf)
      .resize(256, 256, { fit: "cover", position: "centre" })
      .png({ compressionLevel: 9 })
      .toFile(join(pub, "finance-lens-mark.png"));
    await sharp(fbBuf).resize(32, 32, { fit: "cover" }).png().toFile(join(pub, "icon-32.png"));
    await sharp(fbBuf).resize(192, 192, { fit: "cover" }).png().toFile(join(pub, "icon-192.png"));
    await sharp(fbBuf).resize(180, 180, { fit: "cover" }).png().toFile(join(pub, "apple-touch-icon.png"));
    await mkdir(appDir, { recursive: true });
    await sharp(fbBuf).resize(48, 48, { fit: "cover" }).png().toFile(join(appDir, "icon.png"));
    await sharp(fbBuf).resize(180, 180, { fit: "cover" }).png().toFile(join(appDir, "apple-icon.png"));
  }

  console.log(
    `Done. Hero → public/hero.webp (${heroOutW}×${heroOutH}), OG → public/og-image.jpg (${OG_W}×${OG_H}). Icons in public/* and app/icon.png, app/apple-icon.png.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
