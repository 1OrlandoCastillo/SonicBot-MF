import Jimp from 'jimp'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✏️ Escribe algo.\nEjemplo:\n${usedPrefix}${command} arrewé\nsimonwe\nvawe`)
  }

  try {
    const width = 512
    const height = 512
    const image = new Jimp(width, height, 0xFFFFFFFF) // fondo blanco

    // Fuente
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK) // más grande y legible

    // Imprimir texto con saltos de línea
    image.print(
      font,
      0,
      0,
      {
        text: text, // si mandas "arrewé\nsimonwe\nvawe" lo coloca igual que tu imagen
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      width,
      height
    )

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG)

    // Convertir a sticker (webp)
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
