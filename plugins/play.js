import yts from 'yt-search'

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const chatId = m.chat
    const query = args.join(' ')
    if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m })

    const r = await yts(query)
    const video = r.videos[0]
    if (!video) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m })

    const infoText =
`🎵 *${video.title}*
⏱ Duración: ${video.timestamp}
👁 Vistas: ${video.views}
📺 Canal: ${video.author.name}
📅 Publicado: ${video.ago}\n\n⚠️ No se puede descargar audio directo. Escúchalo aquí: ${video.url}`

    await conn.sendMessage(chatId, { text: infoText }, { quoted: m })

  } catch (err) {
    console.error('Error en .play:', err)
    await conn.sendMessage(m.chat, { text: `❌ Error en .play:\n${err.message || err}` }, { quoted: m })
  }
}

handler.help = ['play']
handler.tags = ['audio']
handler.command = ['play']
export default handler