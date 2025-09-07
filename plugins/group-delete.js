let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  const contextInfo = typeof rcanal !== 'undefined' ? rcanal.contextInfo : {}

  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '《✧》Este comando solo puede ser usado en grupos.',
    contextInfo
  }, { quoted: m })

  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '《✧》Solo los administradores pueden usar este comando.',
    contextInfo
  }, { quoted: m })

  if (!m.quoted) {
    return conn.sendMessage(m.chat, {
      text: `《✧》Debes responder al mensaje que deseas eliminar.\n\n> Ejemplo: Responde a un mensaje y escribe ${usedPrefix + command}`,
      contextInfo
    }, { quoted: m })
  }

  try {
    const messageId = m.msg?.contextInfo?.stanzaId || m.quoted?.id

    if (!messageId) {
      return conn.sendMessage(m.chat, {
        text: '《✧》No se pudo obtener información del mensaje a eliminar.',
        contextInfo
      }, { quoted: m })
    }

    // Elimina únicamente el mensaje citado
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: messageId,
        participant: m.msg?.contextInfo?.participant || m.chat
      }
    })

    // Mensaje de confirmación visible en el grupo
    await conn.sendMessage(m.chat, {
      text: '✅ 𝗘𝗹 𝗺𝗲𝗻𝘀𝗮𝗷𝗲 𝗵𝗮 𝘀𝗶𝗱𝗼 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝗱𝗼,𝗷𝗲𝗳𝗲🫡
',
      contextInfo
    })

  } catch {}
}

handler.command = ['delete', 'eliminar', 'borrar', 'del']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler