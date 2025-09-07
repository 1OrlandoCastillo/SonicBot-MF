let handler = async (m, { conn, args, isAdmin, isOwner, isPrems, usedPrefix, command }) => {
  const contextInfo = typeof rcanal !== 'undefined' ? rcanal.contextInfo : {}

  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: 'Este comando solo puede ser usado en grupos.',
    contextInfo
  }, { quoted: m })

  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: 'Solo los administradores pueden usar este comando.',
    contextInfo
  }, { quoted: m })

  if (!m.quoted) return conn.sendMessage(m.chat, {
    text: `Debes responder al mensaje que deseas eliminar.\nEjemplo: Responde a un mensaje y escribe ${usedPrefix + command}`,
    contextInfo
  }, { quoted: m })

  try {
    const messageId = m.quoted?.id || m.msg?.key?.id
    const participant = m.quoted?.sender || m.msg?.key?.participant || m.sender

    if (!messageId) return conn.sendMessage(m.chat, {
      text: 'No se pudo obtener información del mensaje a eliminar.',
      contextInfo
    }, { quoted: m })

    // Elimina el mensaje citado
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: messageId,
        participant
      }
    })

    // Confirmación visible
    await conn.sendMessage(m.chat, {
      text: `✅ El mensaje ha sido eliminado, jefe 🫡`,
      contextInfo
    }, { quoted: m })

  } catch (error) {
    console.error('Error al eliminar mensaje:', error)
  }
}

handler.command = ['delete', 'eliminar', 'borrar', 'del']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler