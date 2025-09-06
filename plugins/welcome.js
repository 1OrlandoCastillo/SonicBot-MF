const handler = async (update) => {
  const { conn } = global
  const { participants, action, id } = update

  if (action !== 'add') return // Solo cuando alguien entra
  if (!id) return

  for (let user of participants) {
    const pushname = user.notify || 'Invitado'
    const chat = id

    const welcomeText = 
`👋 ¡Hola @${user.split('@')[0]}!
Bienvenido al grupo.
Esperamos que te diviertas y participes activamente. 🥳`

    await conn.sendMessage(chat, { text: welcomeText, mentions: [user] })
  }
}

handler.event = 'group-participants.update'
export default handler