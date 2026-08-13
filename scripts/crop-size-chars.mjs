import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'public/characters/size-reference-source.png')

// Approximate crops from the size chart (763x773)
const crops = [
  { id: 'tipa', left: 55, top: 95, width: 95, height: 280 },
  { id: 'kini', left: 155, top: 120, width: 85, height: 255 },
  { id: 'pani', left: 250, top: 145, width: 80, height: 230 },
  { id: 'huni', left: 335, top: 190, width: 90, height: 185 },
  { id: 'hapa', left: 480, top: 70, width: 160, height: 305 },
]

for (const crop of crops) {
  const outDir = path.join(root, `public/characters/${crop.id}`)
  await sharp(src)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .png()
    .toFile(path.join(outDir, 'SIZE_STAND.png'))
  console.log('saved', crop.id)
}
