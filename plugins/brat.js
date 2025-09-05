import Jimp from 'jimp'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✏️ Escribe algo.\nEjemplo:\n${usedPrefix}${command} soy el brat`)
  }

  try {
    const width = 512
    const height = 512
    const image = new Jimp(width, height, 0xFFFFFFFF) // fondo blanco

    // Fuente (asegúrate de tener esta fuente)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)

    // Imprimir texto centrado
    image.print(
      font,
      0,
      0,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      width,
      height
    )

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG) // PNG primero

    // Convertir a sticker (webp) usando sticker format compatible
    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error al crear el sticker.')
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat']
handler.limit = false

export default handler
