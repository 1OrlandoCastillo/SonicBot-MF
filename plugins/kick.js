var handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)

  // Verifica si el bot es admin
  const botAdmin = conn.user && conn.chats[m.chat]?.participants?.some(p => p.id === conn.user.jid && (p.admin === 'admin' || p.admin === 'superadmin'))
  if (!botAdmin) return conn.reply(m.chat, '❌ Necesito ser administrador para expulsar a alguien.', m)

  // Verifica si quien ejecuta el comando es admin
  const senderAdmin = conn.chats[m.chat]?.participants?.some(p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin'))
  if (!senderAdmin) return conn.reply(m.chat, '❌ Solo los administradores pueden usar este comando.', m)

  // Obtiene JIDs a expulsar
  let mentions = m.mentionedJid || []
  // Si responde a un mensaje, agrega ese usuario
  if (m.quoted && m.quoted.sender) mentions.push(m.quoted.sender)

  if (!mentions.length) return conn.reply(m.chat, `⚠️ Menciona a la(s) persona(s) o responde a su mensaje para expulsarlas.\nEjemplo: ${usedPrefix}${command} @usuario`, m)

  for (let jid of mentions) {
    // Evita expulsar admins
    const participant = conn.chats[m.chat]?.participants?.find(p => p.id === jid)
    if (participant && (participant.admin === 'admin' || participant.admin === 'superadmin')) {
      conn.reply(m.chat, `❌ No puedo expulsar a @${jid.split('@')[0]} porque es administrador.`, m)
      continue
    }

    // Evita expulsar al mismo bot o a quien ejecuta el comando
    if (jid === m.sender || jid === conn.user.jid) continue

    try {
      await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
      conn.reply(m.chat, `✅ Usuario expulsado: @${jid.split('@')[0]}`, m)
    } catch (e) {
      conn.reply(m.chat, `❌ No se pudo expulsar a @${jid.split('@')[0]}.\nError: ${e.message}`, m)
    }
  }
}

handler.help = ['kick <@usuario> (respondiendo a mensaje también)']
handler.tags = ['group']
handler.command = ['kick', 'expulsar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

