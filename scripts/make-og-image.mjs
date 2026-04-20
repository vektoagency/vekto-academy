import sharp from "sharp";
import fs from "fs";

const W = 1200;
const H = 630;
const OUT = "public/og-image.png";

async function run() {
  // Trim and crop VEKTO only from logo (same approach as stripe-icon)
  const trimmed = await sharp("public/vekto-logo.png").trim({ threshold: 5 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const vektoH = Math.round(meta.height * 0.72);
  const vektoOnly = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: meta.width, height: vektoH })
    .trim({ threshold: 5 })
    .toBuffer();
  const vMeta = await sharp(vektoOnly).metadata();

  // Resize VEKTO logo to fit nicely (target width ~480px)
  const logoTargetW = 520;
  const logoTargetH = Math.round((vMeta.height / vMeta.width) * logoTargetW);
  const logoLayer = await sharp(vektoOnly)
    .resize(logoTargetW, logoTargetH, { fit: "contain" })
    .toBuffer();

  // SVG composition — text, tagline, accent line
  const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080808"/>
          <stop offset="100%" stop-color="#050505"/>
        </linearGradient>
        <radialGradient id="glow" cx="20%" cy="30%" r="45%">
          <stop offset="0%" stop-color="rgba(200,255,0,0.15)"/>
          <stop offset="100%" stop-color="rgba(200,255,0,0)"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#glow)"/>

      <!-- Accent pill top-left -->
      <rect x="70" y="70" width="200" height="36" rx="18" fill="#c8ff00"/>
      <text x="170" y="94" font-family="'Arial Black', Arial, sans-serif"
            font-size="14" font-weight="900" fill="#000"
            text-anchor="middle" letter-spacing="2">
        VEKTO ACADEMY
      </text>

      <!-- Main headline -->
      <text x="70" y="360" font-family="'Arial Black', Arial, sans-serif"
            font-size="72" font-weight="900" fill="#ffffff"
            letter-spacing="-1.5">
        Научи AI видео.
      </text>
      <text x="70" y="450" font-family="'Arial Black', Arial, sans-serif"
            font-size="72" font-weight="900" fill="#c8ff00"
            letter-spacing="-1.5">
        Получи реална работа.
      </text>

      <!-- Subline -->
      <text x="70" y="510" font-family="Arial, sans-serif"
            font-size="26" font-weight="400" fill="rgba(255,255,255,0.55)">
        Обучение + общност + платена Арена · vektoacademy.com
      </text>

      <!-- Bottom accent line -->
      <rect x="70" y="560" width="80" height="4" rx="2" fill="#c8ff00"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .composite([]) // just render the SVG
    .png()
    .toFile(OUT);

  const stats = fs.statSync(OUT);
  console.log(`✓ OG image → ${OUT} (${W}×${H}, ${(stats.size / 1024).toFixed(0)}KB)`);
}

run().catch((e) => { console.error(e); process.exit(1); });
