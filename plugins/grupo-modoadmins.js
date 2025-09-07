let handler = async (m, { args, conn }) => {
  if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.')

  let chat = global.db.data.chats[m.chat] || {}
  if (!args[0]) return m.reply('⚠️ Usa:\n\n.modoadmin on\n.modoadmin off')

  if (args[0].toLowerCase() === 'on') {
    chat.onlyAdmins = true
    global.db.data.chats[m.chat] = chat
    return m.reply('✅ Modo Admin activado. Solo los administradores podrán usar comandos.')
  }

  if (args[0].toLowerCase() === 'off') {
    chat.onlyAdmins = false
    global.db.data.chats[m.chat] = chat
    return m.reply('✅ Modo Admin desactivado. Todos los miembros pueden usar comandos.')
  }

  return m.reply('⚠️ Usa:\n\n.modoadmin on\n.modoadmin off')
}

handler.command = ['modoadmin']
handler.group = true
handler.admin = true // solo un admin del grupo puede activarlo

export default handler