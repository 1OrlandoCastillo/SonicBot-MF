import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

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

        // Inicializar usuario, chat y settings
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
        } catch (e) {
            console.error(e)
        }

        if (opts['nyimak']) return
        if (!m.fromMe && opts['self']) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        const _user = global.db.data?.users?.[m.sender] || {}

        // Detectar permisos del usuario
        const createOwnerIds = number => {
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

        // Procesar plugins
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

            if (typeof normalizedPlugin.command === 'string') normalizedPlugin.command = [normalizedPlugin.command]
            if (normalizedPlugin.command instanceof RegExp) normalizedPlugin.command = [normalizedPlugin.command.source]

            processedPlugins.push(normalizedPlugin)
        }

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        const usedPrefix = '.'
        let commandExecuted = false

        // Ejecutar comandos
        for (let plugin of processedPlugins) {
            if (!plugin.command.length) continue
            let _prefix = plugin.customPrefix || usedPrefix
            let match = m.text.match(new RegExp(`^${_prefix}(${plugin.command.join('|')})`, 'i'))
            if (!match) continue

            const command = match[1].toLowerCase()
            const args = m.text.trim().split(/\s+/).slice(1)

            try {
                await plugin.handler.call(this, m, {
                    conn: this,
                    args,
                    command,
                    text: args.join(' ').trim(),
                    __dirname: ___dirname
                })
                m.plugin = plugin.name
                m.command = command
                m.args = args
                commandExecuted = true
            } catch (e) {
                console.error(`Error ejecutando plugin ${plugin.name}:`, e)
            }
        }

        // Ignorar comandos inexistentes sin enviar mensaje
        if (!commandExecuted) return

        // Actualizar stats y experiencia
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.limit -= m.limit * 1
            }
        }

    } catch (e) {
        console.error(e)
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizó 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})