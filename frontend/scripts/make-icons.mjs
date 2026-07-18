/* Regenerates every raster icon from the SVG sources in public/.
   Run: node scripts/make-icons.mjs                                          */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const icon = readFileSync(join(pub, 'favicon.svg'))
const mark = readFileSync(join(pub, 'mark.svg'), 'utf8')

// Full-bleed square (no rounded corners) for iOS + maskable: iOS masks its
// own shape, and maskable needs the mark inside the 80% safe zone.
function fullBleed(markScale) {
  const size = 48 * markScale
  const off = (512 - size) / 2
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <radialGradient id="bg" cx="50%" cy="18%" r="95%">
        <stop offset="0%" stop-color="#181f33"/>
        <stop offset="55%" stop-color="#0d111c"/>
        <stop offset="100%" stop-color="#0a0d15"/>
      </radialGradient>
      <radialGradient id="wash" cx="50%" cy="0%" r="70%">
        <stop offset="0%" stop-color="#f0a13c" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#f0a13c" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg)"/>
    <rect width="512" height="512" fill="url(#wash)"/>
    <g fill="none" transform="translate(${off} ${off + 4}) scale(${markScale})">
      ${mark.replace(/<\/?svg[^>]*>/g, '')}
    </g>
  </svg>`)
}

const png = (src, size, file) =>
  sharp(src, { density: 300 }).resize(size, size).png().toFile(join(pub, file))

await Promise.all([
  png(icon, 512, 'pwa-512.png'),
  png(icon, 192, 'pwa-192.png'),
  png(icon, 48, 'favicon-48.png'),
  png(icon, 32, 'favicon-32.png'),
  png(fullBleed(8.4), 180, 'apple-touch-icon.png'),
  png(fullBleed(7.2), 512, 'maskable-512.png'),
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
