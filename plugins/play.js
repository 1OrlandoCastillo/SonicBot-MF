import play from 'play-dl'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const chatId = m.chat
    const query = args.join(' ')
    if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m })

    // Buscar video en YouTube
    const r = await yts(query)
    const video = r.videos[0]
    if (!video) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m })

    // Asegurar carpeta tmp
    const tmpDir = path.join('./tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    // Mostrar info de la canción
    const infoText = 
`🎵 *${video.title}*
⏱ Duración: ${video.timestamp}
👁 Vistas: ${video.views}
📺 Canal: ${video.author.name}
📅 Publicado: ${video.ago}\n\n⏳ Descargando audio...`
    await conn.sendMessage(chatId, { text: infoText }, { quoted: m })

    // Descargar audio con play-dl
    const stream = await play.stream(video.url)
    const audioPath = path.join(tmpDir, `${video.videoId}.mp3`)
    const writeStream = fs.createWriteStream(audioPath)
    stream.stream.pipe(writeStream)

    // Esperar fin de descarga
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // Verificar tamaño antes de enviar (WhatsApp máx ~16 MB)
    const stats = fs.statSync(audioPath)
    if (stats.size > 16 * 1024 * 1024) {
      fs.unlinkSync(audioPath)
      return conn.sendMessage(chatId, { text: '⚠️ El audio es demasiado pesado para enviarlo por WhatsApp.' }, { quoted: m })
    }

    // Enviar audio
    await conn.sendMessage(chatId, {
      audio: fs.readFileSync(audioPath),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
    }, { quoted: m })

    // Eliminar archivo temporal
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