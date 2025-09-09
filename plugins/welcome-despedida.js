const handler = async (update) => {
  const { conn } = global
  const { participants, id } = update
  const action = update.action || update.type  // detecta add/remove universal

  if (!id || !participants) return

  try {
    const groupMetadata = await conn.groupMetadata(id)
    const groupName = groupMetadata.subject

    for (let user of participants) {
      const username = user.split('@')[0]

      // Obtener avatar, fallback si no existe
      let avatar
      try {
        avatar = await conn.profilePictureUrl(user, 'image')
      } catch {
        avatar = 'https://telegra.ph/file/0d4d3f3d0f7c1a0d0a4f9.jpg'
      }

      let apiUrl, caption

      if (action === 'add') {
        // Bienvenida
        apiUrl = `https://some-random-api.com/canvas/welcome?type=png&username=${encodeURIComponent(username)}&discriminator=0001&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent('https://i.ibb.co/5cF1B3v/welcome-bg.jpg')}`
        caption = `👋 ¡Hola @${username}! Bienvenido(a) al grupo *${groupName}*`
      } else if (action === 'remove') {
        // Despedida
        apiUrl = `https://some-random-api.com/canvas/leave?type=png&username=${encodeURIComponent(username)}&discriminator=0001&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent('https://i.ibb.co/5cF1B3v/welcome-bg.jpg')}`
        caption = `😢 @${username} ha salido del grupo *${groupName}*`
      } else {
        continue // ignorar otras acciones
      }

      await conn.sendMessage(id, {
        image: { url: apiUrl },
        caption,
        mentions: [user]
      })
    }

  } catch (err) {
    console.error('❌ Error en welcome-despedida.js con API:', err)
  }
}

handler.event = 'group-participants.update'
export default handler
