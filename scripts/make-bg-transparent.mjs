import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Make near-black pixels connected to image edges transparent.
 * Preserves black features inside the character (eyes, nose, etc.).
 */
async function blackEdgeToTransparent(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  const px = Buffer.from(data)
  const isBg = (i) => {
    const o = i * 4
    return px[o] < 30 && px[o + 1] < 30 && px[o + 2] < 30
  }

  const visited = new Uint8Array(w * h)
  const queue = []

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const i = y * w + x
    if (visited[i] || !isBg(i)) return
    visited[i] = 1
    queue.push(i)
  }

  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }

  while (queue.length) {
    const i = queue.pop()
    const x = i % w
    const y = (i / w) | 0
    const o = i * 4
    px[o] = 0
    px[o + 1] = 0
    px[o + 2] = 0
    px[o + 3] = 0
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }

  const tmp = outputPath + '.tmp.png'
  await sharp(px, { raw: { width: w, height: h, channels: 4 } }).png().toFile(tmp)
  if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath)
  await fs.promises.rename(tmp, outputPath)

  let transparent = 0
  for (let i = 3; i < px.length; i += 4) if (px[i] === 0) transparent++
  console.log(
    path.basename(path.dirname(outputPath)) + '/' + path.basename(outputPath),
    `${w}x${h}`,
    `transparent ${(transparent / (w * h) * 100).toFixed(1)}%`,
  )
}

const root = path.resolve('public/characters')
const targets = [
  path.join(root, 'pani', 'MASTER_3D.png'),
  path.join(root, 'kini', 'MASTER_3D.png'),
  path.join(root, 'huni', 'MASTER_3D.png'),
]

// Prefer newly uploaded pani if present
const newUpload = process.argv[2]
if (newUpload && fs.existsSync(newUpload)) {
  await fs.promises.copyFile(newUpload, targets[0])
  console.log('replaced pani with re-upload')
}

for (const file of targets) {
  await blackEdgeToTransparent(file, file)
}
