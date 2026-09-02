// Removes white/light backgrounds from mascot JPEGs and saves as transparent PNGs.
// Run with: node scripts/remove-bg.js

const path = require("path");
const sharp = require("sharp");

const SRC_DIR = "D:\\Programming\\NewGenSayomi\\public\\projects";
const FILES = ["velox-mascot.png", "maitre-mascot.png", "ai-chaina-mascot.png"];

// Convert a near-white pixel to fully transparent.
// Anything above `threshold` in luminance becomes 0 alpha.
const ALPHA_THRESHOLD = 235;

async function processFile(filename) {
  const filePath = path.join(SRC_DIR, filename);
  const img = sharp(filePath);
  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels; // 4 (RGBA)
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Simple luminance check for white-ish pixels
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminance >= ALPHA_THRESHOLD) {
      data[i + 3] = 0; // fully transparent
    } else {
      // Soften the edge: lower alpha for slightly-white pixels near the threshold
      const margin = 25;
      if (luminance >= ALPHA_THRESHOLD - margin) {
        const t = (luminance - (ALPHA_THRESHOLD - margin)) / margin;
        data[i + 3] = Math.max(0, Math.min(255, Math.round(255 * (1 - t))));
      }
    }
  }

  const outPath = filePath.replace(/\.png$/, "-processed.png");
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`Processed ${filename} -> ${outPath}`);
}

(async () => {
  for (const f of FILES) {
    try {
      await processFile(f);
    } catch (err) {
      console.error(`Failed ${f}:`, err.message);
    }
  }
  console.log("Done.");
})();
