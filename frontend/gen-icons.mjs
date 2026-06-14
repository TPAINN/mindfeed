// Rasterizes icon-source.svg into the PWA + favicon PNG set.
// Run once after changing the source: node gen-icons.mjs
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const pub = join(root, 'public')
const svg = readFileSync(join(root, 'icon-source.svg'))

const targets = [
  { file: 'pwa-192.png', size: 192 },
  { file: 'pwa-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-48.png', size: 48 },
]

for (const t of targets) {
  await sharp(svg, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(join(pub, t.file))
  console.log('✓', t.file)
}

// Maskable: the source is already full-bleed, but pad a touch so the glyph
// sits inside the 80% safe zone on aggressive mask shapes.
await sharp(svg, { density: 384 })
  .resize(410, 410)
  .extend({
    top: 51, bottom: 51, left: 51, right: 51,
    background: { r: 0x7c, g: 0x3a, b: 0xed, alpha: 1 },
  })
  .resize(512, 512)
  .png()
  .toFile(join(pub, 'maskable-512.png'))
console.log('✓ maskable-512.png')

// favicon.ico from the 48px raster (single-size ICO is fine for modern browsers)
const ico32 = await sharp(svg, { density: 384 }).resize(32, 32).png().toBuffer()
writeFileSync(join(pub, 'favicon-32-tmp.png'), ico32)
console.log('✓ favicon source ready')
