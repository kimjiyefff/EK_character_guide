import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const src = process.argv[2]
const outDir = process.argv[3]
if (!src || !outDir) {
  console.error('Usage: node split-sheet.mjs <src> <outDir>')
  process.exit(1)
}

const meta = await sharp(src).metadata()
console.log('size', meta.width, meta.height)
const w = meta.width
const h = meta.height
const third = Math.floor(w / 3)
const labelCut = Math.round(h * 0.12)
const cropH = h - labelCut

const slices = [
  { key: '45', left: 0, name: 'MASTER_3D_45.png' },
  { key: 'front', left: third, name: 'MASTER_3D_FRONT.png' },
  { key: 'back', left: third * 2, name: 'MASTER_3D_BACK.png' },
]

await fs.promises.mkdir(outDir, { recursive: true })
await fs.promises.copyFile(src, path.join(outDir, 'MASTER_3D_SHEET.png'))
await fs.promises.copyFile(src, path.join(outDir, 'MASTER_3D.png'))

for (const s of slices) {
  const width = s.key === 'back' ? w - s.left : third
  await sharp(src)
    .extract({ left: s.left, top: 0, width, height: cropH })
    .png()
    .toFile(path.join(outDir, s.name))
  console.log('wrote', s.name, width, 'x', cropH)
}
