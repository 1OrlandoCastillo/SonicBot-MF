const handler = async (m, { conn }) => {
  let escuadra = []
  let suplentes = []

  // Enviamos el mensaje inicial
  let listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbed(escuadra, suplentes)
  }, { quoted: m })

  // Reaccionar automáticamente con los emojis que la gente debe usar
  await conn.sendMessage(m.chat, { react: { text: '❤️', key: listaMsg.key } })
  await conn.sendMessage(m.chat, { react: { text: '👍', key: listaMsg.key } })

  // Escuchar reacciones (messages.upsert detecta todo tipo de mensajes, incluidas reacciones)
  conn.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
      if (!msg.message || !msg.message.reactionMessage) continue

      let reaccion = msg.message.reactionMessage.text
      let reaccionKey = msg.message.reactionMessage.key
      let participanteJid = reaccionKey.participant || reaccionKey.remoteJid
      let nombre = await conn.getName(participanteJid)

      // Solo aceptar reacciones al mensaje original
      if (reaccionKey.id !== listaMsg.key.id) return
      if (reaccionKey.remoteJid !== m.chat) return

      // Quitar de ambas listas antes de añadir a la correcta
      escuadra = escuadra.filter(n => n !== nombre)
      suplentes = suplentes.filter(n => n !== nombre)

      if (reaccion === '❤️') {
        escuadra.push(nombre)
      } else if (reaccion === '👍') {
        suplentes.push(nombre)
      } else {
        return // Si reaccionan con otra cosa, ignoramos
      }

      // Actualizar el mensaje con la nueva lista
      await conn.sendMessage(m.chat, {
        text: generarEmbed(escuadra, suplentes)
      }, { quoted: m })
    }
  })

  // Expira en 5 minutos
  setTimeout(() => {
    conn.sendMessage(m.chat, {
      text: `✅ Lista finalizada\n\n👑 Escuadra: ${escuadra.join(', ') || 'Nadie'}\n🪑 Suplentes: ${suplentes.join(', ') || 'Nadie'}`
    }, { quoted: m })
  }, 5 * 60 * 1000)
}

function generarEmbed(escuadra, suplentes) {
  return `╭─────────────╮
┊ MODO: CLK
┊ ⏱️ HORARIO
• 5:00am MÉXICO
• 6:00am COLOMBIA
┊ » ESCUADRA
${escuadra.map(n => `┊ ${n}`).join('\n') || '┊ (Vacío)'}
┊ » SUPLENTES
${suplentes.map(n => `┊ ${n}`).join('\n') || '┊ (Vacío)'}
╰─────────────╯
❤️ = Participar | 👍 = Suplente
• Lista Activa Por 5 Minutos`
}

handler.help = ['partido']
handler.tags = ['partido']
handler.command = /^partido$/i
handler.group = true

export default handler