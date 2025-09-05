export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return
        if (m.messageStubType) return
        m.exp = 0
        m.limit = false

        // Inicialización de usuario, chat y settings
        try {  
            let user = global.db.data.users[m.sender] ||= {}  
            if (!('exp' in user) || !isNumber(user.exp)) user.exp = 0  
            if (!('limit' in user) || !isNumber(user.limit)) user.limit = 10  
            if (!('registered' in user)) user.registered = false  
            if (!user.registered) {  
                if (!('name' in user)) user.name = m.name  
                if (!('age' in user) || !isNumber(user.age)) user.age = -1  
                if (!('regTime' in user) || !isNumber(user.regTime)) user.regTime = -1  
            }  
            if (!('banned' in user)) user.banned = false  
            if (!('level' in user) || !isNumber(user.level)) user.level = 0  
            if (!('coins' in user) || !isNumber(user.coins)) user.coins = 0  

            let chat = global.db.data.chats[m.chat] ||= {}  
            if (!('isBanned' in chat)) chat.isBanned = false  
            if (!('bienvenida' in chat)) chat.bienvenida = true  
            if (!('antiLink' in chat)) chat.antiLink = false  
            if (!('onlyLatinos' in chat)) chat.onlyLatinos = false  
            if (!('nsfw' in chat)) chat.nsfw = false  
            if (!('expired' in chat) || !isNumber(chat.expired)) chat.expired = 0  

            let settings = global.db.data.settings[this.user.jid] ||= {}  
            if (!('self' in settings)) settings.self = false  
            if (!('autoread' in settings)) settings.autoread = true 

            if (global.db.data.notes && global.db.data.notes[m.chat]) {
                const now = Date.now()
                global.db.data.notes[m.chat] = global.db.data.notes[m.chat].filter(note => note.expiresAt > now)
            }
        } catch (e) {  
            console.error(e)  
        }  

        if (opts['nyimak']) return  
        if (!m.fromMe && opts['self']) return  
        if (opts['swonly'] && m.chat !== 'status@broadcast') return  
        if (typeof m.text !== 'string') m.text = ''  

        let _user = global.db.data?.users?.[m.sender]  

        // Procesamiento de owners y permisos
        const createOwnerIds = (number) => {
            const cleanNumber = number.replace(/[^0-9]/g, '')
            return [cleanNumber + '@s.whatsapp.net', cleanNumber + '@lid']
        }
        const allOwnerIds = [
            conn.decodeJid(global.conn.user.id),
            ...global.owner.flatMap(([number]) => createOwnerIds(number)),
            ...(global.ownerLid || []).flatMap(([number]) => createOwnerIds(number))
        ]
        const isROwner = allOwnerIds.includes(m.sender)
        const isOwner = isROwner || m.fromMe  
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)  
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user?.prem == true  

        // Manejo de cola de mensajes
        if (opts['queque'] && m.text && !(isMods || isPrems)) {  
            let queque = this.msgqueque, time = 1000 * 5  
            const previousID = queque[queque.length - 1]  
            queque.push(m.id || m.key.id)  
            setInterval(async function () {  
                if (queque.indexOf(previousID) === -1) clearInterval(this)  
                await delay(time)  
            }, time)  
        }  

        if (m.isBaileys) return  
        m.exp += Math.ceil(Math.random() * 10)  

        // Procesamiento de plugins
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')  
        let usedPrefix = '.'  
        const processedPlugins = []
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            processedPlugins.push(plugin)
        }

        for (let plugin of processedPlugins) {
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            const match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : [[new RegExp(_prefix).exec(m.text), new RegExp(_prefix)]])
                .find(p => p[1] && p[0])
            if (!match) continue  // <-- Si no hay match, **no hace nada**, ya no envía mensajes de “comando no existe”
            
            // Aquí seguiría la ejecución del comando válido
            const prefixMatch = match[0]
            const noPrefix = m.text.slice(prefixMatch[0].length).trim()
            const [commandText, ...args] = noPrefix.split(/\s+/)
            const command = commandText?.toLowerCase()

            if (plugin.handler) {
                try {
                    await plugin.handler.call(this, m, { args, command })
                } catch (e) {
                    console.error(`Error ejecutando plugin ${plugin.name}:`, e)
                }
            }
        }
    } catch (e) {
        console.error(e)
    }
}