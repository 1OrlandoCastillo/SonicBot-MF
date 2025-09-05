import Jimp from 'jimp'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`⚠️ Usa el comando así:\n${usedPrefix}${command} <texto>\n\nEjemplo:\n${usedPrefix}${command} hola soy el brat`)
  }

  try {
    const width = 512
    const height = 512

    const image = new Jimp(width, height, 0xffffffff) // Fondo blanco

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)

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

    const buffer = await image.getBufferAsync(Jimp.MIME_WEBP)

    await conn.sendMessage(m.chat, {
      sticker: buffer
    }, {
      quoted: m
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al generar el sticker.')
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat']
handler.register = true // Si quieres que solo usuarios registrados lo usen
handler.limit = false   // Si quieres poner límite diario, cámbialo a true

export default handler
