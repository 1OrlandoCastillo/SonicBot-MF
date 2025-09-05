import Jimp from 'jimp'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✏️ Escribe algo.\nEjemplo:\n${usedPrefix}${command} arrewé\nsimonwe\nvawe`)
  }

  try {
    const width = 512
    const height = 512
    const image = new Jimp(width, height, 0xFFFFFFFF) // fondo blanco

    // Fuente estilo pixeleada y oscura (Jimp trae una por defecto)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)

    // Dibujar texto alineado a la izquierda, arriba
    image.print(
      font,
      20,  // margen X
      20,  // margen Y
      {
        text: text, // respeta saltos de línea (\n)
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      width - 40,  // espacio usable
      height - 40
    )

    // Para darle un look más “pixelado”
    image.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR)

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG)

    // Mandar como sticker
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
