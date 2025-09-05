import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import Jimp from 'jimp'

export async function handler(m, { conn, args }) {
  try {
    // 1. Texto del sticker
    const text = args.join(' ') || 'Hola!'

    // 2. Obtener foto de perfil
    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/2k0yT2y/default.jpg' // foto default si no tiene
    }

    // 3. Cargar imagen
    const image = await Jimp.read(ppUrl)

    // 4. Configurar color y tamaño
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE) // blanco por defecto
    const color = '#ff0000' // rojo por defecto
    const textImage = new Jimp(image.bitmap.width, image.bitmap.height, 0x00000000)

    // Dibujar texto en la imagen
    textImage.print(font, 10, 10, text) // posición x=10, y=10
    textImage.composite(image, 0, 0) // poner foto sobre el texto

    // Guardar temporalmente
    const buffer = await textImage.getBufferAsync(Jimp.MIME_PNG)

    // 5. Crear sticker
    const sticker = new Sticker(buffer, {
      pack: 'SonicBot',
      author: m.pushName || 'Usuario',
      type: StickerTypes.FULL,
      quality: 100,
      categories: ['🤖', '✨']
    })

    // 6. Enviar sticker
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
