// Este archivo maneja entradas y salidas de participantes
// Funciona en cualquier fork moderno de Baileys y no usa canvas ni jimp

if (!global.conn) throw new Error('❌ global.conn no está definido')

global.conn.ev.on('group-participants.update', async (update) => {
    try {
        console.log('📩 EVENTO RECIBIDO:', update) // debug, elimina después si quieres

        const { id } = update
        const participants = update.participants || update.users // por compatibilidad
        const action = update.action || update.type

        if (!id || !participants) return

        // Obtener metadata del grupo
        const groupMetadata = await global.conn.groupMetadata(id)
        const groupName = groupMetadata.subject

        for (let user of participants) {
            const username = user.split('@')[0]

            // Avatar del usuario, con fallback
            let avatar
            try {
                avatar = await global.conn.profilePictureUrl(user, 'image')
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

            await global.conn.sendMessage(id, {
                image: { url: apiUrl },
                caption,
                mentions: [user]
            })
        }

    } catch (err) {
        console.error('❌ Error en welcome-despedida.js con API:', err)
    }
})
