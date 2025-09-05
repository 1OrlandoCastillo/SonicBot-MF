import { sticker } from '../lib/sticker.js'
import Jimp from 'jimp'
import axios from 'axios'

const handler = async (update, { conn }) => {
  try {
    const { id: chatId, participants, action } = update
    if (!participants || action !== 'add') return // solo entradas

    // Configuración del grupo
    const settings = global.db.data.settings?.[chatId] || {}
    if (!settings.welcome) return // si welcome está desactivado, no hacer nada

    const groupName = (await conn.groupMetadata(chatId))?.subject || 'este grupo'

    for (let user of participants) {
      const nombre = await conn.getName(user)
      const msgText = (settings.welcomeMsg || '👋 ¡Bienvenido %user% a %group%!').replace(/%user%/g, nombre).replace(/%group%/g, groupName)

      // Intentar obtener foto de perfil
      let avatar
      try {
        avatar = await conn.profilePictureUrl(user, 'image')
      } catch {
        avatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
      }

      // Sticker con Jimp
      const image = await Jimp.read(avatar)
      image.cover(512, 512)
      const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
      image.print(font, 0, 400, { text: nombre, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER })

      const buffer = await image.getBufferAsync(Jimp.MIME_PNG)
      const stiker = await sticker(buffer, false, global.packname || 'SonicBot', global.author || 'SonicBot')

      await conn.sendMessage(chatId, { text: msgText })
      await conn.sendMessage(chatId, { sticker: stiker })
    }

  } catch (e) {
    console.error('❌ Error en welcome:', e)
  }
}

handler.event = 'group-participants.update'
export default handler
