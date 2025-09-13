// plugins/welcome-despedida.js
export default {
  command: ['setwelcome', 'setdespedida', 'welcome', 'despedida'],
  tags: ['group'],
  help: [
    '.setwelcome <texto>',
    '.setdespedida <texto>',
    '.welcome on/off',
    '.despedida on/off'
  ],

  async handler(m, { conn, text, command, args, isAdmin, isOwner }) {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos')
    if (!isAdmin && !isOwner) return m.reply('❌ Solo los administradores pueden usar este comando')

    const chatId = m.chat

    // 🔹 Siempre inicializar la configuración si no existe
    if (!global.db.data.chats[chatId]) {
      global.db.data.chats[chatId] = {
        welcome: { text: '👋 Bienvenido @user', enabled: false },
        bye: { text: '👋 Adiós @user', enabled: false }
      }
    }

    let chatConfig = global.db.data.chats[chatId]

    switch (command) {
      case 'setwelcome':
        if (!text) return m.reply('⚠️ Escribe el mensaje de bienvenida.\nEjemplo: `.setwelcome Bienvenido @user al grupo`')
        chatConfig.welcome.text = text
        m.reply('✅ Mensaje de bienvenida actualizado:\n' + text)
        break

      case 'setdespedida':
        if (!text) return m.reply('⚠️ Escribe el mensaje de despedida.\nEjemplo: `.setdespedida Adiós @user`')
        chatConfig.bye.text = text
        m.reply('✅ Mensaje de despedida actualizado:\n' + text)
        break

      case 'welcome':
        if (!args[0]) return m.reply('⚠️ Usa `.welcome on` o `.welcome off`')
        if (args[0].toLowerCase() === 'on') {
          chatConfig.welcome.enabled = true
          m.reply('✅ Bienvenida activada.')
        } else if (args[0].toLowerCase() === 'off') {
          chatConfig.welcome.enabled = false
          m.reply('❌ Bienvenida desactivada.')
        }
        break

      case 'despedida':
        if (!args[0]) return m.reply('⚠️ Usa `.despedida on` o `.despedida off`')
        if (args[0].toLowerCase() === 'on') {
          chatConfig.bye.enabled = true
          m.reply('✅ Despedida activada.')
        } else if (args[0].toLowerCase() === 'off') {
          chatConfig.bye.enabled = false
          m.reply('❌ Despedida desactivada.')
        }
        break
    }
  }
}

// 🔹 Listener global (cuando entran o salen usuarios)
global.conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
  try {
    const chat = global.db.data.chats[id]
    if (!chat) return

    for (let user of participants) {
      let tag = '@' + user.split('@')[0]

      if (action === 'add' && chat.welcome?.enabled) {
        let text = chat.welcome.text.replace(/@user/gi, tag)
        await global.conn.sendMessage(id, { text, mentions: [user] })
      }

      if (action === 'remove' && chat.bye?.enabled) {
        let text = chat.bye.text.replace(/@user/gi, tag)
        await global.conn.sendMessage(id, { text, mentions: [user] })
      }
    }
  } catch (e) {
    console.error('Error en welcome/despedida:', e)
  }
})