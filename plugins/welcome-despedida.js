import { sticker } from '../lib/sticker.js'
import Jimp from 'jimp'

const handler = async (update, { conn }) => {
  try {
    const participants = update.participants || []
    const action = update.action
    const chatId = update.id

    if (!participants || !['add','remove'].includes(action)) return

    // Asegurarse que existe la configuración
    if (!global.db.data.settings?.[chatId]) {
      global.db.data.settings[chatId] = {
        welcome: true,
        despedida: true,
        welcomeMsg: '👋 ¡Bienvenido %user% al grupo %group%!',
        despedidaMsg: '👋 %user% ha salido del grupo %group%.'
      }
      await global.db.write()
    }

    const groupSettings = global.db.data.settings[chatId]
    const groupName = (await conn.groupMetadata(chatId))?.subject || 'este grupo'

    for (let user of participants) {
      const nombre = await conn.getName(user)
      let msgText = ''

      if (action === 'add' && groupSettings.welcome) {
        msgText = (groupSettings.welcomeMsg).replace(/%user%/g, nombre).replace(/%group%/g, groupName)
      } else if (action === 'remove' && groupSettings.despedida) {
        msgText = (groupSettings.despedidaMsg).replace(/%user%/g, nombre).replace(/%group%/g, groupName)
      } else continue

      // Foto de perfil
      let avatar
      try { avatar = await conn.profilePictureUrl(user, 'image') } 
      catch { avatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png' }

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
    console.error('❌ Error en welcome/despedida:', e)
  }
}

handler.event = 'group-participants.update'
export default handler
