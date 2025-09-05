const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
      return conn.reply(
        m.chat,
        `✏️ Uso:\n• ${usedPrefix}${command} on → Activar\n• ${usedPrefix}${command} off → Desactivar`,
        m
      )
    }

    const chatId = m.chat
    const setting = args[0].toLowerCase() === 'on'

    // Inicializar la sección de grupos en la DB si no existe
    if (!global.db.data.settings) global.db.data.settings = {}
    if (!global.db.data.settings[chatId]) global.db.data.settings[chatId] = {}

    if (command === 'welcome') {
      global.db.data.settings[chatId].welcome = setting
      conn.reply(
        chatId,
        `✅ Mensajes de bienvenida ${setting ? 'activados' : 'desactivados'}`,
        m
      )
    } else if (command === 'despedida') {
      global.db.data.settings[chatId].goodbye = setting
      conn.reply(
        chatId,
        `✅ Mensajes de despedida ${setting ? 'activados' : 'desactivados'}`,
        m
      )
    }

    // Guardar cambios en la DB
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
