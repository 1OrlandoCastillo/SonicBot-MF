const handler = async (update) => {
  const { conn } = global
  const { participants, action, id } = update
  if (action !== 'add') return
  if (!id) return

  try {
    const groupMetadata = await conn.groupMetadata(id)
    const groupName = groupMetadata.subject

    for (let user of participants) {
      const username = user.split('@')[0]

      // Intentar obtener avatar
      let avatar
      try {
        avatar = await conn.profilePictureUrl(user, 'image')
      } catch {
        avatar = 'https://telegra.ph/file/0d4d3f3d0f7c1a0d0a4f9.jpg'
      }

      // API externa para tarjeta de bienvenida
      const apiUrl = `https://some-random-api.com/canvas/welcome?type=png&username=${encodeURIComponent(username)}&discriminator=0001&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent('https://i.ibb.co/5cF1B3v/welcome-bg.jpg')}`

      await conn.sendMessage(id, {
        image: { url: apiUrl },
        caption: `👋 ¡Hola @${username}! Bienvenido(a) al grupo *${groupName}*`,
        mentions: [user]
      })
    }

  } catch (err) {
    console.error('❌ Error en welcome.js con API:', err)
  }
}

handler.event = 'group-participants.update'
export default handler
