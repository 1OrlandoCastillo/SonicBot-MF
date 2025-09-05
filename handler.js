import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () { clearTimeout(this); resolve() }, ms))

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
        try {
            let user = global.db.data.users[m.sender] ||= {}
            if (!isNumber(user.exp)) user.exp = 0
            if (!isNumber(user.limit)) user.limit = 10
            if (!('registered' in user)) user.registered = false
            if (!user.registered) {
                if (!('name' in user)) user.name = m.name
                if (!isNumber(user.age)) user.age = -1
                if (!isNumber(user.regTime)) user.regTime = -1
            }
            if (!('banned' in user)) user.banned = false
            if (!isNumber(user.level)) user.level = 0
            if (!isNumber(user.coins)) user.coins = 0
            let chat = global.db.data.chats[m.chat] ||= {}
            if (!('isBanned' in chat)) chat.isBanned = false
            if (!('bienvenida' in chat)) chat.bienvenida = true
            if (!('antiLink' in chat)) chat.antiLink = false
            if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
            if (!('nsfw' in chat)) chat.nsfw = false
            if (!isNumber(chat.expired)) chat.expired = 0
            let settings = global.db.data.settings[this.user.jid] ||= {}
            if (!('self' in settings)) settings.self = false
            if (!('autoread' in settings)) settings.autoread = true
            if (global.db.data.notes && global.db.data.notes[m.chat]) {
                const now = Date.now()
                const originalLength = global.db.data.notes[m.chat].length
                global.db.data.notes[m.chat] = global.db.data.notes[m.chat].filter(note => note.expiresAt > now)
                const cleanedLength = global.db.data.notes[m.chat].length
                if (originalLength > cleanedLength) {
                    console.log(`[NOTAS] Se limpiaron ${originalLength - cleanedLength} notas expiradas en ${m.chat}`)
                }
            }
        } catch (e) {
            console.error(e)
        }
        if (opts['nyimak']) return
        if (!m.fromMe && opts['self']) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''
        let _user = global.db.data?.users?.[m.sender]
        const createOwnerIds = (number) => {
            const cleanNumber = number.replace(/[^0-9]/g, '')
            return [
                cleanNumber + '@s.whatsapp.net',
                cleanNumber + '@lid'
            ]
        }
        const allOwnerIds = [
            this.decodeJid(this.user.id),
            ...global.owner.flatMap(([number]) => createOwnerIds(number)),
            ...(global.ownerLid || []).flatMap(([number]) => createOwnerIds(number))
        ]
        const isROwner = allOwnerIds.includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user?.prem == true
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
        const groupMetadata = (m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const user = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {}
        const bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {}
        const isRAdmin = user?.admin == 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin == 'admin' || false
        const isBotAdmin = bot?.admin || false
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        global.idcanal = '120363403143798163@newsletter'
        global.namecanal = 'LOVELLOUD Official Channel'
        global.rcanal = {
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: idcanal,
                    serverMessageId: 100,
                    newsletterName: namecanal
                }
            }
        }
        let usedPrefix = '.'
        let commandExecuted = false
        const processedPlugins = []
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            let normalizedPlugin = {
                name: name,
                handler: plugin.handler || plugin,
                command: plugin.command || [],
                tags: plugin.tags || [],
                help: plugin.help || [],
                all: plugin.all,
                customPrefix: plugin.customPrefix
            }
            if (typeof normalizedPlugin.command === 'string') {
                normalizedPlugin.command = [normalizedPlugin.command]
            }
            if (normalizedPlugin.command instanceof RegExp) {
                normalizedPlugin.command = [normalizedPlugin.command.source]
            }
            processedPlugins.push(normalizedPlugin)
        }
        const sessionPlugins = ['xnxx.js', 'hentai.js', 'xvideos.js']
        for (let plugin of processedPlugins) {
            if (plugin.handler && typeof plugin.handler.before === 'function' && sessionPlugins.includes(plugin.name)) {
                try {
                    await plugin.handler.before.call(this, m, {
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                    if (m.commandExecuted) break
                } catch (e) {
                    console.error(`Error en handler.before de ${plugin.name}:`, e)
                }
            }
        }
        for (let plugin of processedPlugins) {
            const __filename = join(___dirname, plugin.name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error(`Error en plugin.all de ${plugin.name}:`, e)
                }
            }
            if (!opts['restrict']) {
                if (plugin.tags && plugin.tags.includes('admin')) continue
            }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
            let match = (_prefix instanceof RegExp ?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1] && p[0])
            if (!match) continue
            const prefixMatch = match[0]
            const noPrefix = m.text.slice(prefixMatch[0].length).trim()
            const [commandText, ...args] = noPrefix.split(/\s+/)
            const command = commandText?.toLowerCase()
            const isMatchCommand = plugin.command && plugin.command.some(cmd => {
                if (typeof cmd === 'string') {
                    return command === cmd.toLowerCase()
                } else if (cmd instanceof RegExp) {
                    return cmd.test(command)
                }
                return false
            })
            if (isMatchCommand) {
                const allowedPrivateCommands = ['qr', 'code', 'setbotname', 'setbotimg', 'setautoread']
                if (!m.isGroup && !allowedPrivateCommands.includes(command) && !isOwner) {
                    return
                }
                if (m.isGroup && global.db.data.botGroups && global.db.data.botGroups[m.chat] === false) {
                    const alwaysAllowedCommands = ['grupo']
                    if (!alwaysAllowedCommands.includes(command) && !isOwner) {
                        return m.reply(`*[🪐] El bot está desactivado en este grupo.*\n\n> Pídele a un administrador que lo active.`)
                    }
                }
                m.commandExecuted = true
                try {
                    await plugin.handler.call(this, m, {
                        match,
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename,
                        usedPrefix: prefixMatch[0],
                        command,
                        args,
                        text: args.join(' ').trim()
                    })
                    m.plugin = plugin.name
                    m.command = command
                    m.args = args
                } catch (e) {
                    m.error = e
                    console.error(`Error ejecutando plugin ${plugin.name}:`, e)
                }
            }
        }
        // Funciones Anti-spam y Anti-flood
        const isCommand = (text) => {
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = this.prefix || global.prefix
            return (_prefix instanceof RegExp ?
                _prefix.test(text) :
                Array.isArray(_prefix) ?
                    _prefix.some(p => new RegExp(str2Regex(p)).test(text)) :
                    typeof _prefix === 'string' ?
                        new RegExp(str2Regex(_prefix)).test(text) :
                        false
            )
        }
        const handleAntiMedia = async (mediaType) => {
            const antiMediaType = `anti${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`
            if (m.isGroup && global.db.data[antiMediaType] && global.db.data[antiMediaType][m.chat] === true) {
                const isMediaMessage = m.message && (m.message[`${mediaType}Message`] || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.[`${mediaType}Message`])
                if (isMediaMessage) {
                    if (isCommand(m.text)) return
                    if (!isAdmin) {
                        try {
                            await this.sendMessage(m.chat, { delete: m.key })
                        } catch (error) {
                            console.error(`Error eliminando ${mediaType}:`, error)
                        }
                        return
                    }
                }
            }
        }
        const handleAntiLink = async () => {
            if (m.isGroup && global.db.data.antiLink && global.db.data.antiLink[m.chat] === true) {
                const text = m.text || ''
                const contieneLink = /(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(text)
                if (contieneLink) {
                    if (isCommand(text)) return
                    if (!isAdmin) {
                        try {
                            await this.sendMessage(m.chat, { delete: m.key })
                            await this.sendMessage(m.chat, {
                                text: `@${m.sender.split('@')[0]} está prohibido links en este grupo, serás eliminado.`,
                                contextInfo: {
                                    ...rcanal.contextInfo,
                                    mentionedJid: [m.sender]
                                }
                            }, { quoted: m })
                            await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                        } catch (error) {
                            console.error('Error en anti-link:', error)
                            try {
                                await this.sendMessage(m.chat, { delete: m.key })
                                await this.sendMessage(m.chat, {
                                    text: `@${m.sender.split('@')[0]} está prohibido links en este grupo, serás eliminado.`,
                                    contextInfo: {
                                        ...rcanal.contextInfo,
                                        mentionedJid: [m.sender]
                                    }
                                }, { quoted: m })
                            } catch (e) {
                                console.error('Error eliminando mensaje con link:', e)
                            }
                        }
                        return
                    }
                }
            }
        }
        const handleAntiSpam = async () => {
            if (m.isGroup && global.db.data.antiSpam && global.db.data.antiSpam[m.chat] === true) {
                if (!isAdmin) {
                    if (!global.db.data.spamCount) global.db.data.spamCount = {}
                    if (!global.db.data.spamCount[m.chat]) global.db.data.spamCount[m.chat] = {}
                    if (!global.db.data.spamCount[m.chat][m.sender]) {
                        global.db.data.spamCount[m.chat][m.sender] = {
                            count: 0,
                            lastMessage: 0,
                            messages: []
                        }
                    }
                    const now = Date.now()
                    const userSpam = global.db.data.spamCount[m.chat][m.sender]
                    const timeDiff = now - userSpam.lastMessage
                    if (timeDiff < 2000) {
                        userSpam.count++
                        userSpam.lastMessage = now
                        userSpam.messages.push(m.key)
                        if (userSpam.count >= 3) {
                            try {
                                for (const messageKey of userSpam.messages) {
                                    try {
                                        await this.sendMessage(m.chat, { delete: messageKey })
                                    } catch (e) {
                                        console.error('Error eliminando mensaje de spam:', e)
                                    }
                                }
                                await this.sendMessage(m.chat, {
                                    text: `@${m.sender.split('@')[0]} no está permitido spam y será eliminado.`,
                                    contextInfo: {
                                        ...rcanal.contextInfo,
                                        mentionedJid: [m.sender]
                                    }
                                }, { quoted: m })
                                await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                                userSpam.count = 0
                                userSpam.messages = []
                            } catch (error) {
                                console.error('Error en anti-spam:', error)
                            }
                            return
                        }
                    } else {
                        userSpam.count = 1
                        userSpam.lastMessage = now
                        userSpam.messages = [m.key]
                    }
                }
            }
        }
        const handleAntiContact = async () => {
            if (m.isGroup && global.db.data.antiContact && global.db.data.antiContact[m.chat] === true) {
                if (m.message && (m.message.contactMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.contactMessage)) {
                    if (isCommand(m.text)) return
                    if (!isAdmin) {
                        try {
                            await this.sendMessage(m.chat, { delete: m.key })
                        } catch (error) {
                            console.error('Error eliminando contacto:', error)
                        }
                        return
                    }
                }
            }
        }
        const handleAntiMention = async () => {
            if (m.isGroup && global.db.data.antiMention && global.db.data.antiMention[m.chat] === true) {
                if (m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo && m.message.extendedTextMessage.contextInfo.mentionedJid && m.message.extendedTextMessage.contextInfo.mentionedJid.length > 0) {
                    if (isCommand(m.text)) return
                    if (!isAdmin) {
                        try {
                            await this.sendMessage(m.chat, { delete: m.key })
                            await this.sendMessage(m.chat, {
                                text: `@${m.sender.split('@')[0]} las menciones están prohibidas.`,
                                contextInfo: {
                                    ...rcanal.contextInfo,
                                    mentionedJid: [m.sender]
                                }
                            }, { quoted: m })
                        } catch (error) {
                            console.error('Error en anti-menciones:', error)
                        }
                        return
                    }
                }
            }
        }
        const handleAntiDocument = async () => {
            if (m.isGroup && global.db.data.antiDocument && global.db.data.antiDocument[m.chat] === true) {
                if (m.message && (m.message.documentMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage)) {
                    if (isCommand(m.text)) return
                    if (!isAdmin) {
                        try {
                            await this.sendMessage(m.chat, { delete: m.key })
                        } catch (error) {
                            console.error('Error eliminando documento:', error)
                        }
                        return
                    }
                }
            }
        }
        const handleAntiCaracter = async () => {
            if (m.isGroup && global.db.data.antiCaracter && global.db.data.antiCaracter[m.chat] && global.db.data.antiCaracter[m.chat].enabled === true) {
                if (m.text && m.text.length > global.db.data.antiCaracter[m.chat].limit) {
                    if (isCommand(m.text)) return
                    if (!isAdmin) {
                        try {
                            await this.sendMessage(m.chat, { delete: m.key })
                            await this.sendMessage(m.chat, {
                                text: `@${m.sender.split('@')[0]} el mensaje excede el límite de ${global.db.data.antiCaracter[m.chat].limit} caracteres permitidos, serás eliminado.`,
                                contextInfo: {
                                    ...rcanal.contextInfo,
                                    mentionedJid: [m.sender]
                                }
                            }, { quoted: m })
                            await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                        } catch (error) {
                            console.error('Error en anti-caracteres:', error)
                            try {
                                await this.sendMessage(m.chat, { delete: m.key })
                                await this.sendMessage(m.chat, {
                                    text: `@${m.sender.split('@')[0]} el mensaje excede el límite de ${global.db.data.antiCaracter[m.chat].limit} caracteres permitidos, serás eliminado.`,
                                    contextInfo: {
                                        ...rcanal.contextInfo,
                                        mentionedJid: [m.sender]
                                    }
                                }, { quoted: m })
                            } catch (e) {
                                console.error('Error eliminando mensaje con caracteres excesivos:', e)
                            }
                        }
                        return
                    }
                }
            }
        }
        await handleAntiLink()
        await handleAntiMedia('img')
        await handleAntiMedia('audio')
        await handleAntiMedia('video')
        await handleAntiMedia('sticker')
        await handleAntiContact()
        await handleAntiMention()
        await handleAntiDocument()
        await handleAntiCaracter()
        if (m.isGroup && global.db.data.soloAdmin && global.db.data.soloAdmin[m.chat] === true) {
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = this.prefix
            let isCommand = (_prefix instanceof RegExp ?
                _prefix.test(m.text) :
                Array.isArray(_prefix) ?
                    _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
                    typeof _prefix === 'string' ?
                        new RegExp(str2Regex(_prefix)).test(m.text) :
                        false
            )
            if (isCommand && !isAdmin && !isOwner) {
                try {
                    await this.sendMessage(m.chat, {
                        text: `╭─「 ✦ 🔐 ᴍᴏᴅᴏ sᴏʟᴏ-ᴀᴅᴍɪɴs ✦ 」─╮\n│\n╰➺ ✧ @${m.sender.split('@')[0]} el bot está en\n╰➺ ✧ modo *Solo Administradores*\n│\n╰➺ ✧ Solo admins del grupo y\n╰➺ ✧ owners del bot pueden usar comandos\n│\n╰➺ ✧ *Estado:* 🔐 Restringido\n\n> LOVELLOUD Official`,
                        contextInfo: {
                            ...rcanal.contextInfo,
                            mentionedJid: [m.sender]
                        }
                    }, { quoted: m })
                } catch (error) {
                    console.error('Error en solo-admin:', error)
                }
                return
            }
        }
        if (m.text && !commandExecuted && !m.commandExecuted) {
            if (!m.isGroup) return
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = this.prefix ? this.prefix : global.prefix
            let match = (_prefix instanceof RegExp ?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1] && p[0])
            if (match) {
                const prefixMatch = match[0]
                const noPrefix = m.text.slice(prefixMatch[0].length).trim()
                const [commandText, ...args] = noPrefix.split(/\s+/)
                const command = commandText?.toLowerCase()
                if (command) {
                    const fullCommand = prefixMatch[0] + commandText
                    const menuCommand = prefixMatch[0] + 'menu'
                    let bestSuggestion = null
                    let bestScore = 0
                    const allCommands = []
                    processedPlugins.forEach(plugin => {
                        if (plugin.command && Array.isArray(plugin.command)) {
                            plugin.command.forEach(cmd => {
                                if (typeof cmd === 'string') {
                                    allCommands.push(cmd)
                                }
                            })
                        }
                    })
                    allCommands.forEach(cmd => {
                        if (cmd.toLowerCase() !== command) {
                            let score = 0
                            const cmdLower = cmd.toLowerCase()
                            if (command.length === 1) {
                                if (cmdLower.startsWith(command)) score += 50
                                if (cmdLower.includes(command)) score += 30
                            }
                            if (command.length <= 3) {
                                if (cmdLower.startsWith(command)) score += 40
                                if (cmdLower.includes(command)) score += 25
                            }
                            if (command.length === cmdLower.length) {
                                let charMatches = 0
                                for (let i = 0; i < command.length; i++) {
                                    if (command[i] === cmdLower[i]) charMatches++
                                }
                                if (charMatches / command.length >= 0.7) score += 35
                            }
                            if (cmdLower.includes(command)) score += 20
                            if (command.includes(cmdLower)) score += 15
                            if (cmdLower.startsWith(command) || command.startsWith(cmdLower)) score += 10
                            if (cmdLower.endsWith(command) || command.endsWith(cmdLower)) score += 8
                            for (let i = 0; i < Math.min(command.length, cmdLower.length); i++) {
                                if (command[i] === cmdLower[i]) score += 3
                            }
                            if (command.length === cmdLower.length) score += 5
                            if (score > bestScore) {
                                bestScore = score
                                bestSuggestion = cmd
                            }
                        }
                    })
                    let message = `《✧》El comando *${fullCommand}* no existe en KIYOMI MD.\n\n`
                    if (bestSuggestion && bestScore >= 10) {
                        const cmdLower = bestSuggestion.toLowerCase()
                        let similarityScore = 0
                        let charMatches = 0
                        for (let i = 0; i < Math.min(command.length, cmdLower.length); i++) {
                            if (command[i] === cmdLower[i]) charMatches++
                        }
                        const charSimilarity = charMatches / Math.max(command.length, cmdLower.length)
                        let contentSimilarity = 0
                        if (cmdLower.includes(command)) contentSimilarity = command.length / cmdLower.length
                        else if (command.includes(cmdLower)) contentSimilarity = cmdLower.length / command.length
                        let startSimilarity = 0
                        const minLength = Math.min(command.length, cmdLower.length)
                        for (let i = 0; i < minLength; i++) {
                            if (command[i] === cmdLower[i]) startSimilarity += 1
                        }
                        startSimilarity = startSimilarity / minLength
                        const finalSimilarity = (charSimilarity * 0.4 + contentSimilarity * 0.4 + startSimilarity * 0.2)
                        const percentage = Math.min(100, Math.round(finalSimilarity * 100))
                        message += `*Posibilidad de que sea:*\n`
                        message += `╰➺ *${prefixMatch[0]}${bestSuggestion}* (${percentage}%)\n\n`
                    }
                    message += `> Por favor usa *${menuCommand}* para ver la lista de comandos disponibles.`
                    return this.sendMessage(m.chat, {
                        text: message,
                        contextInfo: {
                            ...rcanal.contextInfo
                        }
                    }, { quoted: m })
                }
            }
        }
        global.dfail = (type, m, conn) => {
            const msg = {
                rowner: `✤ Hola, este comando solo puede ser utilizado por el *Creador* de la Bot.`,
                owner: `
