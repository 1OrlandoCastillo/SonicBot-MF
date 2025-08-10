const handler = async (m, { conn }) => {
  let escuadra = []
  let suplentes = []

  // Enviar mensaje inicial
  let listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbed(escuadra, suplentes)
  }, { quoted: m })

  // Función para actualizar la lista en el mismo mensaje
  const actualizarLista = async () => {
    try {
      await conn.sendMessage(m.chat, {
        text: generarEmbed(escuadra, suplentes),
        edit: listaMsg.key // Si soporta edición
      })
    } catch {
      await conn.sendMessage(m.chat, { text: generarEmbed(escuadra, suplentes) }, { quoted: m })
    }
  }

  // Función para procesar la reacción
  const procesarReaccion = async (msg) => {
    if (!msg.message || !msg.message.reactionMessage) return

    let reaccion = msg.message.reactionMessage.text
    let reaccionKey = msg.message.reactionMessage.key

    // Filtrar solo reacciones al mensaje original
    if (reaccionKey.id !== listaMsg.key.id) return
    if (reaccionKey.remoteJid !== m.chat) return

    // Ignorar si el que reacciona es el bot
    let participanteJid = reaccionKey.participant ?? reaccionKey.remoteJid
    if (participanteJid === conn.user.id) return

    let nombre = (await conn.getName(participanteJid))?.trim()

    // Eliminar duplicados
    escuadra = escuadra.filter(n => n.toLowerCase() !== nombre.toLowerCase())
    suplentes = suplentes.filter(n => n.toLowerCase() !== nombre.toLowerCase())

    // Clasificar según el emoji
    if (reaccion.startsWith('❤️')) {
      escuadra.push(nombre)
    } else if (reaccion.startsWith('👍')) {
      suplentes.push(nombre)
    } else {
      return
    }

    await actualizarLista()
  }

  // Escuchar reacciones en ambas fuentes
  conn.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) await procesarReaccion(msg)
  })

  conn.ev.on('messages.update', async (updates) => {
    for (let update of updates) if (update.message) await procesarReaccion(update)
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
${escuadra.length ? escuadra.map(n => `┊ ${n}`).join('\n') : '┊ (Vacío)'}
┊ » SUPLENTES
${suplentes.length ? suplentes.map(n => `┊ ${n}`).join('\n') : '┊ (Vacío)'}
╰─────────────╯
❤️ = Participar | 👍 = Suplente
• Lista Activa Por 5 Minutos`
}

handler.help = ['partido']
handler.tags = ['partido']
handler.command = /^partido$/i
handler.group = true

export default handler