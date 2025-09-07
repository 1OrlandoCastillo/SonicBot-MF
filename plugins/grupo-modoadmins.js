// plugins/modoadmin.js

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  let chat = global.db.data.chats[m.chat] || {}
  if (!args[0]) {
    return m.reply('⚙️ Uso correcto:\n.modoadmin on\n.modoadmin off')
  }

  if (args[0] === 'on') {
    chat.onlyAdmins = true
    global.db.data.chats[m.chat] = chat
    return m.reply('✅ *Modo Admin* activado.\nSolo los administradores podrán usar comandos.')
  }

  if (args[0] === 'off') {
    chat.onlyAdmins = false
    global.db.data.chats[m.chat] = chat
    return m.reply('❎ *Modo Admin* desactivado.\nTodos los miembros pueden usar comandos.')
  }
}

handler.command = 'modoadmin'
handler.group = true
handler.admin = true

export default handler