import Jimp from 'jimp'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

const handler = async (m, { conn, args }) => {
  try {
    const text = args.join(' ') || (m.quoted && m.quoted.text) || 'Hola!'
    if (text.length > 40) return conn.reply(m.chat, '🚩 El texto no puede tener más de 40 caracteres', m)

    // Obtener foto de perfil
    let pp
    try {
      pp = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      pp = 'https://i.ibb.co/2k0yT2y/default.jpg' // foto por defecto
    }

    const nombre = await conn.getName(m.sender)

    // Cargar imagen
    const image = await Jimp.read(pp)

    // Crear fuente
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)

    // Definir espacio para el texto debajo de la imagen
    const padding = 60
    const finalImage = new Jimp(image.bitmap.width, image.bitmap.height + padding, 0x000000ff) // fondo negro
    finalImage.composite(image, 0, 0)

    // Escribir nombre arriba
    finalImage.print(
      font,
      0,
      5,
      {
        text: nombre,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      image.bitmap.width,
      40
    )

    // Escribir texto debajo
    finalImage.print(
      font,
      0,
      image.bitmap.height + 5,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      image.bitmap.width,
      padding
    )

    // Convertir a buffer
    const buffer = await finalImage.getBufferAsync(Jimp.MIME_PNG)

    // Crear sticker
    const stiker = new Sticker(buffer, {
      pack: global.packname || 'SonicBot',
      author: global.author || 'SonicBot',
      type: StickerTypes.FULL,
      quality: 100
    })

    await conn.sendMessage(m.chat, { sticker: stiker.toMessage() }, { quoted: m })
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Ocurrió un error creando el sticker', m)
  }
}

handler.command = /^qc$/i
handler.help = ['qc <texto>']
handler.tags = ['sticker']
handler.limit = 2

export default handler
