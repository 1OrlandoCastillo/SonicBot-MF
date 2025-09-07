// plugins/grupo-modoadmin.js

let handler = async (m, { args }) => {
  let chat = global.db.data.chats[m.chat] || {}
  global.db.data.chats[m.chat] = chat

  if (!args[0]) {
    return m.reply(`⚠️ Usa:\n\n.modoadmin on\n.modoadmin off`)
  }

  if (args[0].toLowerCase() === 'on') {
    chat.onlyAdmins = true
    return m.reply('✅ Modo solo *admins* activado en este grupo.')
  }

  if (args[0].toLowerCase() === 'off') {
    chat.onlyAdmins = false
    return m.reply('❎ Modo solo *admins* desactivado en este grupo.')
  }

  m.reply('⚠️ Opción inválida. Usa:\n\n.modoadmin on\n.modoadmin off')
}

handler.help = ['modoadmin <on/off>']
handler.tags = ['grupo']
handler.command = /^modoadmin$/i
handler.group = true
handler.admin = true // solo admins pueden activarlo/desactivarlo
handler.botAdmin = false

export default handler