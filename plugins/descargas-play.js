import fetch from "node-fetch"
import yts from 'yt-search'
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const namebot = 'SonicBot'
const dev = 'Desarrollador'

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(m.chat, `❀ Por favor, ingresa el nombre de la música a descargar.`, m)
    }

    let videoIdToFind = text.match(youtubeRegexID)
    let ytsearch = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text)

    // Busca resultado exacto si es por ID
    let ytplay2 = null
    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytsearch.all?.find(item => item.videoId === videoId) || ytsearch.videos?.find(item => item.videoId === videoId)
    }
    ytplay2 = ytplay2 || ytsearch.all?.[0] || ytsearch.videos?.[0] || ytsearch

    if (!ytplay2 || typeof ytplay2 !== "object") {
      return m.reply('✧ No se encontraron resultados para tu búsqueda.')
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    title = title || 'no encontrado'
    thumbnail = (thumbnail && thumbnail.startsWith('http')) ? thumbnail : null
    timestamp = timestamp || 'no encontrado'
    views = views || 'no encontrado'
    ago = ago || 'no encontrado'
    url = url || 'no encontrado'
    author = author || {}

    const vistas = formatViews(views)
    const canal = author?.name || 'Desconocido'
    const infoMessage = 
      `「✦」Descargando *<${title || 'Desconocido'}>*\n\n` +
      `> ✧ Canal » *${canal}*\n> ✰ Vistas » *${vistas || 'Desconocido'}*\n` +
      `> ⴵ Duración » *${timestamp || 'Desconocido'}*\n> ✐ Publicado » *${ago || 'Desconocido'}*\n> 🜸 Link » ${url}`

    let thumb = null
    if (thumbnail) {
      try {
        thumb = (await conn.getFile(thumbnail))?.data
      } catch (e) {
        thumb = null
      }
    }

    const JT = {
      contextInfo: {
        externalAdReply: {
          title: namebot,
          body: dev,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, infoMessage, m, JT)    

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        const api = await (await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)).json()
        const resulta = api.result
        const result = resulta?.download?.url    
        if (!result) throw new Error('⚠ El enlace de audio no se generó correctamente.')
        await conn.sendMessage(m.chat, { audio: { url: result }, fileName: `${resulta?.title || title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m })
      } catch (e) {
        return conn.reply(m.chat, '⚠︎ No se pudo enviar el audio. Esto puede deberse a que el archivo es demasiado pesado o a un error en la generación de la URL. Por favor, intenta nuevamente más tarde.', m)
      }
    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      try {
        const response = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`)
        const json = await response.json()
        if (!json?.data?.url) throw new Error('No se encontró la URL del video.')
        await conn.sendFile(m.chat, json.data.url, (json.title || title) + '.mp4', title, m)
      } catch (e) {
        return conn.reply(m.chat, '⚠︎ No se pudo enviar el video. Esto puede deberse a que el archivo es demasiado pesado o a un error en la generación de la URL. Por favor, intenta nuevamente más tarde.', m)
      }
    } else {
      return conn.reply(m.chat, '✧︎ Comando no reconocido.', m)
    }
  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error}`)
  }
}
handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = true

export default handler

function formatViews(views) {
  if (views === undefined || views === 'no encontrado') {
    return "No disponible"
  }
  if (typeof views === "string") return views
  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  } else if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  }
  return views.toString()
}