import fetch from 'node-fetch'
import yts from 'yt-search'
import ytdl from 'ytdl-core'
import axios from 'axios'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { ytmp3, ytmp4 } = require("@hiudyy/ytdl")

// Variables auxiliares
const wm = '💫 𝐒𝐮𝐩𝐞𝐫 𝐁𝐨𝐭 𝐃𝐞 𝐖𝐡𝐚𝐭𝐬𝐚𝐩𝐩 🥳'
const img = [
  'https://i.imgur.com/8tP3LrF.jpg',
  'https://i.imgur.com/WA9bD3M.jpg'
]
const redes = [
  'https://t.me/kanal_grup',
  'https://facebook.com/kanal_facebook'
]
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let handler = async (m, { conn, args, command }) => {
  if (!args[0]) throw '*¿Qué está buscando? 🤔 Ingrese el enlace de YouTube para descargar el audio o video*'

  let youtubeLink = ''
  if (args[0].includes('you')) {
    youtubeLink = args[0]
  } else {
    const index = parseInt(args[0]) - 1
    if (index >= 0 && Array.isArray(global.videoList) && global.videoList.length > 0) {
      const matchingItem = global.videoList.find(item => item.from === m.sender)
      if (matchingItem && index < matchingItem.urls.length) {
        youtubeLink = matchingItem.urls[index]
      } else {
        throw `⚠️ No se encontró un enlace para ese número, ingrese uno entre 1 y ${matchingItem ? matchingItem.urls.length : 0}`
      }
    } else {
      throw `⚠️ No se encontró un enlace para ese número.`
    }
  }

  // Validar enlace básico
  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(youtubeLink)) {
    throw '*Proporcione un enlace válido de YouTube*'
  }

  // Mensaje de espera
  const mensajesAudio = [
    '*⌛ Espere ✋ un momento... Ya estoy descargando tu audio 🍹*',
    '⌛ PROCESANDO...\n*Estoy intentando descargar su audio, espere 🏃‍♂️💨*',
    'Calmao pa, estoy buscando tu canción 😎\n\n*Recuerda colocar bien el nombre de la canción o el link del video de youtube*\n\n> *Si el comando *play no funciona utiliza el comando *ytmp3*'
  ]
  const mensajesVideo = [
    '*⌛ Ya estoy descargando tu Video 🍹*',
    '⌛ PROCESANDO...\n*Estoy intentando descargar su video, espere...*',
    '*Estoy descargando tu video 🔄*\n\n> *Aguarde un momento, por favor*'
  ]

  if (command === 'ytmp3' || command === 'fgmp3') {
    await conn.reply(m.chat, getRandom(mensajesAudio), m, {
      contextInfo: {
        externalAdReply: {
          mediaUrl: youtubeLink,
          mediaType: 1,
          description: null,
          title: wm,
          body: wm,
          previewType: 0,
          thumbnail: getRandom(img),
          sourceUrl: getRandom(redes)
        }
      }
    })
    try {
      const res = await ytmp3(youtubeLink)
      if (res && res.dl_url) {
        await conn.sendMessage(m.chat, { audio: { url: res.dl_url }, mimetype: "audio/mpeg" }, { quoted: m })
        return
      }
    } catch {}
    try {
      const resp = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(youtubeLink)}`)
      const { data } = await resp.json()
      if (data && data.dl) {
        await conn.sendMessage(m.chat, { audio: { url: data.dl }, mimetype: "audio/mpeg" }, { quoted: m })
        return
      }
    } catch {}
    try {
      const info = await ytdl.getInfo(youtubeLink)
      const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' })
      if (format && format.url) {
        await conn.sendMessage(m.chat, { audio: { url: format.url }, fileName: `${info.videoDetails.title}.mp3`, mimetype: "audio/mpeg" }, { quoted: m })
        return
      }
    } catch {}
    await conn.reply(m.chat, '❌ No se pudo descargar el audio.', m)
  }

  if (command === 'ytmp4' || command === 'fgmp4') {
    await conn.reply(m.chat, getRandom(mensajesVideo), m, {
      contextInfo: {
        externalAdReply: {
          mediaUrl: youtubeLink,
          mediaType: 1,
          description: null,
          title: wm,
          body: wm,
          previewType: 0,
          thumbnail: getRandom(img),
          sourceUrl: getRandom(redes)
        }
      }
    })
    try {
      const res = await ytmp4(youtubeLink)
      if (res && res.dl_url) {
        await conn.sendMessage(m.chat, { video: { url: res.dl_url }, mimetype: "video/mp4", caption: '🔰 Aquí está tu video' }, { quoted: m })
        return
      }
    } catch {}
    try {
      const resp = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(youtubeLink)}`)
      const { data } = await resp.json()
      if (data && data.dl) {
        await conn.sendMessage(m.chat, { video: { url: data.dl }, mimetype: "video/mp4", caption: '🔰 Aquí está tu video' }, { quoted: m })
        return
      }
    } catch {}
    try {
      const info = await ytdl.getInfo(youtubeLink)
      const format = ytdl.chooseFormat(info.formats, f => f.container === 'mp4' && f.hasVideo && f.hasAudio)
      if (format && format.url) {
        await conn.sendMessage(m.chat, { video: { url: format.url }, fileName: `${info.videoDetails.title}.mp4`, mimetype: "video/mp4", caption: '🔰 Aquí está tu video' }, { quoted: m })
        return
      }
    } catch {}
    await conn.reply(m.chat, '❌ No se pudo descargar el video.', m)
  }
}

handler.help = ['ytmp4', 'ytmp3']
handler.tags = ['downloader']
handler.command = /^ytmp3|ytmp4|fgmp4|fgmp3$/i
export default handler