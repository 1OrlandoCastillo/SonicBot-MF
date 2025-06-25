import fetch from "node-fetch"

let isDownloadingArtist = false

async function downloadTrack(youtubeUrl) {
  try {
    const encodedUrl = encodeURIComponent(youtubeUrl)
    const apiUrl = `https://mahiru-shiina.vercel.app/download/ytmp3?url=${encodedUrl}`
    const response = await fetch(apiUrl)
    const json = await response.json()
    if (!json.status || !json.data) throw new Error("API inválida")
    const downloadUrl = json.data.author?.download || json.data.download
    const title = json.data.title || "audio"
    if (!downloadUrl) throw new Error("No se encontró el enlace de descarga")
    const audioResponse = await fetch(downloadUrl)
    const audioBuffer = await audioResponse.buffer()
    return { audioBuffer, title }
  } catch (error) {
    throw error
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (command.toLowerCase() !== "artista") return
  if (isDownloadingArtist) {
    return conn.sendMessage(m.chat, { text: "⚠️ Ya hay una descarga en curso, No interrumpas el proceso" })
  }
  if (!text || text.trim().length === 0) {
    return conn.sendMessage(m.chat, { text: `//mahiru-shiina.vercel.app/download/ytmp3?url=${encodedUrl}`
    const response = await fetch(apiUrl)
    const json = await response.json()
    if (!json.status || !json.data) throw new Error("API inválida")
    const downloadUrl = json.data.author?.download || json.data.download
    const title = json.data.title || "audio"
    if (!downloadUrl) throw new Error("No se encontró el enlace de descarga")
    const audioResponse = await fetch(downloadUrl)
    const audioBuffer = await audioResponse.buffer()
    return { audioBuffer, title }
  } catch (error) {
    throw error
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (command.toLowerCase() !== "artista") return
  if (isDownloadingArtist) {
    return conn.sendMessage(m.chat, { text: "⚠️ Ya hay una descarga en curso, No interrumpas el proceso" })
  }
  if (!text || text.trim().length === 0) {
    return conn.sendMessage(m.chat, { text: `⚠️ *Atención*\n\n💡 Debes proporcionar el nombre del artista.\n📌 Ejemplo: ${usedPrefix}artista TWICE` })
  }

  isDownloadingArtist = true
  await conn.sendMessage(m.chat, { text: "🌵 *Iniciando descarga de el artista solicitado.*\n\n⚔️ Por favor, no interrumpas el proceso" })

  const searchUrl = (`https://delirius-apiofc.vercel.app/search/searchtrack?q=${encodeURIComponent(text)}`)
  let searchResults
  try {
    const response = await fetch(searchUrl)
    searchResults = await response.json()
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      isDownloadingArtist = false
      return conn.sendMessage(m.chat, { text: "⚠️ No se encontraron resultados para ese artista" })
    }
  } catch (error) {
    isDownloadingArtist = false
    return conn.sendMessage(m.chat, { text: `❌ *Error al buscar música:* ${error.message || "Desconocido"}` })
  }

  const tracks = searchResults.slice(0, 5)
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    try {
      const { audioBuffer, title } = await downloadTrack(track.url)
      await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: "audio/mpeg", fileName: `${title}.mp3`, ptt: true, caption: `> 🔥 *${track.title}*\n> 👤 *Artista:* ${track.artist}\n> 💽 *Álbum:* ${track.album || "Desconocido"}` }, { quoted: m })
    } catch (error) {
      console.error(`Error al descargar "${track.title}":`, error)
    }
  }

  isDownloadingArtist = false
  await conn.sendMessage(m.chat, { text: "📍 *Descargas Finalizadas Exitosamente*" })
}

handler.command = ["artista"]
export default handler