import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import Jimp from 'jimp'

function colorToHex(color) {
  const colors = {
    rojo: '#FF0000',
    verde: '#00FF00',
    azul: '#0000FF',
    blanco: '#FFFFFF',
    negro: '#000000',
    amarillo: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
  }
  return colors[color?.toLowerCase()] || '#FFFFFF'
}

export default async function handler(m, { conn, args }) {
  try {
    if (!args[0]) return m.reply('Usa: .qc <texto> [color]')

    const text = args[0]
    const color = colorToHex(args[1])

    // Obtener foto de perfil
    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/2k0yT2y/default.jpg'
    }

    const image = await Jimp.read(ppUrl)

    // Crear fuente blanca (no hay que manipular píxeles manualmente)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)

    // Añadir texto debajo de la imagen
    const textHeight = 80
    const newHeight = image.bitmap.height + textHeight
    const newImage = new Jimp(image.bitmap.width, newHeight, 0x00000000)
    newImage.composite(image, 0, 0)

    newImage.print(
      font,
      0,
      image.bitmap.height + 10,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      image.bitmap.width,
      textHeight
    )

    // Cambiar color del texto con blend
    newImage.color([{ apply: 'xor', params: [color] }])

    const buffer = await newImage.getBufferAsync(Jimp.MIME_PNG)

    const sticker = new Sticker(buffer, {
      pack: 'SonicBot',
      author: m.pushName || 'Usuario',
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
handler.help = ['.qc <texto> [color]']
handler.tags = ['sticker']
handler.limit = 2
