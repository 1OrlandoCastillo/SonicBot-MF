import ytdl from 'ytdl-core'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const chatId = m.chat
    const query = args.join(' ')
    if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m })

    // Buscar video en YouTube
    const r = await yts(query)
    const video = r.videos[0]
    if (!video) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m })

    // Carpeta temporal
    const tmpDir = path.join('./tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const audioPath = path.join(tmpDir, `${video.videoId}.mp3`)

    // Info de la canción
    const infoText =
`🎵 *${video.title}*
⏱ Duración: ${video.timestamp}
👁 Vistas: ${video.views}
📺 Canal: ${video.author.name}
📅 Publicado: ${video.ago}\n\n⏳ Descargando audio...`
    await conn.sendMessage(chatId, { text: infoText }, { quoted: m })

    // Descargar video completo y extraer audio con ffmpeg
    await new Promise((resolve, reject) => {
      const stream = ytdl(video.url, { quality: 'highestvideo' })
      const ffmpegProcess = spawn('ffmpeg', [
        '-i', 'pipe:3',
        '-vn',              // sin video
        '-ar', '44100',     // frecuencia de audio
        '-ac', '2',         // canales
        '-b:a', '128k',     // bitrate
        '-f', 'mp3',
        audioPath
      ], {
        stdio: ['inherit', 'inherit', 'inherit', 'pipe']
      })
      stream.pipe(ffmpegProcess.stdio[3])

      ffmpegProcess.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error(`ffmpeg salió con código ${code}`))
      })
    })

    // Revisar tamaño máximo de WhatsApp (~16MB)
    const stats = fs.statSync(audioPath)
    if (stats.size > 16 * 1024 * 1024) {
      fs.unlinkSync(audioPath)
      return conn.sendMessage(chatId, { text: `⚠️ El audio es demasiado pesado para WhatsApp. Escúchalo aquí: ${video.url}` }, { quoted: m })
    }

    // Enviar audio
    await conn.sendMessage(chatId, {
      audio: fs.readFileSync(audioPath),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
    }, { quoted: m })

    // Borrar archivo temporal
    fs.unlinkSync(audioPath)

  } catch (err) {
    console.error('Error en .play:', err)
    await conn.sendMessage(m.chat, { text: `❌ Error en .play:\n${err.message || err}` }, { quoted: m })
  }
}

handler.help = ['play']
handler.tags = ['audio']
handler.command = ['play']
export default handler