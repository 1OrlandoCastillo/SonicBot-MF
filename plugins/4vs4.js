const handler = async (m, { conn }) => {
  let escuadra = []
  let suplentes = []
  let listaAbierta = true

  // Enviar mensaje inicial
  let listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbed(escuadra, suplentes)
  }, { quoted: m })

  // Añadir reacciones para que los usuarios puedan usarlas
  await conn.sendMessage(m.chat, { react: { text: '❤️', key: listaMsg.key } })
  await conn.sendMessage(m.chat, { react: { text: '👍', key: listaMsg.key } })

  // Función para actualizar la lista en el mismo mensaje
  const actualizarLista = async () => {
    try {
      // Intenta editar el mensaje original (si tu API lo soporta)
      await conn.sendMessage(m.chat, {
        text: generarEmbed(escuadra, suplentes),
        edit: listaMsg.key
      })
    } catch {
      // Si no se puede editar, envía uno nuevo
      await conn.sendMessage(m.chat, { text: generarEmbed(escuadra, suplentes) }, { quoted: m })
    }
  }

  // Función para cerrar la lista y notificar
  const cerrarLista = async () => {
    listaAbierta = false
    await conn.sendMessage(m.chat, {
      text: `✅ La escuadra está completa y la lista se ha cerrado.\n\n👑 Escuadra: ${escuadra.join(', ') || 'Nadie'}\n🪑 Suplentes: ${suplentes.join(', ') || 'Nadie'}`
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

    // Ignorar reacciones del propio bot
    let participanteJid = reaccionKey.participant ?? reaccionKey.remoteJid
    if (participanteJid === conn.user.id) return

    let nombre = (await conn.getName(participanteJid))?.trim()
    if (!nombre) return

    // Eliminar duplicados
    escuadra = escuadra.filter(n => n.toLowerCase() !== nombre.toLowerCase())
    suplentes = suplentes.filter(n => n.toLowerCase() !== nombre.toLowerCase())

    // Clasificar según emoji
    if (reaccion.startsWith('❤️')) {
      if (escuadra.length < 4) {
        escuadra.push(nombre)
      } else {
        // Escuadra llena, no añadir más
        return
      }
    } else if (reaccion.startsWith('👍')) {
      suplentes.push(nombre)
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
        text: `⌛ Tiempo agotado.\n\n👑 Escuadra: ${escuadra.join(', ') || 'Nadie'}\n🪑 Suplentes: ${suplentes.join(', ') || 'Nadie'}`
      }, { quoted: m })
    }
  }, 5 * 60 * 1000)
}

// Diseño del mensaje
function generarEmbed(escuadra, suplentes) {
  return `ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭─────────────╮
┊ \`𝗠𝗢𝗗𝗢:\` \`\`\`CLK\`\`\`
┊
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
┊ • 5:00am MÉXICO 🇲🇽
┊ • 6:00am COLOMBIA 🇨🇴
┊
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\`
${escuadra.length ? escuadra.map((n, i) => i === 0 ? `┊ 👑 ➤ ${n}` : `┊ ⚜️ ➤ ${n}`).join('\n') : `┊ 👑 ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤`}
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\`
${suplentes.length ? suplentes.map(n => `┊ ⚜️ ➤ ${n}`).join('\n') : `┊ ⚜️ ➤ \n┊ ⚜️ ➤`}
╰─────────────╯

❤️ = Participar | 👍 = Suplente

• Lista Activa Por 5 Minutos`
}

handler.help = ['partido']
handler.tags = ['partido']
handler.command = /^partido$/i
handler.group = true

export default handler