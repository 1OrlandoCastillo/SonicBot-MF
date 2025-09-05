import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

// Importación compatible CommonJS
import pkg from '@whiskeysockets/baileys'
const { proto, makeWASocket, fetchLatestBaileysVersion } = pkg

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

        // Configuración inicial de usuario, chat y bot
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

        let settings = global.db.data.settings[this.user.jid] ||= {}
        if (!('self' in settings)) settings.self = false
        if (!('autoread' in settings)) settings.autoread = true

    } catch (e) {
        console.error(e)
    }

    // Si el mensaje no tiene texto, se ignora
    if (typeof m.text !== 'string') m.text = ''
    if (!m.text) return

    // Determinar prefijo y comando
    let usedPrefix = '.'
    let text = m.text.startsWith(usedPrefix) ? m.text.slice(usedPrefix.length) : ''
    let [command, ...args] = text.split(/\s+/)
    command = command?.toLowerCase()

    // Procesar plugins
    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
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

    // Ejecutar comando solo si existe
    if (command) {
        for (let plugin of processedPlugins) {
            const isMatchCommand = plugin.command && plugin.command.some(cmd => {
                if (typeof cmd === 'string') return cmd.toLowerCase() === command
                if (cmd instanceof RegExp) return new RegExp(cmd).test(command)
                return false
            })
            if (isMatchCommand) {
                try {
                    await plugin.handler.call(this, m, {
                        conn: this,
                        __dirname: ___dirname,
                        __filename: join(___dirname, plugin.name),
                        usedPrefix,
                        command,
                        args,
                        text: args.join(' ').trim()
                    })
                    break
                } catch (e) {
                    console.error(`Error ejecutando plugin ${plugin.name}:`, e)
                }
            }
        }
    }

    // Fin del handler
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizó 'handler.js'"))
})