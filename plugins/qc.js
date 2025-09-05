import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import Jimp from 'jimp'

async function handler(m, { conn, args }) {
  try {
    const text = args.join(' ') || 'Hola!'

    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/2k0yT2y/default.jpg'
    }

    const image = await Jimp.read(ppUrl)

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    const textImage = new Jimp(image.bitmap.width, image.bitmap.height, 0x00000000)
    textImage.print(font, 10, 10, text)
    textImage.composite(image, 0, 0)

    const buffer = await textImage.getBufferAsync(Jimp.MIME_PNG)

    const sticker = new Sticker(buffer, {
      pack: 'SonicBot',
      author: m.pushName || 'Usuario',
      type: StickerTypes.FULL,
      quality: 100,
      categories: ['🤖', '✨']
    })

    await conn.sendMessage(m.chat, { sticker: sticker.toMessage() }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error creando el sticker')
  }
}

// Esto es clave: export default para que tu main.js lo reconozca
export default handler

// Propiedades que tu main.js necesita
handler.command = ['qc']
handler.help = ['.qc <texto>']
handler.tags = ['sticker']
handler.limit = 2
