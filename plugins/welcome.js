const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return

  for (let user of participants) {
    const pushname = user.notify || user.vname || 'Invitado'
    const chat = m.chat

    const welcomeText = 
`👋 ¡Hola @${user.id.split('@')[0]}!
Bienvenido al grupo.
Esperamos que te diviertas y participes activamente. 🥳`

    await conn.sendMessage(chat, { text: welcomeText, mentions: [user.id] })
  }
}

handler.event = 'group-participants.update'
handler.group = true
handler.tags = ['grupo']
handler.command = ['welcome']
export default handler