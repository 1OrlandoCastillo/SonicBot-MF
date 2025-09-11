import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import * as baileys from '@whiskeysockets/baileys'

const { proto } = baileys
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    const opts = this.opts || global.opts || {}
    this.msgqueque = this.msgqueque || []

    if (!chatUpdate?.messages) return
    try { this.pushMessage?.(chatUpdate.messages) } catch(e) { console.error(e) }

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    m.commandExecuted = m.commandExecuted || false
    m.text = m.text || ''

    if (global.db.data == null) await global.loadDatabase()
    m = smsg(this, m) || m
    if (!m || m.messageStubType) return

    try {
        // Inicialización de usuario
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

        // Inicialización de chat
        let chat = global.db.data.chats[m.chat] ||= {}
        if (!('isBanned' in chat)) chat.isBanned = false
        if (!('bienvenida' in chat)) chat.bienvenida = true
        if (!('antiLink' in chat)) chat.antiLink = false
        if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
        if (!('nsfw' in chat)) chat.nsfw = false
        if (!isNumber(chat.expired)) chat.expired = 0

        // Inicialización settings
        let settings = global.db.data.settings[this.user.jid] ||= {}
        if (!('self' in settings)) settings.self = false
        if (!('autoread' in settings)) settings.autoread = true

        // Limpiar notas expiradas
        if (global.db.data.notes?.[m.chat]) {
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

    const createOwnerIds = number => {
        const cleanNumber = number.replace(/[^0-9]/g, '')
        return [cleanNumber + '@s.whatsapp.net', cleanNumber + '@lid']
    }

    const allOwnerIds = [
        this.decodeJid(this.user.jid),
        ...global.owner.flatMap(([number]) => createOwnerIds(number)),
        ...(global.ownerLid || []).flatMap(([number]) => createOwnerIds(number))
    ]

    const isROwner = allOwnerIds.includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user?.prem == true

    // Cola de mensajes
    if (opts['queque'] && m.text && !(isMods || isPrems)) {
        let queque = this.msgqueque
        let time = 5000
        const previousID = queque[queque.length - 1]
        queque.push(m.id || m.key.id)
        const intervalId = setInterval(async () => {
            if (!queque.includes(previousID)) clearInterval(intervalId)
            await delay(time)
        }, time)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    // Metadata y participantes
    const groupMetadata = (m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
    const participants = (m.isGroup ? groupMetadata.participants : []) || []
    const userGroup = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {}
    const bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {}
    const isRAdmin = userGroup?.admin == 'superadmin' || false
    const isAdmin = isRAdmin || userGroup?.admin == 'admin' || false
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

    // Plugins procesados
    const processedPlugins = []
    for (let name in global.plugins) {
        let plugin = global.plugins[name]
        if (!plugin || plugin.disabled) continue
        let normalizedPlugin = {
            name,
            handler: plugin.handler || plugin,
            command: plugin.command || [],
            tags: plugin.tags || [],
            help: plugin.help || [],
            all: plugin.all,
            customPrefix: plugin.customPrefix
        }
        if (typeof normalizedPlugin.command === 'string') normalizedPlugin.command = [normalizedPlugin.command]
        if (normalizedPlugin.command instanceof RegExp) normalizedPlugin.command = [normalizedPlugin.command.source]
        processedPlugins.push(normalizedPlugin)
    }

    const sessionPlugins = ['xnxx.js', 'hentai.js', 'xvideos.js']

    // Ejecutar handler.before de plugins
    for (let plugin of processedPlugins) {
        if (plugin.handler?.before && sessionPlugins.includes(plugin.name)) {
            try {
                await plugin.handler.before.call(this, m, {
                    conn: this,
                    participants,
                    groupMetadata,
                    user: userGroup,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename: join(___dirname, plugin.name)
                })
                if (m.commandExecuted) break
            } catch (e) {
                console.error(`Error en handler.before de ${plugin.name}:`, e)
            }
        }
    }

    // Ejecutar plugin.all y comandos
    for (let plugin of processedPlugins) {
        const __filename = join(___dirname, plugin.name)

        if (typeof plugin.all === 'function') {
            try {
                await plugin.all.call(this, m, {
                    conn: this,
                    participants,
                    groupMetadata,
                    user: userGroup,
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

        // Validaciones de comandos
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = plugin.customPrefix || this.prefix || global.prefix
        const match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p.exec(m.text) : new RegExp(str2Regex(p)).exec(m.text), p instanceof RegExp ? p : new RegExp(str2Regex(p))]) : [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]).find(p => p[1] && p[0])
        if (!match) continue

        const prefixMatch = match[0]
        const noPrefix = m.text.slice(prefixMatch[0].length).trim()
        const [commandText, ...args] = noPrefix.split(/\s+/)
        const command = commandText?.toLowerCase()
        const isMatchCommand = plugin.command?.some(cmd => typeof cmd === 'string' ? cmd.toLowerCase() === command : cmd instanceof RegExp ? cmd.test(command) : false)
        if (!isMatchCommand) continue

        // Validaciones de grupo y permisos
        const allowedPrivateCommands = ['qr', 'code', 'setbotname', 'setbotimg', 'setautoread']
        if (!m.isGroup && !allowedPrivateCommands.includes(command) && !isOwner) return
        if (m.isGroup && global.db.data.botGroups?.[m.chat] === false && !['grupo'].includes(command) && !isOwner) return m.reply(`*[🪐] El bot está desactivado en este grupo.*`)

        try {
            await plugin.handler.call(this, m, {
                match,
                conn: this,