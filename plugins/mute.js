let handler = async (m, { conn, command, args, usedPrefix }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  // 🔎 Verificar si quien ejecuta es admin
  let groupMetadata = await conn.groupMetadata(m.chat)
  let participants = groupMetadata.participants || []
  let adminIds = participants.filter(p => p.admin).map(p => p.id)

  if (!adminIds.includes(m.sender)) {
    return m.reply('❌ Solo los administradores pueden usar este comando.')
  }

  let who
  // 📌 Si respondió a un mensaje
  if (m.quoted) {
    who = m.quoted.sender
  } 
  // 📌 Si mencionó a alguien
  else if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } 
  // 📌 Si puso un número
  else if (args[0]) {
    who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } 
  else {
    return m.reply(`⚠️ Debes mencionar, responder o escribir el número.\n\nEjemplo:\n${usedPrefix + command} @usuario`)
  }

  global.db.data.users[who] = global.db.data.users[who] || {}

  if (command.toLowerCase() === 'mute') {
    if (global.db.data.users[who].muted) return m.reply('⚠️ Ese usuario ya estaba muteado.')
    global.db.data.users[who].muted = true
    
    return conn.sendMessage(m.chat, { 
      text: `🔇 El usuario @${who.split('@')[0]} ha sido muteado.`, 
      mentions: [who] // 🔥 Esto hace que se vea como mención real
    })
  }

  if (command.toLowerCase() === 'unmute') {
    if (!global.db.data.users[who].muted) return m.reply('⚠️ Ese usuario no estaba muteado.')
    global.db.data.users[who].muted = false
    
    return conn.sendMessage(m.chat, { 
      text: `🔊 El usuario @${who.split('@')[0]} ha sido desmuteado.`, 
      mentions: [who] // 🔥 Igual, mención real
    })
  }
}

handler.help = ['mute @usuario', 'unmute @usuario']
handler.tags = ['group']
handler.command = ['mute', 'unmute']
handler.group = true

export default handler