import sharp from "sharp";
import fs from "fs";

const INPUT = "public/vekto-logo.png";
const OUT_ICON = "public/stripe-icon.png";     // square — just VEKTO, no padding
const OUT_LOGO = "public/stripe-logo.png";     // wide — just VEKTO, tight

async function run() {
  // Trim ALL transparent padding aggressively
  const trimmed = await sharp(INPUT).trim({ threshold: 5 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  console.log(`Trimmed: ${meta.width}x${meta.height}`);

  // Source is 1473x372 (ratio ~4:1). ACADEMY subtitle is small and gets lost.
  // Crop to just the VEKTO top portion — roughly top 75% of height.
  const vektoH = Math.round(meta.height * 0.72);
  const vektoOnly = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: meta.width, height: vektoH })
    .trim({ threshold: 5 })
    .toBuffer();
  const vMeta = await sharp(vektoOnly).metadata();
  console.log(`VEKTO only: ${vMeta.width}x${vMeta.height}`);

  // ── Icon (512×512) — VEKTO fills ~85% of canvas ──
  const iconSize = 512;
  const iconPadding = 24; // tight padding
  const iconInner = iconSize - iconPadding * 2;
  const iconScale = Math.min(iconInner / vMeta.width, iconInner / vMeta.height);
  const iW = Math.round(vMeta.width * iconScale);
  const iH = Math.round(vMeta.height * iconScale);

  const iconLayer = await sharp(vektoOnly)
    .resize(iW, iH, { fit: "contain" })
    .toBuffer();

  await sharp({
    create: { width: iconSize, height: iconSize, channels: 4, background: { r: 8, g: 8, b: 8, alpha: 1 } },
  })
    .composite([{ input: iconLayer, gravity: "center" }])
    .png()
    .toFile(OUT_ICON);
  console.log(`✓ Icon → ${OUT_ICON} (${iconSize}×${iconSize}, inner ${iW}×${iH})`);

  // ── Logo (1024×256) — VEKTO fills width tightly ──
  const logoW = 1024;
  const logoH = 256;
  const logoPadding = 20;
  const logoInnerW = logoW - logoPadding * 2;
  const logoInnerH = logoH - logoPadding * 2;
  const logoScale = Math.min(logoInnerW / vMeta.width, logoInnerH / vMeta.height);
  const lW = Math.round(vMeta.width * logoScale);
  const lH = Math.round(vMeta.height * logoScale);

  const logoLayer = await sharp(vektoOnly)
    .resize(lW, lH, { fit: "contain" })
    .toBuffer();

  await sharp({
    create: { width: logoW, height: logoH, channels: 4, background: { r: 8, g: 8, b: 8, alpha: 1 } },
  })
    .composite([{ input: logoLayer, gravity: "center" }])
    .png()
    .toFile(OUT_LOGO);
  console.log(`✓ Logo → ${OUT_LOGO} (${logoW}×${logoH}, inner ${lW}×${lH})`);

  console.log(`\nSizes: icon=${(fs.statSync(OUT_ICON).size / 1024).toFixed(0)}KB, logo=${(fs.statSync(OUT_LOGO).size / 1024).toFixed(0)}KB`);
}

run().catch((e) => { console.error(e); process.exit(1); });
