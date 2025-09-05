var handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)

  // Obtener metadata del grupo actualizado
  let metadata = await conn.groupMetadata(m.chat)
  let participants = metadata.participants
  let groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)

  // Verifica si quien ejecuta el comando es admin
  if (!groupAdmins.includes(m.sender)) return conn.reply(m.chat, '❌ Solo los administradores pueden usar este comando.', m)

  // Verifica si el bot es admin
  if (!groupAdmins.includes(conn.user.jid)) return conn.reply(m.chat, '❌ Necesito ser administrador para expulsar a alguien.', m)

  // Obtiene JIDs a expulsar
  let mentions = m.mentionedJid || []
  if (m.quoted && m.quoted.sender) mentions.push(m.quoted.sender)

  if (!mentions.length) return conn.reply(m.chat, `⚠️ Menciona a la(s) persona(s) o responde a su mensaje para expulsarlas.\nEjemplo: ${usedPrefix}${command} @usuario [razón]`, m)

  // Separar razón del kick si se escribe después de los mentions
  let reason = text ? text.replace(/@\S+/g, '').trim() : ''

  for (let jid of mentions) {
    // Evita expulsar admins
    if (groupAdmins.includes(jid)) {
      conn.reply(m.chat, `❌ No puedo expulsar a @${jid.split('@')[0]} porque es administrador.`, m)
      continue
    }

    // Evita expulsar al bot o a quien ejecuta el comando
    if (jid === m.sender || jid === conn.user.jid) continue

    try {
      await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
      let mensaje = `✅ Usuario expulsado: @${jid.split('@')[0]}`
      if (reason) mensaje += `\n📝 Razón: ${reason}`
      conn.reply(m.chat, mensaje, m)
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
