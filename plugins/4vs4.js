const handler = async (m, { conn }) => {
  let escuadra = [] // [{ jid, nombre }]
  let suplentes = [] // [{ jid, nombre }]
  let listaAbierta = true

  // Enviar mensaje inicial
  let listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbedConMentions(escuadra, suplentes).text
  }, { quoted: m })

  // Función para actualizar la lista en el mismo mensaje
  const actualizarLista = async () => {
    try {
      const { text, mentions } = generarEmbedConMentions(escuadra, suplentes)
      await conn.sendMessage(m.chat, {
        text,
        mentions,
        edit: listaMsg.key // Editar mensaje original
      })
    } catch {
      const { text, mentions } = generarEmbedConMentions(escuadra, suplentes)
      await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
    }
  }

  // Función para cerrar la lista y notificar
  const cerrarLista = async () => {
    listaAbierta = false
    await conn.sendMessage(m.chat, {
      text: `✅ La escuadra está completa y la lista se ha cerrado.\n\n👑 Escuadra: ${escuadra.map(u => '@' + u.nombre).join(', ') || 'Nadie'}\n🪑 Suplentes: ${suplentes.map(u => '@' + u.nombre).join(', ') || 'Nadie'}`,
      mentions: [...escuadra.map(u => u.jid), ...suplentes.map(u => u.jid)]
    }, { quoted: m })
  }

  // Procesar la reacción
  const procesarReaccion = async (msg) => {
    if (!listaAbierta) return // No aceptar más reacciones si está cerrada
    if (!msg.message || !msg.message.reactionMessage) return

    let reaccion = msg.message.reactionMessage.text
    let reaccionKey = msg.message.reactionMessage.key

    // Solo al mensaje original
    if (reaccionKey.id !== listaMsg.key.id) return
    if (reaccionKey.remoteJid !== m.chat) return

    // El que reaccionó es msg.key.participant en la reacción o en msg.key.remoteJid
    let participanteJid = msg.key.participant ?? msg.key.remoteJid
    if (participanteJid === conn.user.id) return

    let nombre = (await conn.getName(participanteJid))?.trim()
    if (!nombre) return

    // Eliminar duplicados por jid
    escuadra = escuadra.filter(u => u.jid !== participanteJid)
    suplentes = suplentes.filter(u => u.jid !== participanteJid)

    // Clasificar según emoji
    if (reaccion.startsWith('❤️')) {
      if (escuadra.length < 4) {
        escuadra.push({ jid: participanteJid, nombre })
      } else {
        // Escuadra llena, no añadir más
        return
      }
    } else if (reaccion.startsWith('👍')) {
      suplentes.push({ jid: participanteJid, nombre })
    } else {
      return
    }

    await actualizarLista()

    // Si la escuadra llegó a 4, cerrar lista
    if (escuadra.length === 4) {
      await cerrarLista()
    }
  }

  // Escuchar reacciones en ambas fuentes
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
    return `┊ ${icon} ➤ @${u.nombre}`  // Mostrar @nombre sin JID en texto
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