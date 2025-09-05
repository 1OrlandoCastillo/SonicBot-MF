import Jimp from 'jimp'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✏️ Escribe un texto para crear el sticker.\nEjemplo:\n${usedPrefix}${command} soy el brat`)
  }

  try {
    // Crear imagen en blanco
    const width = 512
    const height = 512
    const image = new Jimp(width, height, 0xFFFFFFFF) // blanco

    // Cargar fuente
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)

    // Escribir texto centrado
    image.print(
      font,
      10,
      10,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      width - 20,
      height - 20
    )

    // Convertir a webp
    const stickerBuffer = await image.getBufferAsync(Jimp.MIME_WEBP)

    // Enviar como sticker
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })

  } catch (e) {
    console.error('Error en .brat:', e)
    m.reply('❌ Error al generar el sticker.')
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat']
handler.limit = false

export default handler
