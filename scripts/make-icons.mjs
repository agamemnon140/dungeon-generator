// Rasterizes public/icon.svg into the PNG icon set used by the PWA / iOS home screen.
//   node --preserve-symlinks scripts/make-icons.mjs   (run from the local mirror)

import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(dir, '../public');

const SIZES = {
  'apple-touch-icon.png': 180,
  'icon-192.png': 192,
  'icon-512.png': 512,
  'favicon-48.png': 48,
};

const svg = await readFile(path.join(pub, 'icon.svg'));
for (const [name, size] of Object.entries(SIZES)) {
  await sharp(svg, { density: 512 }).resize(size, size).png().toFile(path.join(pub, name));
  console.log('wrote', name, size);
}
