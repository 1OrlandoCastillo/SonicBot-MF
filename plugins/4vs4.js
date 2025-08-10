const handler = async (m, { conn }) => {
  let escuadra = [] // [{ jid, nombre }]
  let suplentes = [] // [{ jid, nombre }]
  let listaAbierta = true

  // Enviar mensaje inicial sin menciones
  let listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbedConMentions(escuadra, suplentes).text
  }, { quoted: m })

  // Actualizar lista editando el mensaje original SIN menciones para evitar notificaciones masivas
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

  // Notificar individualmente al usuario que acaba de anotarse
  const notificarUsuario = async (usuario) => {
    const nombreReal = await conn.getName(usuario.jid) || usuario.nombre || 'usuario'
    const primerNombre = nombreReal.split(' ')[0]
    const text = `✅ @${primerNombre} ya estás anotado en la lista.`
    await conn.sendMessage(m.chat, {
      text,
      mentions: [usuario.jid]
    }, { quoted: m })
  }

  // Cerrar lista y notificar a todos los anotados
  const cerrarLista = async () => {
    listaAbierta = false
    await conn.sendMessage(m.chat, {
      text: `✅ La escuadra está completa y la lista se ha cerrado.\n\n👑 Escuadra: ${escuadra.map(u => '@' + u.nombre).join(', ') || 'Nadie'}\n🪑 Suplentes: ${suplentes.map(u => '@' + u.nombre).join(', ') || 'Nadie'}`,
      mentions: [...escuadra.map(u => u.jid), ...suplentes.map(u => u.jid)]
    }, { quoted: m })
  }

  // Procesar reacción para añadir usuario a lista
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

    // Remover si ya estaba anotado para evitar duplicados
    escuadra = escuadra.filter(u => u.jid !== participanteJid)
    suplentes = suplentes.filter(u => u.jid !== participanteJid)

    if (reaccion.startsWith('❤️')) {
      if (escuadra.length < 4) {
        escuadra.push({ jid: participanteJid, nombre })
        await notificarUsuario({ jid: participanteJid, nombre })
      } else {
        return
      }
    } else if (reaccion.startsWith('👍')) {
      suplentes.push({ jid: participanteJid, nombre })
      await notificarUsuario({ jid: participanteJid, nombre })
    } else {
      return
    }

    await actualizarLista()

    if (escuadra.length === 4) {
      await cerrarLista()
    }
  }

  // Escuchar reacciones
  conn.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) await procesarReaccion(msg)
  })

  conn.ev.on('messages.update', async (updates) => {
    for (let update of updates) if (update.message) await procesarReaccion(update)
  })

  // Expira en 5 minutos si no se completa antes
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

// Diseño del mensaje con menciones
function generarEmbedConMentions(escuadra, suplentes) {
  const mentions = []

  function formatUser(u, isLeader = false) {
    mentions.push(u.jid)
    const icon = isLeader ? '👑' : '⚜️'
    return `┊ ${icon} ➤ @${u.nombre}`
  }

  const escuadraText = escuadra.length
    ? escuadra.map((u, i) => formatUser(u, i === 0)).join('\n')
    : `┊ 👑 ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤`

  const suplentesText = suplentes.length
    ? suplentes.map(u => formatUser(u)).join('\n')
    : `┊ ⚜️ ➤ \n┊ ⚜️ ➤`

  const text = `ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭─────────────╮
┊ \`𝗠𝗢𝗗𝗢:\` \`\`\`CLK\`\`\`
┊
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
┊ • 5:00am MÉXICO 🇲🇽
┊ • 6:00am COLOMBIA 🇨🇴
┊
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\`
${escuadraText}
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\`
${suplentesText}
╰─────────────╯

❤️ = Participar | 👍 = Suplente

• Lista Activa Por 5 Minutos`

  return { text, mentions }
}

handler.help = ['partido']
handler.tags = ['partido']
handler.command = /^partido$/i
handler.group = true

export default handler