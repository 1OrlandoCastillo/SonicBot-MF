import Jimp from 'jimp'
import { writeExif } from './lib/sticker.js'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✏️ Escribe algo.\nEjemplo:\n${usedPrefix}${command} arrewé\nsimonwe\nvawe`)
  }

  try {
    const width = 512
    const height = 512
    const image = new Jimp(width, height, 0xFFFFFFFF)

    // fuentes
    const fonts = {
      big: Jimp.FONT_SANS_128_BLACK,
      medium: Jimp.FONT_SANS_64_BLACK,
      small: Jimp.FONT_SANS_32_BLACK,
      tiny: Jimp.FONT_SANS_16_BLACK
    }

    const lines = text.split("\n")
    const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), "")
    const totalChars = longestLine.length

    let fontToUse
    if (totalChars <= 8 && lines.length <= 3) fontToUse = fonts.big
    else if (totalChars <= 18 && lines.length <= 5) fontToUse = fonts.medium
    else if (totalChars <= 40) fontToUse = fonts.small
    else fontToUse = fonts.tiny

    const font = await Jimp.loadFont(fontToUse)

    // texto alineado a la izquierda y centrado verticalmente
    image.print(
      font,
      30,
      0,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      width - 60,
      height
    )

    image.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR)

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG)

    // generar sticker con metadata (EXIF)
    const sticker = await writeExif(buffer, 'hecho por', 'AdriBot el mejor')

    // enviar como archivo webp (para que todos lo vean)
    await conn.sendMessage(m.chat, { sticker }, { quoted: m })

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
