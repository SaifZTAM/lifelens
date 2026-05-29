// extension/build.mjs
// Run: node extension/build.mjs
// Output: extension/dist/ — load this folder as an unpacked Chrome extension

import { build } from 'esbuild'
import { writeFileSync, copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, 'dist')

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

// ── 1. Compile TypeScript ─────────────────────────────────────────────────────

await Promise.all([
  build({
    entryPoints: [join(__dir, 'background.ts')],
    outfile:     join(OUT, 'background.js'),
    bundle: true, format: 'esm', platform: 'browser', target: 'chrome120',
    define: { 'process.env.NODE_ENV': '"production"' },
  }),
  build({
    entryPoints: [join(__dir, 'content.ts')],
    outfile:     join(OUT, 'content.js'),
    bundle: true, format: 'iife', platform: 'browser', target: 'chrome120',
  }),
  build({
    entryPoints: [join(__dir, 'popup.ts')],
    outfile:     join(OUT, 'popup.js'),
    bundle: true, format: 'iife', platform: 'browser', target: 'chrome120',
  }),
])
console.log('✓ TypeScript compiled')

// ── 2. Copy static files ──────────────────────────────────────────────────────

copyFileSync(join(__dir, 'popup.html'),    join(OUT, 'popup.html'))
copyFileSync(join(__dir, 'manifest.json'), join(OUT, 'manifest.json'))
console.log('✓ Static files copied')

// ── 3. Generate PNG icons (pure Node.js — no dependencies) ───────────────────
//
// Creates the LifeLens lens-eye mark:
//   • Dark rounded-square background (#09090b)
//   • Teal outer iris ring
//   • Deep dark inner iris
//   • Teal pupil
//   • White specular dot (top-left)
//   • Subtle horizontal lens shape highlight

function crc32(buf) {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = t[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const tag = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tag, data])))
  return Buffer.concat([len, tag, data, crcBuf])
}

function makePNG(size, drawPixel) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // 8-bit
  ihdr[9] = 6   // RGBA
  // compression/filter/interlace = 0

  // Raw scanlines: 1 filter byte + 4 bytes (RGBA) per pixel
  const raw = Buffer.alloc(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 4)
    raw[row] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a = 255] = drawPixel(x, y, size)
      const p = row + 1 + x * 4
      raw[p] = r; raw[p+1] = g; raw[p+2] = b; raw[p+3] = a
    }
  }

  const sig = Buffer.from([137,80,78,71,13,10,26,10])
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function lensMark(x, y, size) {
  const cx = size / 2, cy = size / 2
  const dx = x - cx + 0.5, dy = y - cy + 0.5
  const dist = Math.sqrt(dx*dx + dy*dy)
  const aX = Math.abs(dx), aY = Math.abs(dy)

  // Rounded-square background clip
  const half = size * 0.44
  const cr   = size * 0.20
  const inSquare = aX <= half && aY <= half &&
    !(aX > half - cr && aY > half - cr &&
      Math.sqrt((aX - half + cr)**2 + (aY - half + cr)**2) > cr)
  if (!inSquare) return [0, 0, 0, 0] // transparent

  // Lens eye layers (radii as fraction of size)
  const outerR = size * 0.34  // teal ring
  const irisR  = size * 0.22  // dark iris
  const pupilR = size * 0.13  // teal pupil fill
  const dotR   = size * 0.055 // white specular

  // White specular — top-left quadrant only
  const specX = cx - size * 0.10
  const specY = cy - size * 0.10
  const specDist = Math.sqrt((x - specX)**2 + (y - specY)**2)
  if (specDist <= dotR && dist <= pupilR * 1.8) return [255, 255, 255, 230]

  if (dist <= pupilR) return [45, 212, 191, 255]   // teal-300 pupil
  if (dist <= irisR)  return [7, 26, 24, 255]       // very dark iris
  if (dist <= outerR) return [20, 184, 166, 255]    // teal-500 outer

  // Lens shape hint: very subtle horizontal oval highlight on bg
  const lensY = Math.abs(dy) / (size * 0.44)
  const lensX = Math.abs(dx) / (size * 0.44)
  if (lensY < 0.15 && lensX < 0.9 && dist > outerR) {
    return [20, 30, 28, 255]  // slightly lighter band
  }

  return [9, 9, 11, 255] // dark background
}

for (const size of [16, 48, 128]) {
  const png = makePNG(size, lensMark)
  writeFileSync(join(OUT, `icon${size}.png`), png)
}
console.log('✓ Icons generated (16×16, 48×48, 128×128)')

console.log('\n✅ Extension built → extension/dist/')
console.log('   Load in Chrome: chrome://extensions → Developer mode → Load unpacked → select extension/dist/')
