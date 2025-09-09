// listeners/welcome-despedida.js
// Aseguramos que solo se registre una vez
if (!global.participantListener) {
  global.participantListener = true

  global.conn.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update
      if (!id || !participants) return

      // Evitar duplicados (5s de protección)
      const eventKey = `${id}-${participants.join(',')}-${action}`
      if (!global.recentEvents) global.recentEvents = new Set()
      if (global.recentEvents.has(eventKey)) return
      global.recentEvents.add(eventKey)
      setTimeout(() => global.recentEvents.delete(eventKey), 5000)

      // Cache metadata del grupo
      if (!global.cachedGroups) global.cachedGroups = {}
      if (!global.cachedGroups[id]) {
        try {
          const meta = await global.conn.groupMetadata(id)
          global.cachedGroups[id] = { subject: meta.subject, size: meta.participants.length }
        } catch {
          global.cachedGroups[id] = { subject: 'Grupo', size: 0 }
        }
      }

      const groupName = global.cachedGroups[id].subject
      const user = participants[0]
      const username = user.split('@')[0]

      // Evitar que mande msg cuando el bot mismo sale
      if (user === global.conn.user.jid && action === 'remove') return

      // Configuración de mensajes (si no existe, por defecto ON)
      if (!global.groupMessages) global.groupMessages = {}
      if (!global.groupMessages[id]) {
        global.groupMessages[id] = { welcome: true, goodbye: true }
      }

      // Obtener foto del usuario o del grupo
      let ppUrl
      try {
        ppUrl = await global.conn.profilePictureUrl(user, 'image')
      } catch {
        try {
          ppUrl = await global.conn.profilePictureUrl(id, 'image') // foto del grupo
        } catch {
          ppUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png' // fallback final
        }
      }

      // Mensajes por defecto
      const welcomeMsg = `🛡️ ＬＯＢＢＹ ＥＮＴＲＬＯＣＫＥＤ 🛡️
━━━━━━━━━━━━━━━
⚔️ Jugador: @user  
📡 Servidor: *${groupName}*  
🎮 Estado: ¡En línea!  

Bienvenido al escuadrón 🚀`

      const goodbyeMsg = `💀 ＳＡＬＩＤＡ ＥＮＴＲＬＯＣＫＥＤ 💀
━━━━━━━━━━━━━━━
⚔️ Jugador: @user  
📡 Servidor: *${groupName}*  
🎮 Estado: ¡Desconectado!  

Nos vemos en la próxima misión ⚡`

      // Acciones
      if (action === 'add') {
        if (!global.groupMessages[id].welcome) return
        await global.conn.sendMessage(id, {
          image: { url: ppUrl },
          caption: welcomeMsg.replace('@user', `@${username}`),
          mentions: [user]
        })
        global.cachedGroups[id].size++
      } else if (action === 'remove') {
        if (!global.groupMessages[id].goodbye) return
        await global.conn.sendMessage(id, {
          image: { url: ppUrl },
          caption: goodbyeMsg.replace('@user', `@${username}`),
          mentions: [user]
        })
        global.cachedGroups[id].size--
      }

    } catch (err) {
      console.error('❌ Error en welcome-despedida.js:', err)
    }
  })
}