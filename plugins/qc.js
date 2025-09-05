import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import Jimp from 'jimp'

// Función para convertir nombre de color a hex (puedes expandir la lista)
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
  return colors[color.toLowerCase()] || '#FFFFFF'
}

async function handler(m, { conn, args }) {
  try {
    if (!args[0]) return m.reply('Usa: .qc <texto> [color]')

    const text = args[0]
    const color = args[1] ? colorToHex(args[1]) : '#FFFFFF'

    // Obtener foto de perfil
    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      ppUrl = 'https://i.ibb.co/2k0yT2y/default.jpg'
    }

    const image = await Jimp.read(ppUrl)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE) // tamaño más grande

    // Crear imagen temporal para el texto
    const textImage = new Jimp(image.bitmap.width, image.bitmap.height, 0x00000000)
    
    // Pintar texto
    textImage.print(font, 20, 20, {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP
    }, image.bitmap.width - 40, image.bitmap.height - 40)

    // Cambiar color del texto
    textImage.scan(0, 0, textImage.bitmap.width, textImage.bitmap.height, function(x, y, idx) {
      if (this.bitmap.data[idx+3] > 0) { // si no es transparente
        this.bitmap.data[idx+0] = parseInt(color.slice(1,3),16) // R
        this.bitmap.data[idx+1] = parseInt(color.slice(3,5),16) // G
        this.bitmap.data[idx+2] = parseInt(color.slice(5,7),16) // B
      }
    })

    // Combinar imagen con texto
    image.composite(textImage, 0, 0)

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG)

    // Crear sticker
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

export default handler
handler.command = ['qc']
handler.help = ['.qc <texto> [color]']
handler.tags = ['sticker']
handler.limit = 2
