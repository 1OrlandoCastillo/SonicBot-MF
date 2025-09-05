import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { ffmpeg } from './converter.js'
import fluent_ffmpeg from 'fluent-ffmpeg'
import { spawn } from 'child_process'
import uploadFile from './uploadFile.js'
import uploadImage from './uploadImage.js'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

export async function writeExif(buffer, packname = 'hecho por', author = 'AdriBot el mejor') {
  const sticker = new Sticker(buffer, {
    pack: packname,     // nombre del pack
    author: author,     // autor
    type: 'default',
    categories: ['🤖'],
    quality: 100
  })

  return await sticker.build() // devuelve el .webp con metadata
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmpDir = path.join(__dirname, '../tmp')

// --- support config (declarado arriba para que todas las funciones lo vean) ---
const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false,
  find: false
}
global.support = support

// helpers
function queryURL(queries) {
  return new URLSearchParams(Object.entries(queries)).toString()
}

async function canvas(code, type = 'png', quality = 0.92) {
  const url = 'https://nurutomo.herokuapp.com/api/canvas?' + queryURL({
    type,
    quality
  })
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': String(Buffer.byteLength(code))
    },
    body: code
  })
  if (!res.ok) throw new Error(`Canvas request failed: ${res.status} ${res.statusText}`)
  return await res.buffer()
}

// ------------------- sticker2 (convert -> webp using convert/magick/gm) -------------------
function sticker2(img, url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        let res = await fetch(url)
        if (res.status !== 200) throw new Error(await res.text())
        img = await res.buffer()
      }
      const inp = path.join(tmpDir, `${Date.now()}.jpeg`)
      await fs.promises.mkdir(tmpDir, { recursive: true }).catch(() => {})
      await fs.promises.writeFile(inp, img)

      // ffmpeg converts input image to a png stream
      const ff = spawn('ffmpeg', [
        '-y',
        '-i', inp,
        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
        '-f', 'png',
        '-'
      ])

      ff.on('error', (e) => {
        // cleanup and reject
        fs.promises.unlink(inp).catch(()=>{})
        reject(e)
      })

      ff.on('close', async () => {
        // remove temp input (output is produced by the convert pipeline)
        await fs.promises.unlink(inp).catch(()=>{})
      })

      // decide converter process
      let procName, procArgs
      if (support.gm) {
        procName = 'gm'
        procArgs = ['convert', 'png:-', 'webp:-']
      } else if (support.magick) {
        procName = 'magick'
        procArgs = ['convert', 'png:-', 'webp:-']
      } else {
        // assume ImageMagick convert or a system 'convert' command available
        procName = 'convert'
        procArgs = ['png:-', 'webp:-']
      }

      let bufs = []
      const im = spawn(procName, procArgs)

      im.on('error', (e) => {
        // cleanup and report
        reject(e)
      })

      im.stdout.on('data', chunk => bufs.push(chunk))
      im.stderr.on('data', () => { /* ignore stderr or log if you want */ })

      // pipe ffmpeg PNG output into convert/magick/gm
      ff.stdout.pipe(im.stdin)

      im.on('exit', (code) => {
        if (code === 0 || code === null) {
          resolve(Buffer.concat(bufs))
        } else {
          reject(new Error(`${procName} exited with code ${code}`))
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

// ------------------- sticker1 (canvas-based) -------------------
async function sticker1(img, url) {
  url = url ? url : await uploadImage(img)
  // if url present, we assume it's an image URL; else detect mime from buffer
  const mime = url ? 'image/jpeg' : (await fileTypeFromBuffer(img)).mime
  const sc = `let im = await loadImg('data:${mime};base64,'+(await window.loadToDataURI('${url}')))
c.width = c.height = 512
let max = Math.max(im.width, im.height)
let w = 512 * im.width / max
let h = 512 * im.height / max
ctx.drawImage(im, 256 - w / 2, 256 - h / 2, w, h)
`
  return await canvas(sc, 'webp')
}

// ------------------- sticker3 (xteam api) -------------------
async function sticker3(img, url, packname, author) {
  url = url ? url : await uploadFile(img)
  const q = new URLSearchParams({ url, packname, author })
  let res = await fetch('https://api.xteam.xyz/sticker/wm?' + q.toString())
  if (!res.ok) throw new Error(`xteam API failed: ${res.status}`)
  return await res.buffer()
}

// ------------------- sticker4 (ffmpeg fast path) -------------------
async function sticker4(img, url) {
  if (url) {
    let res = await fetch(url)
    if (res.status !== 200) throw new Error(await res.text())
    img = await res.buffer()
  }
  return await ffmpeg(img, [
    '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
  ], 'jpeg', 'webp')
}

// ------------------- sticker5 (wa-sticker-formatter) -------------------
async function sticker5(img, url, packname, author, categories = [''], extra = {}) {
  const { Sticker } = await import('wa-sticker-formatter')
  const stickerMetadata = {
    type: 'default',
    pack: packname,
    author,
    categories,
    ...extra
  }
  return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}

// ------------------- sticker6 (fluent-ffmpeg path) -------------------
function sticker6(img, url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        let res = await fetch(url)
        if (res.status !== 200) throw new Error(await res.text())
        img = await res.buffer()
      }
      const type = await fileTypeFromBuffer(img) || { mime: 'application/octet-stream', ext: 'bin' }
      if (type.ext === 'bin') return reject(new Error('Unknown file type'))

      const tmpFile = path.join(tmpDir, `${Date.now()}.${type.ext}`)
      const outFile = tmpFile + '.webp'
      await fs.promises.mkdir(tmpDir, { recursive: true }).catch(() => {})
      await fs.promises.writeFile(tmpFile, img)

      let Fffmpeg = fluent_ffmpeg(tmpFile)
      if (/video/i.test(type.mime)) {
        Fffmpeg = Fffmpeg.inputFormat(type.ext)
      } else {
        // image; input already set by passing tmpFile to fluent_ffmpeg
      }

      // corrected filtergraph (valid quoting)
      const filter = "scale='min(320,iw)':'min(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"

      Fffmpeg
        .on('error', async function (err) {
          console.error('ffmpeg error:', err)
          await fs.promises.unlink(tmpFile).catch(()=>{})
          reject(err)
        })
        .on('end', async function () {
          await fs.promises.unlink(tmpFile).catch(()=>{})
          try {
            const buff = await fs.promises.readFile(outFile)
            await fs.promises.unlink(outFile).catch(()=>{})
            resolve(buff)
          } catch (e) {
            reject(e)
          }
        })
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf', filter,
          '-lossless', '0',
          '-qscale', '75',
          '-preset', 'default',
          '-loop', '0',
          '-an',
          '-vsync', '0'
        ])
        .toFormat('webp')
        .save(outFile)
    } catch (err) {
      reject(err)
    }
  })
}

