const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const chatId = m.chat

    // Inicializar settings del grupo si no existen
    if (!global.db.data.settings) global.db.data.settings = {}
    if (!global.db.data.settings[chatId]) {
      global.db.data.settings[chatId] = {
        welcome: false,
        goodbye: false,
        welcomeMsg: '👋 ¡Bienvenido %user% al grupo %group%!',
        goodbyeMsg: '👋 %user% ha salido del grupo %group%.'
      }
    }

    const groupSettings = global.db.data.settings[chatId]

    // Activar / desactivar
    if (args[0] && ['on','off'].includes(args[0].toLowerCase())) {
      const setting = args[0].toLowerCase() === 'on'
      if (command === 'welcome') {
        groupSettings.welcome = setting
        conn.reply(chatId, `✅ Mensajes de bienvenida ${setting ? 'activados' : 'desactivados'}`, m)
      } else if (command === 'despedida') {
        groupSettings.goodbye = setting
        conn.reply(chatId, `✅ Mensajes de despedida ${setting ? 'activados' : 'desactivados'}`, m)
      }
    }

    // Cambiar mensaje
    else if (args[0] && args[0].toLowerCase() === 'msg') {
      const newMsg = args.slice(1).join(' ')
      if (!newMsg) return conn.reply(chatId, `✏️ Usa: ${usedPrefix}${command} msg [mensaje]`, m)
      if (command === 'welcome') groupSettings.welcomeMsg = newMsg
      else if (command === 'despedida') groupSettings.goodbyeMsg = newMsg
      conn.reply(chatId, `✅ Mensaje de ${command} actualizado correctamente`, m)
    }

    else {
      conn.reply(chatId,
        `✏️ Uso del comando ${command}:\n` +
        `• ${usedPrefix}${command} on → Activar\n` +
        `• ${usedPrefix}${command} off → Desactivar\n` +
        `• ${usedPrefix}${command} msg [mensaje] → Cambiar mensaje\n\n` +
        `Variables disponibles: %user%, %group%`
      , m)
    }

    await global.db.write()
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Ocurrió un error configurando el comando.', m)
  }
}

handler.command = ['welcome', 'despedida']
handler.group = true
handler.botAdmin = true
handler.admin = true
export default handler
