let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.')

  let chat = global.db.data.chats[m.chat] || {}

  if (!args[0]) {
    return m.reply(`⚙️ Uso correcto:\n\n${usedPrefix + command} on\n${usedPrefix + command} off\n\n📌 Estado actual: *${chat.onlyAdmins ? 'ON ✅' : 'OFF ❌'}*`)
  }

  let option = args[0].toLowerCase()
  if (option === 'on') {
    if (chat.onlyAdmins) {
      return m.reply('⚠️ El *Modo Admin* ya estaba activado.')
    }
    chat.onlyAdmins = true
    m.reply('✅ *Modo Admin activado*\nSolo administradores podrán usar comandos.')
  } else if (option === 'off') {
    if (!chat.onlyAdmins) {
      return m.reply('⚠️ El *Modo Admin* ya estaba desactivado.')
    }
    chat.onlyAdmins = false
    m.reply('❌ *Modo Admin desactivado*\nTodos los miembros pueden usar comandos.')
  } else {
    m.reply(`⚠️ Opción no válida.\n\nUsa:\n${usedPrefix + command} on\n${usedPrefix + command} off`)
  }
}

handler.help = ['modoadmin on/off']
handler.tags = ['grupo']
handler.command = ['modoadmin']   // texto plano, sin regex
handler.group = true
handler.admin = true

export default handler