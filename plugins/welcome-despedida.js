// Bienvenida y despedida dinámicas con .setwelcome y .setbye
// Optimizado con cache + anti-duplicados + estética mejorada

if (!global.conn) throw new Error('❌ global.conn no está definido')

// Configuración por grupo
let groupMessages = {}     // { 'groupId@g.us': { welcome: '', goodbye: '' } }
let cachedGroups = {}      // { 'id@g.us': { subject, size } }
let recentEvents = new Set() // para evitar duplicados

// -------------------- EVENTO --------------------
global.conn.ev.on('group-participants.update', async (update) => {
    try {
        const { id, participants, action } = update
        if (!id || !participants) return

        // Evitar duplicados usando llave única
        const eventKey = `${id}-${participants.join(',')}-${action}`
        if (recentEvents.has(eventKey)) return
        recentEvents.add(eventKey)
        setTimeout(() => recentEvents.delete(eventKey), 5000) // limpia en 5s

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

        for (let user of participants) {
            const username = user.split('@')[0]

            // Mensajes personalizados o por defecto estilo Lobyy Entrlocked
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
        }

    } catch (err) {
        console.error('❌ Error en welcome-despedida.js:', err)
    }
})

// -------------------- COMANDOS --------------------
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
