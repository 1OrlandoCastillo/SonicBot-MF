global.conn.ev.on('group-participants.update', async (update) => {
    try {
        const { id, participants, action } = update
        if (!id || !participants) return

        // Evitar duplicados usando llave única
        const eventKey = `${id}-${participants.join(',')}-${action}`
        if (recentEvents.has(eventKey)) return
        recentEvents.add(eventKey)
        setTimeout(() => recentEvents.delete(eventKey), 5000)

        // Cache metadata
        if (!cachedGroups[id]) {
            try {
                const meta = await global.conn.groupMetadata(id)
                cachedGroups[id] = { subject: meta.subject, size: meta.participants.length }
            } catch {
                cachedGroups[id] = { subject: 'Grupo', size: 0 }
            }
        }

        const groupName = cachedGroups[id].subject

        // Filtrar si varios usuarios se van/entran: solo uno
        const user = participants[0]
        const username = user.split('@')[0]

        // Evitar que se envíe cuando el bot mismo sale
        if (user === global.conn.user.jid && action === 'remove') return

        const welcomeMsg = (groupMessages[id] && groupMessages[id].welcome) ||
`🛡️ ＬＯＢＢＹ ＥＮＴＲＬＯＣＫＥＤ 🛡️
━━━━━━━━━━━━━━━
⚔️ Jugador: @user  
📡 Servidor: *${groupName}*  
🎮 Estado: ¡En línea!  

Bienvenido al escuadrón 🚀`

        const goodbyeMsg = (groupMessages[id] && groupMessages[id].goodbye) ||
`💀 ＳＡＬＩＤＡ ＥＮＴＲＬＯＣＫＥＤ 💀
━━━━━━━━━━━━━━━
⚔️ Jugador: @user  
📡 Servidor: *${groupName}*  
🎮 Estado: ¡Desconectado!  

Nos vemos en la próxima misión ⚡`

        if (action === 'add') {
            await global.conn.sendMessage(id, {
                text: welcomeMsg.replace('@user', `@${username}`),
                mentions: [user]
            })
            cachedGroups[id].size++
        } else if (action === 'remove') {
            await global.conn.sendMessage(id, {
                text: goodbyeMsg.replace('@user', `@${username}`),
                mentions: [user]
            })
            cachedGroups[id].size--
        }

    } catch (err) {
        console.error('❌ Error en welcome-despedida.js:', err)
    }
})
