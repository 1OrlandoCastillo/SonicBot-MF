let handler = async (m, { conn, args, participants }) => {
  if (!m.isGroup) return conn.reply(m.chat,'Esta función solo está disponible en grupos.', m, rcanal)

  const groupMetadata = await conn.groupMetadata(m.chat)
  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender)
  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner

  if (!isUserAdmin) return conn.reply(m.chat,'Solo los miembros con permisos especiales pueden usar esto.', m, rcanal)

  let user
  if (m.mentionedJid?.[0]) {
    user = m.mentionedJid[0]
  } else if (m.quoted) {
    user = m.quoted.sender
  } else if (args[0]) {
    const number = args[0].replace(/[^0-9]/g, '')
    user = number + '@s.whatsapp.net'
  } else {
    const kickMsg = `Debes identificar a la persona para poder expulsarl@.`
    return m.reply(kickMsg, m.chat, { mentions: conn.parseMention(kickMsg) })
  }

  const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
  const ownerBot = global.owner?.[0]?.[0] + '@s.whatsapp.net'

  if (user === conn.user.jid) return conn.reply(m.chat,`No puedes usar el comando para eliminarte del grupo.`, m, rcanal)
  if (user === ownerGroup) return conn.reply(m.chat,`El dueño del grupo no puede ser eliminado por el bot ni por otros admins.`, m, rcanal)
  if (user === ownerBot) return conn.reply(m.chat,`El dueño del bot está protegido contra este comando.`, m, rcanal)

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    return conn.reply(m.chat,`La persona fue expulsad@ del grupo por un administrador.`, m, rcanal)
  } catch (e) {
    return conn.reply(m.chat,`No tengo permisos para hacer esta acción.`, m, rcanal)
  }
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = ['kick', 'expulsar', 'echar', 'ban', 'sacar']

export default handler