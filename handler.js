import { smsg } from './lib/simple.js'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(r => setTimeout(r, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()
    m = smsg(this, m) || m
    if (!m || m.messageStubType) return
    m.exp = 0; m.limit = false

    try {
        let user = global.db.data.users[m.sender] ||= {}
        if (!isNumber(user.exp)) user.exp = 0
        if (!isNumber(user.limit)) user.limit = 10
        if (!('registered' in user)) user.registered = false
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
    } catch (e) {
        console.error(e)
    }

    if (opts['nyimak']) return
    if (!m.fromMe && opts['self']) return
    if (opts['swonly'] && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    let _user = global.db.data?.users?.[m.sender]
    const allOwnerIds = [
        this.decodeJid(this.user.jid),
        ...global.owner.flatMap(([n]) => [n.replace(/[^0-9]/g, '') + '@s.whatsapp.net']),
        ...(global.ownerLid || []).flatMap(([n]) => [n.replace(/[^0-9]/g, '') + '@s.whatsapp.net'])
    ]
    const isROwner = allOwnerIds.includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || (global.mods || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isPrems = isROwner || (global.prems || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user?.prem == true

    if (opts['queque'] && m.text && !(isMods || isPrems)) {
        let queque = this.msgqueque, time = 5000
        queque.push(m.id || m.key.id)
        setInterval(async function () {
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
    let usedPrefix = '.'
    let commandExecuted = false

    const processedPlugins = Object.entries(global.plugins)
        .filter(([_, p]) => p && !p.disabled)
        .map(([name, plugin]) => ({
            name,
            handler: plugin.handler || plugin,
            command: Array.isArray(plugin.command) ? plugin.command : [plugin.command || []],
            all: plugin.all
        }))

    for (let plugin of processedPlugins) {
        if (typeof plugin.all === 'function') {
            try {
                await plugin.all.call(this, m, { conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname })
            } catch (e) { console.error(`Error en plugin.all de ${plugin.name}:`, e) }
        }
    }

    for (let plugin of processedPlugins) {
        const __filename = join(___dirname, plugin.name)
        const match = new RegExp(`^${usedPrefix}(${plugin.command.join('|')})`, 'i').exec(m.text)
        if (!match) continue
        const command = match[1].toLowerCase()
        commandExecuted = true
        try {
            await plugin.handler.call(this, m, { conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename, usedPrefix, command, args: m.text.slice(match[0].length).trim().split(/\s+/), text: m.text.slice(match[0].length).trim() })
            m.plugin = plugin.name
            m.command = command
        } catch (e) {
            console.error(`Error ejecutando plugin ${plugin.name}:`, e)
        }
    }

    if (opts['queque'] && m.text) {
        const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
        if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizó 'handler.js'"))
})