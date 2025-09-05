var handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)

  // Si no hay texto y se responde a un mensaje, usamos el mensaje citado
  let mensaje = text
  let quoted = null
  if (!text && m.quoted) {
    mensaje = m.quoted.text || '' // si es texto, lo usamos, si no, queda vacío
    quoted = m.quoted
  }
  if (!mensaje) return conn.reply(m.chat, `⚠️ Usa el comando así:\n${usedPrefix}${command} <mensaje>`, m)

  // Obtiene todos los participantes del grupo
  let chat = conn.chats[m.chat]
  let participants = chat?.presences ? Object.keys(chat.presences) : []
  if (!participants.length) participants = chat?.participants?.map(p => p.id) || []

  // Filtra bots y el propio bot
  participants = participants.filter(jid => !conn.user.jid.includes(jid) && !jid.endsWith('@g.us'))

  // Divide en lotes de 50 para grupos muy grandes
  const chunk = (arr, size) => {
    let result = []
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
    return result
  }
  const batches = chunk(participants, 50)

  // Envía cada lote de menciones
  for (let batch of batches) {
    await conn.sendMessage(
      m.chat,
      { text: mensaje, mentions: batch },
      { quoted: quoted || m }
    )
  }
}

handler.help = ['hidetag <mensaje>']
handler.tags = ['group']
handler.command = ['hidetag', 'tagall', 'n']
handler.group = true

export default handler
