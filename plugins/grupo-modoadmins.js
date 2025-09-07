// --- Filtro para Modo Admin ---
if (m.isGroup) {
  let chat = global.db.data.chats[m.chat] || {}

  if (chat.onlyAdmins) {
    // verificar si es admin en el grupo
    let isAdmin = participants.find(p => this.decodeJid(p.id) === m.sender)?.admin
    if (!isAdmin) {
      // inicializamos memoria de notificaciones por grupo
      chat.notifiedUsers = chat.notifiedUsers || {}

      if (!chat.notifiedUsers[m.sender]) {
        chat.notifiedUsers[m.sender] = true
        await this.reply(m.chat, '⚠️ Este bot está en *Modo Admin*.\nSolo los administradores pueden usar comandos.', m)
      }

      return // 🔒 corta aquí y no ejecuta más plugins
    }
  } else {
    // resetear notificaciones cuando se desactiva el modo
    if (chat.notifiedUsers) chat.notifiedUsers = {}
  }
}
// --- Fin filtro Modo Admin ---