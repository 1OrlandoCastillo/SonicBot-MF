import { sticker } from '../lib/sticker.js'
import Jimp from 'jimp'

const handler = async (m, { conn }) => {
  try {
    if (!m?.participants) return

    for (let user of m.participants) {
      if (m.action === 'remove') { // Usuario salió del grupo
        const chatId = m.id || m.key.remoteJid
        const nombre = await conn.getName(user)

        // Sticker simple con fondo negro y nombre
        const image = new Jimp(512, 512, 0x000000ff)
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
        image.print(
          font,
          0,
          200,
          { text: `Adiós\n${nombre}`, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }
        )

        const buffer = await image.getBufferAsync(Jimp.MIME_PNG)
        const stiker = await sticker(buffer, false, global.packname || 'SonicBot', global.author || 'SonicBot')

        // Mensaje de despedida
        await conn.sendMessage(chatId, { text: `👋 ${nombre} ha salido del grupo.` })
        await conn.sendMessage(chatId, { sticker: stiker })
      }
    }
  } catch (e) {
    console.error('❌ Error en goodbye:', e)
  }
}

handler.event = 'group-participants.update'
export default handler
