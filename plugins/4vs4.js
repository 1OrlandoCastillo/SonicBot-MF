const handler = async (m, { conn }) => {
  let escuadra = []
  let suplentes = []
  let listaAbierta = true

  let listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbedConMentions(escuadra, suplentes).text
  }, { quoted: m })

  // Actualizar la lista general SIN menciones para no notificar a todos
  const actualizarLista = async () => {
    try {
      const { text } = generarEmbedConMentions(escuadra, suplentes)
      await conn.sendMessage(m.chat, {
        text,
        edit: listaMsg.key
      })
    } catch {
      const { text } = generarEmbedConMentions(escuadra, suplentes)
      await conn.sendMessage(m.chat, { text }, { quoted: m })
    }
  }

  // Notificar al usuario individualmente cuando se anota
  const notificarUsuario = async (usuario) => {
    const text = `✅ @${usuario.nombre} ya estás anotado en la lista.`
    await conn.sendMessage(m.chat, {
      text,
      mentions: [usuario.jid]
    }, { quoted: m })
  }

  const cerrarLista = async () => {
    listaAbierta = false
    await conn.sendMessage(m.chat, {
      text: `✅ La escuadra está completa y la lista se ha cerrado.\n\n👑 Escuadra: ${escuadra.map(u => '@' + u.nombre).join(', ') || 'Nadie'}\n🪑 Suplentes: ${suplentes.map(u => '@' + u.nombre).join(', ') || 'Nadie'}`,
      mentions: [...escuadra.map(u => u.jid), ...suplentes.map(u => u.jid)]
    }, { quoted: m })
  }

  const procesarReaccion = async (msg) => {
    if (!listaAbierta) return
    if (!msg.message || !msg.message.reactionMessage) return

    let reaccion = msg.message.reactionMessage.text
    let reaccionKey = msg.message.reactionMessage.key

    if (reaccionKey.id !== listaMsg.key.id) return
    if (reaccionKey.remoteJid !== m.chat) return

    let participanteJid = msg.key.participant ?? msg.key.remoteJid
    if (participanteJid === conn.user.id) return

    let nombre = (await conn.getName(participanteJid))?.trim()
    if (!nombre) return

    escuadra = escuadra.filter(u => u.jid !== participanteJid)
    suplentes = suplentes.filter(u => u.jid !== participanteJid)

    if (reaccion.startsWith('❤️')) {
      if (escuadra.length < 4) {
        escuadra.push({ jid: participanteJid, nombre })
        await notificarUsuario({ jid: participanteJid, nombre }) // Notificar individualmente
      } else {
        return
      }
    } else if (reaccion.startsWith('👍')) {
      suplentes.push({ jid: participanteJid, nombre })
      await notificarUsuario({ jid: participanteJid, nombre }) // Notificar individualmente
    } else {
      return
    }

    await actualizarLista()

    if (escuadra.length === 4) {
      await cerrarLista()
    }
  }

  conn.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) await procesarReaccion(msg)
  })

  conn.ev.on('messages.update', async (updates) => {
    for (let update of updates) if (update.message) await procesarReaccion(update)
  })

  setTimeout(async () => {
    if (listaAbierta) {
      listaAbierta = false
      await conn.sendMessage(m.chat, {
        text: `⌛ Tiempo agotado.\n\n👑 Escuadra: ${escuadra.map(u => '@' + u.nombre).join(', ') || 'Nadie'}\n🪑 Suplentes: ${suplentes.map(u => '@' + u.nombre).join(', ') || 'Nadie'}`,
        mentions: [...escuadra.map(u => u.jid), ...suplentes.map(u => u.jid)]
      }, { quoted: m })
    }
  }, 5 * 60 * 1000)
}