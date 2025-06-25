// Código hecho por Ado [ Wirk ] 
// github.com/Im-Ado
// Deja créditos
import fetch from "node-fetch"

let isDownloadingArtist = false

async function downloadTrack(youtubeUrl) {
  const encodedUrl = encodeURIComponent(youtubeUrl)
  const primaryAPI = `https://mahiru-shiina.vercel.app/download/ytmp3?url=${encodedUrl}`
  const backupAPI = `https://api.vreden.my.id/api/ytmp3?url=${encodedUrl}`
  let resultJson = null
  let lastError = null
  const maxAttempts = 2
  let usedAPI = 'primary'

  // API primaria
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(primaryAPI)
      const json = await response.json()
      if (!json.status || !json.data) throw new Error("API primaria inválida.")
      resultJson = json
      break
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) continue
    }
  }

  // API de respaldo si falla la principal
  if (!resultJson) {
    usedAPI = 'backup'
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(backupAPI)
        const json = await response.json()
        if (json.status !== 200 || !json.result || !json.result.download)
          throw new Error("API de respaldo inválida.")
        resultJson = json
        break
      } catch (error) {
        lastError = error
        if (attempt < maxAttempts) continue
      }
    }
  }

  if (!resultJson) throw lastError

  let downloadUrl, title
  if (resultJson.data) {
    downloadUrl = resultJson.data.author?.download || resultJson.data.download
    title = resultJson.data.title || "audio"
  } else if (resultJson.result) {
    downloadUrl = resultJson.result.download?.url
    title = resultJson.result.metadata?.title || "audio"
  }

  if (!downloadUrl) throw new Error("No se encontró el enlace de descarga.")

  title = title.replace(/[^\w\s]/gi, '').substring(0, 60)

  let audioBuffer
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const audioResponse = await fetch(downloadUrl)
      if (!audioResponse.ok)
        throw new Error(`Código: ${audioResponse.status}`)
      audioBuffer = await audioResponse.buffer()
      break
    } catch (error) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 500))
    }
  }

  if (!audioBuffer && usedAPI === 'primary') {
    usedAPI = 'backup'
    resultJson = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(backupAPI)
        const json = await response.json()
        if (json.status !== 200 || !json.result || !json.result.download)
          throw new Error("Backup API inválida.")
        resultJson = json
        break
      } catch (error) {
        if (attempt < 2) continue
      }
    }

    if (resultJson && resultJson.result) {
      downloadUrl = resultJson.result.download?.url
      title = resultJson.result.metadata?.title || "audio"
      title = title.replace(/[^\w\s]/gi, '').substring(0, 60)

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const audioResponse = await fetch(downloadUrl)
          if (!audioResponse.ok)
            throw new Error(`Código: ${audioResponse.status}`)
          audioBuffer = await audioResponse.buffer()
          break
        } catch (error) {
          if (attempt < 2) await new Promise(r => setTimeout(r, 500))
        }
      }
    }
  }

  if (!audioBuffer) throw new Error("No se pudo descargar el audio.")

  return { audioBuffer, title }
}

// 🧩 Handler principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (command.toLowerCase() !== "artista") return

  if (isDownloadingArtist) {
    return conn.sendMessage(m.chat, {
      text: "⚠️ Ya hay una descarga en curso, No interrumpas el proceso."
    })
  }

  if (!text || text.trim().length === 0) {
    return conn.sendMessage(m.chat, {
      text: `⚠️ *Atención*\n\n💡 Debes proporcionar el nombre del artista.\n📌 Ejemplo: ${usedPrefix}artista TWICE`
    })
  }

  isDownloadingArtist = true

  await conn.sendMessage(m.chat, {
    text: "🌵 *Iniciando descarga de el artista solicitado.*\n\n⚔️ Por favor, no interrumpas el proceso."
  })

  const searchUrl = `https://delirius-apiofc.vercel.app/search/searchtrack?q=${encodeURIComponent(text)}`
  let searchResults
  try {
    const response = await fetch(searchUrl)
    searchResults = await response.json()
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      isDownloadingArtist = false
      return conn.sendMessage(m.chat, {
        text: "⚠️ No se encontraron resultados para ese artista."
      })
    }
  } catch (error) {
    isDownloadingArtist = false
    return conn.sendMessage(m.chat, {
      text: `❌ *Error al buscar música:* ${error.message || "Desconocido"}`
    })
  }

  const tracks = searchResults.slice(0, 10)
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    try {
      const { audioBuffer, title } = await downloadTrack(track.url)
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        ptt: true, 
        caption: `> 🔥 *${track.title}*\n> 👤 *Artista:* ${track.artist}\n> 💽 *Álbum:* ${track.album || "Desconocido"}`
      }, { quoted: m })
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error al descargar "${track.title}":`, error)
      continue
    }
  }

  isDownloadingArtist = false

  await conn.sendMessage(m.chat, {
    text: "📍 *Descargas Finalizadas Exitosamente.*"
  })
}

handler.command = ['artista']
export default handler