// ------------------- addExif -------------------
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    "android-app-store-link": "https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp",
    "ios-app-store-link": "https://itunes.apple.com/app/sticker-maker-studio/id1443326857",
    'emojis': categories,
    ...extra
  }
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  let exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

// ------------------- orchestrator: sticker -------------------
async function sticker(img, url, ...args) {
  let lastError, stiker
  const funcs = [
    sticker3,
    support.ffmpeg ? sticker6 : null,
    sticker5,
    (support.ffmpeg && support.ffmpegWebp) ? sticker4 : null,
    (support.ffmpeg && (support.convert || support.magick || support.gm)) ? sticker2 : null,
    sticker1
  ].filter(Boolean)

  for (let func of funcs) {
    try {
      stiker = await func(img, url, ...args)
      // stiker can be Buffer
      if (Buffer.isBuffer(stiker)) {
        const asString = stiker.toString('utf8', 0, Math.min(64, stiker.length)).toLowerCase()
        if (asString.includes('html')) {
          // likely an error HTML response, try next
          throw new Error('HTML response received')
        }
        // if webp buffer -> try add exif
        if (stiker.includes('WEBP')) {
          try {
            return await addExif(stiker, ...args)
          } catch (e) {
            console.error('addExif failed, returning raw webp:', e)
            return stiker
          }
        }
        // if not WEBP, try to return as-is (or throw to continue)
        return stiker
      } else {
        // non-buffer result
        return stiker
      }
    } catch (err) {
      lastError = err
      continue
    }
  }
  console.error('All sticker methods failed:', lastError)
  throw lastError
}

export {
  sticker,
  sticker1,
  sticker2,
  sticker3,
  sticker4,
  sticker6,
  addExif,
  support
}
