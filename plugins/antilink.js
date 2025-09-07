// plugins/antilink.js

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!m.isAdmin) return m.reply('⚠️ Solo los administradores pueden activar o desactivar el antilink.')

  let chat = global.db.data.chats[m.chat] ||= {}

  if (!args[0]) {
    return m.reply(`⚙️ Estado actual del *antilink*: ${chat.antiLink ? '✅ Activado' : '❌ Desactivado'}\n\nUsa:\n- .antilink on\n- .antilink off`)
  }

  if (args[0].toLowerCase() === 'on') {
    chat.antiLink = true
    m.reply('✅ El *antilink* ha sido *activado* en este grupo.')
  } else if (args[0].toLowerCase() === 'off') {
    chat.antiLink = false
    m.reply('❌ El *antilink* ha sido *desactivado* en este grupo.')
  } else {
    m.reply('⚠️ Usa:\n- .antilink on\n- .antilink off')
  }
}

handler.help = ['antilink <on/off>']
handler.tags = ['group']
handler.command = ['antilink']
handler.group = true
handler.admin = true

export default handler