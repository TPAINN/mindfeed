/* Regenerates every raster icon from the SVG sources in public/.
   Run: node scripts/make-icons.mjs                                          */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const iconSrc = readFileSync(join(pub, 'favicon.svg'), 'utf8')
const icon = Buffer.from(iconSrc)

// Full-bleed square derived from the app icon: iOS masks its own shape and
// maskable needs the art inside the ~80% safe zone, so we drop the corner
// radius and (optionally) re-scale the art group.
function fullBleed(artScale) {
  let out = iconSrc.replace(/rx="118"/g, 'rx="0"')
  if (artScale) {
    const size = 48 * artScale
    const tx = (512 - size) / 2
    const ty = (512 - size) / 2 - 14
    out = out.replace(
      /<g id="art" transform="[^"]+"/,
      `<g id="art" transform="translate(${tx} ${ty}) scale(${artScale})"`
    )
  }
  return Buffer.from(out)
}

const png = (src, size, file) =>
  sharp(src, { density: 300 }).resize(size, size).png().toFile(join(pub, file))

await Promise.all([
  png(icon, 512, 'pwa-512.png'),
  png(icon, 192, 'pwa-192.png'),
  png(icon, 48, 'favicon-48.png'),
  png(icon, 32, 'favicon-32.png'),
  png(fullBleed(), 180, 'apple-touch-icon.png'),
  png(fullBleed(6.9), 512, 'maskable-512.png'),
])

// favicon.ico — single 32px PNG-compressed entry (valid modern ICO).
const png32 = await sharp(icon, { density: 300 }).resize(32, 32).png().toBuffer()
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4)
const entry = Buffer.alloc(16)
entry[0] = 32; entry[1] = 32; entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6)
entry.writeUInt32LE(png32.length, 8); entry.writeUInt32LE(22, 12)
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([header, entry, png32]))

console.log('icons regenerated')
