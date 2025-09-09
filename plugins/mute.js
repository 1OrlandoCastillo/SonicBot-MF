export default {
  command: ['mute', 'unmute'],
  help: ['mute @user', 'unmute @user'],
  tags: ['admin'],
  handler: async (m, { conn, args, command, usedPrefix }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
    if (!m.isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.')

    let who
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (args[0]) {
      who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    } else {
      return m.reply(`❌ Debes mencionar o escribir el número.\nEjemplo:\n${usedPrefix + command} @usuario`)
    }

    global.db.data.users[who] = global.db.data.users[who] || {}

    if (command === 'mute') {
      if (global.db.data.users[who].muted) return m.reply('⚠️ Este usuario ya estaba muteado.')
      global.db.data.users[who].muted = true
      m.reply(`🔇 Usuario *${who.split('@')[0]}* muteado.`)
    }

    if (command === 'unmute') {
      if (!global.db.data.users[who].muted) return m.reply('⚠️ Este usuario no estaba muteado.')
      global.db.data.users[who].muted = false
      m.reply(`🔊 Usuario *${who.split('@')[0]}* desmuteado.`)
    }
  }
}