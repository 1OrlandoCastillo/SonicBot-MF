// plugins/antilink.js

let handler = async (m, { conn, args, command, participants }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!m.isAdmin) return m.reply('⚠️ Solo los administradores pueden usar este comando.')

  let chat = global.db.data.chats[m.chat] ||= {}

  if (!args[0]) {
    return m.reply(`📌 Estado actual del *antilink*: ${chat.antiLink ? '✅ Activado' : '❌ Desactivado'}\n\nUsa:\n.${command} on\n.${command} off`)
  }

  if (args[0].toLowerCase() === 'on') {
    chat.antiLink = true
    return m.reply('✅ El *antilink* ha sido *activado* en este grupo.')
  }

  if (args[0].toLowerCase() === 'off') {
    chat.antiLink = false
    return m.reply('❌ El *antilink* ha sido *desactivado* en este grupo.')
  }

  return m.reply(`⚠️ Uso correcto:\n.${command} on\n.${command} off`)
}

handler.help = ['antilink <on/off>']
handler.tags = ['grupo']
handler.command = ['antilink']
handler.group = true
handler.admin = true

export default handler