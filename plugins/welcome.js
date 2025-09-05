import { sticker } from '../lib/sticker.js'
import Jimp from 'jimp'

const handler = async (m, { conn }) => {
  try {
    const chatId = m.id || m.key.remoteJid
    const groupSettings = global.db.data.settings?.[chatId]
    if (!groupSettings?.welcome) return

    if (!m?.participants) return

    for (let user of m.participants) {
      if (m.action !== 'add') continue

      const nombre = await conn.getName(user)
      const groupName = (await conn.groupMetadata(chatId))?.subject || 'este grupo'
      const message = (groupSettings.welcomeMsg || '👋 ¡Bienvenido %user%!').replace(/%user%/g, nombre).replace(/%group%/g, groupName)

      // Sticker simple con fondo negro y nombre
      const image = new Jimp(512, 512, 0x000000ff)
      const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
      image.print(font, 0, 200, { text: nombre, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER })

      const buffer = await image.getBufferAsync(Jimp.MIME_PNG)
      const stiker = await sticker(buffer, false, global.packname || 'SonicBot', global.author || 'SonicBot')

      await conn.sendMessage(chatId, { text: message })
      await conn.sendMessage(chatId, { sticker: stiker })
    }
  } catch (e) {
    console.error('❌ Error en welcome:', e)
  }
}

handler.event = 'group-participants.update'
export default handler
