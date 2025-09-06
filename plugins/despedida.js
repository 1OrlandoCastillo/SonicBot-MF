const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return

  for (let user of participants) {
    const pushname = user.notify || user.vname || 'Usuario'
    const chat = m.chat

    const goodbyeText = 
`😢 @${user.id.split('@')[0]} ha salido del grupo.
¡Esperamos verte de nuevo pronto!`

    await conn.sendMessage(chat, { text: goodbyeText, mentions: [user.id] })
  }
}

handler.event = 'group-participants.update'
handler.group = true
handler.tags = ['grupo']
handler.command = ['goodbye']
export default handler