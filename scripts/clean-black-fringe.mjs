import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Convert black-matted RGB (alpha lost on upload) to clean transparent PNG.
 * Removes dark fringe by un-premultiplying against black.
 */
export async function blackMatteToTransparent(inputPath, outputPath, { size = 1024 } = {}) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  const px = Buffer.from(data)

  // Pass 1: alpha from distance-to-black, then un-premultiply RGB
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    let r = px[o]
    let g = px[o + 1]
    let b = px[o + 2]

    // Soft key: pure black -> 0, midtones keep opacity
    const maxc = Math.max(r, g, b)
    const sum = r + g + b
    let a
    if (maxc < 18 && sum < 40) {
      a = 0
    } else if (maxc < 55) {
      // soft fringe zone
      a = Math.min(255, Math.round((maxc / 55) * 255))
    } else {
      a = 255
    }

    if (a === 0) {
      px[o] = px[o + 1] = px[o + 2] = px[o + 3] = 0
      continue
    }

    // Un-premultiply assuming black background contamination
    const af = a / 255
    r = Math.min(255, Math.round(r / af))
    g = Math.min(255, Math.round(g / af))
    b = Math.min(255, Math.round(b / af))

    px[o] = r
    px[o + 1] = g
    px[o + 2] = b
    px[o + 3] = a
  }

  // Pass 2: flood-clear residual near-black islands connected to edges
  const isNearBlack = (i) => {
    const o = i * 4
    return px[o + 3] > 0 && px[o] < 28 && px[o + 1] < 28 && px[o + 2] < 28
  }
  const visited = new Uint8Array(w * h)
  const queue = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const i = y * w + x
    if (visited[i]) return
    const o = i * 4
    if (px[o + 3] === 0 || isNearBlack(i)) {
      visited[i] = 1
      queue.push(i)
    }
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
    const o = i * 4
    px[o] = px[o + 1] = px[o + 2] = px[o + 3] = 0
    const x = i % w
    const y = (i / w) | 0
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }

  // Pass 3: light defringe — for semi-transparent edge pixels, boost RGB away from black
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    const a = px[o + 3]
    if (a === 0 || a === 255) continue
    const af = a / 255
    px[o] = Math.min(255, Math.round(px[o] / af))
    px[o + 1] = Math.min(255, Math.round(px[o + 1] / af))
    px[o + 2] = Math.min(255, Math.round(px[o + 2] / af))
  }

  let buf = await sharp(px, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()

  if (size) {
    buf = await sharp(buf)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()
  }

  const tmp = outputPath + '.tmp.png'
  await fs.promises.writeFile(tmp, buf)
  if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath)
  await fs.promises.rename(tmp, outputPath)
}

async function trimToSize3D(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  const pad = 4
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(w - 1, maxX + pad)
  maxY = Math.min(h - 1, maxY + pad)
  const tmp = outputPath + '.tmp.png'
  await sharp(inputPath)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toFile(tmp)
  if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath)
  await fs.promises.rename(tmp, outputPath)
}

const root = path.resolve('public/characters')
const assets = path.resolve(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-2AP2023-019-Desktop-jkim-AI-character-guide-v2/assets',
)

function findAsset(partial) {
  const files = fs.readdirSync(assets)
  const hit = files.find((f) => f.includes(partial))
  return hit ? path.join(assets, hit) : null
}

const jobs = [
  { id: 'tipa', asset: 'b4a5c782', srcName: 'MASTER_3D.png' },
  { id: 'kini', asset: '71940132', srcName: 'MASTER_3D.png' },
  { id: 'pani', asset: '2ca17e8c', srcName: 'MASTER_3D.png', fallback: 'e092d67c' },
  { id: 'huni', asset: '89c645a1', srcName: 'MASTER_3D.png' },
]

for (const job of jobs) {
  let src = findAsset(job.asset)
  if (!src && job.fallback) src = findAsset(job.fallback)
  if (!src) {
    src = path.join(root, job.id, job.srcName)
  }
  const out = path.join(root, job.id, 'MASTER_3D.png')
  const sizeOut = path.join(root, job.id, 'SIZE_3D.png')
  console.log(job.id, 'from', path.basename(src))
  await blackMatteToTransparent(src, out, { size: 1024 })
  await trimToSize3D(out, sizeOut)
  const meta = await sharp(out).metadata()
  console.log(' ->', meta.width + 'x' + meta.height, 'alpha', meta.hasAlpha)
}

// Hapa front already square transparent-ish — re-clean from current MASTER_3D_FRONT
const hapaFront = path.join(root, 'hapa', 'MASTER_3D_FRONT.png')
if (fs.existsSync(hapaFront)) {
  await blackMatteToTransparent(hapaFront, hapaFront, { size: 1024 })
  await trimToSize3D(hapaFront, path.join(root, 'hapa', 'SIZE_3D.png'))
  // also clean 45/back
  for (const name of ['MASTER_3D_45.png', 'MASTER_3D_BACK.png']) {
    const p = path.join(root, 'hapa', name)
    if (fs.existsSync(p)) await blackMatteToTransparent(p, p, { size: 1024 })
  }
  console.log('hapa views cleaned')
}
