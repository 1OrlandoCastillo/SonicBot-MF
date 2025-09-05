var handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)

  // Actualiza metadata del grupo
  let metadata = await conn.groupMetadata(m.chat)
  let participants = metadata.participants
  let groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)

  // Verifica si quien ejecuta es admin
  if (!groupAdmins.includes(m.sender)) return conn.reply(m.chat, '❌ Solo los administradores pueden usar este comando.', m)

  // Obtiene JIDs a expulsar
  let mentions = m.mentionedJid || []
  if (m.quoted && m.quoted.sender) mentions.push(m.quoted.sender)
  if (!mentions.length) return conn.reply(m.chat, `⚠️ Menciona a la(s) persona(s) o responde a su mensaje.\nEjemplo: ${usedPrefix}${command} @usuario [razón]`, m)

  // Razón opcional
  let reason = text ? text.replace(/@\S+/g, '').trim() : ''

  for (let jid of mentions) {
    // Evita expulsar admins
    if (groupAdmins.includes(jid)) {
      conn.reply(m.chat, `❌ No puedo expulsar a @${jid.split('@')[0]} porque es administrador.`, m)
      continue
    }

    // Evita expulsar al bot o a quien ejecuta
    if (jid === m.sender || jid === conn.user.jid) continue

    try {
      // Intenta expulsar
      await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
      let mensaje = `✅ Usuario expulsado: @${jid.split('@')[0]}`
      if (reason) mensaje += `\n📝 Razón: ${reason}`
      conn.sendMessage(m.chat, { text: mensaje, mentions: [jid] })
    } catch (e) {
      // Mensaje claro si falla por permisos de WhatsApp
      let errorMsg = e.message || e
      if (errorMsg.toLowerCase().includes('admin')) {
        conn.reply(m.chat, `❌ No pude expulsar a @${jid.split('@')[0]}.\nPosiblemente no tengo permisos suficientes o es administrador.`, m)
      } else {
        conn.reply(m.chat, `❌ Error al expulsar a @${jid.split('@')[0]}.\n${errorMsg}`, m)
      }
    }
  }
}

handler.help = ['kick <@usuario> (respondiendo a mensaje también)']
handler.tags = ['group']
handler.command = ['kick', 'expulsar']
handler.group = true
handler.admin = true
handler.botAdmin = false // Aquí ya no bloquea si WhatsApp no lo permite

export default handler
