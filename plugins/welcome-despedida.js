// Bienvenida y despedida dinámicas con .setwelcome y .setbye
// Funciona con API externa, sin canvas ni jimp

if (!global.conn) throw new Error('❌ global.conn no está definido')

// Configuración por grupo
let groupMessages = {} // { 'groupId@g.us': { welcome: '', goodbye: '' } }

// -------------------- EVENTO --------------------
global.conn.ev.on('group-participants.update', async (update) => {
    try {
        const { id } = update
        const participants = update.participants || update.users
        const action = update.action || update.type
        if (!id || !participants) return

        const groupMetadata = await global.conn.groupMetadata(id)
        const groupName = groupMetadata.subject

        for (let user of participants) {
            const username = user.split('@')[0]

            let avatar
            try {
                avatar = await global.conn.profilePictureUrl(user, 'image')
            } catch {
                avatar = 'https://telegra.ph/file/0d4d3f3d0f7c1a0d0a4f9.jpg'
            }

            // Mensajes por grupo o por defecto
            const welcomeMsg = (groupMessages[id] && groupMessages[id].welcome) || `👋 ¡Hola @user! Bienvenido(a) al grupo *${groupName}*`
            const goodbyeMsg = (groupMessages[id] && groupMessages[id].goodbye) || `😢 @user ha salido del grupo *${groupName}*`

            let apiUrl, caption
            if (action === 'add') {
                apiUrl = `https://some-random-api.com/canvas/welcome?type=png&username=${encodeURIComponent(username)}&discriminator=0001&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent('https://i.ibb.co/5cF1B3v/welcome-bg.jpg')}`
                caption = welcomeMsg.replace('@user', `@${username}`)
            } else if (action === 'remove') {
                apiUrl = `https://some-random-api.com/canvas/leave?type=png&username=${encodeURIComponent(username)}&discriminator=0001&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent('https://i.ibb.co/5cF1B3v/welcome-bg.jpg')}`
                caption = goodbyeMsg.replace('@user', `@${username}`)
            } else {
                continue
            }

            await global.conn.sendMessage(id, {
                image: { url: apiUrl },
                caption,
                mentions: [user]
            })
        }

    } catch (err) {
        console.error('❌ Error en welcome-despedida.js:', err)
    }
})

// -------------------- COMANDOS --------------------

// Este ejemplo asume que tienes un sistema simple para detectar mensajes recibidos
global.conn.ev.on('messages.upsert', async (m) => {
    try {
        const message = m.messages[0]
        if (!message.message || !message.key.fromMe) return
        const from = message.key.remoteJid
        const body = message.message.conversation || ''

        // Solo en grupos
        if (!from.endsWith('@g.us')) return

        // .setwelcome
        if (body.startsWith('.setwelcome ')) {
            const text = body.replace('.setwelcome ', '')
            if (!groupMessages[from]) groupMessages[from] = {}
            groupMessages[from].welcome = text
            await global.conn.sendMessage(from, { text: `✅ Mensaje de bienvenida actualizado:\n${text}` })
        }

        // .setbye
        if (body.startsWith('.setbye ')) {
            const text = body.replace('.setbye ', '')
            if (!groupMessages[from]) groupMessages[from] = {}
            groupMessages[from].goodbye = text
            await global.conn.sendMessage(from, { text: `✅ Mensaje de despedida actualizado:\n${text}` })
        }

    } catch (err) {
        console.error('❌ Error en comandos de welcome-despedida.js:', err)
    }
})
