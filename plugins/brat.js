import Jimp from 'jimp'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✏️ Escribe algo.\nEjemplo:\n${usedPrefix}${command} arrewé\nsimonwe\nvawe`)
  }

  try {
    const width = 512
    const height = 512
    const image = new Jimp(width, height, 0xFFFFFFFF) // fondo blanco

    // Fuentes disponibles en Jimp
    const fonts = {
      big: Jimp.FONT_SANS_128_BLACK,
      medium: Jimp.FONT_SANS_64_BLACK,
      small: Jimp.FONT_SANS_32_BLACK,
      tiny: Jimp.FONT_SANS_16_BLACK
    }

    // Contar caracteres y líneas
    const lines = text.split("\n")
    const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), "")
    const totalChars = longestLine.length

    // Elegir fuente según cantidad de caracteres y líneas
    let fontToUse
    if (totalChars <= 8 && lines.length <= 3) {
      fontToUse = fonts.big
    } else if (totalChars <= 18 && lines.length <= 5) {
      fontToUse = fonts.medium
    } else if (totalChars <= 40) {
      fontToUse = fonts.small
    } else {
      fontToUse = fonts.tiny
    }

    const font = await Jimp.loadFont(fontToUse)

    // Imprimir texto alineado a la izquierda
    image.print(
      font,
      30, // margen X (dejamos un poco de espacio a la izquierda)
      30, // margen Y arriba
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, // 🔥 alineado a la izquierda
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      width - 60, // ancho usable
      height - 60 // alto usable
    )

    // Darle un look más pixelado
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
