const handler = async (update) => {
  const { conn } = global
  const { participants, action, id } = update
  if (action !== 'add') return // Solo entra alguien
  if (!id) return

  try {
    const groupMetadata = await conn.groupMetadata(id)
    const groupName = groupMetadata.subject

    for (let user of participants) {
      // Obtener foto de perfil del usuario
      let ppUrl = 'https://telegra.ph/file/0d4d3f3d0f7c1a0d0a4f9.jpg' // Foto default
      try {
        ppUrl = await conn.profilePictureUrl(user, 'image')
      } catch {}

      const welcomeText = 
`👋 ¡Hola @${user.split('@')[0]}!
Bienvenido(a) al grupo *${groupName}*.
Esperamos que te diviertas y participes activamente. 🥳`

      // Enviar mensaje con foto
      await conn.sendMessage(id, { 
        image: { url: ppUrl },
        caption: welcomeText,
        mentions: [user]
      })
    }

  } catch (err) {
    console.error('Error en welcome.js:', err)
  }
}

handler.event = 'group-participants.update'
export default handler