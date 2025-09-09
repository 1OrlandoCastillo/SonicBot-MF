let handler = async (m, { conn, command, args, usedPrefix }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!m.isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.')

  let who
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  } else if (args[0]) {
    who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else {
    return m.reply(`⚠️ Debes mencionar a alguien o escribir el número.\n\nEjemplo:\n${usedPrefix + command} @usuario`)
  }

  global.db.data.users[who] = global.db.data.users[who] || {}

  if (command === 'mute') {
    if (global.db.data.users[who].muted) return m.reply('⚠️ Ese usuario ya está muteado.')
    global.db.data.users[who].muted = true
    m.reply(`🔇 Usuario *${who.split('@')[0]}* muteado.`)
  }

  if (command === 'unmute') {
    if (!global.db.data.users[who].muted) return m.reply('⚠️ Ese usuario no estaba muteado.')
    global.db.data.users[who].muted = false
    m.reply(`🔊 Usuario *${who.split('@')[0]}* desmuteado.`)
  }
}

handler.help = ['mute @usuario', 'unmute @usuario']
handler.tags = ['group']
handler.command = /^mute$|^unmute$/i
handler.group = true
handler.admin = true

export default handler