import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import Jimp from 'jimp'

export default async function handler(m, { conn, args }) {
  try {
    const text = args.join(' ') || 'Hola!'

    // Obtener foto de perfil del usuario
    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/2k0yT2y/default.jpg' // foto por defecto
    }

    const image = await Jimp.read(ppUrl)

    // Fuente para el texto
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK) // texto oscuro

    // Crear imagen final con un poco de espacio para texto
    const padding = 50
    const finalImage = new Jimp(image.bitmap.width, image.bitmap.height + padding, 0x00000000)
    finalImage.composite(image, 0, 0)

    // Escribir el texto en la parte inferior
    finalImage.print(
      font,
      0,
      image.bitmap.height + 5,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      image.bitmap.width,
      padding
    )

    // Escribir el nombre del usuario encima de la imagen
    finalImage.print(
      font,
      0,
      5,
      {
        text: m.pushName || 'Usuario',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      image.bitmap.width,
      40
    )

    const buffer = await finalImage.getBufferAsync(Jimp.MIME_PNG)

    // Crear sticker
    const sticker = new Sticker(buffer, {
      pack: 'SonicBot',
      author: 'SonicBot',
      type: StickerTypes.FULL,
      quality: 100,
    })

    await conn.sendMessage(m.chat, { sticker: sticker.toMessage() }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error creando el sticker')
  }
}

handler.command = ['qc']
handler.help = ['.qc <texto>']
handler.tags = ['sticker']
handler.limit = 2
