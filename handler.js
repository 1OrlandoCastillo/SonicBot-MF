import { smsg } from './lib/simple.js'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { watchFile, unwatchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import { proto } from '@whiskeysockets/baileys'

export async function handler(chatUpdate) {
    if (!chatUpdate) return
    this.msgqueque = this.msgqueque || []

    try {
        this.pushMessage(chatUpdate.messages).catch(console.error)
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        if (global.db.data == null) await global.loadDatabase()
        m = smsg(this, m) || m
        if (!m || m.messageStubType) return

        // Inicializar usuario y chat
        let user = global.db.data.users[m.sender] ||= {}
        if (!('registered' in user)) user.registered = false
        if (!('banned' in user)) user.banned = false
        if (!('exp' in user)) user.exp = 0
        if (!('limit' in user)) user.limit = 10

        let chat = global.db.data.chats[m.chat] ||= {}
        if (!('isBanned' in chat)) chat.isBanned = false

        const isOwner = [this.user.jid, ...(global.owner?.map(([n]) => n + '@s.whatsapp.net') || [])].includes(m.sender)
        const isMods = isOwner || (global.mods?.map(v => v + '@s.whatsapp.net') || []).includes(m.sender)
        const isPrems = isOwner || (global.prems?.map(v => v + '@s.whatsapp.net') || []).includes(m.sender)

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        let usedPrefix = '.'

        // Procesar plugins
        const processedPlugins = []
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            processedPlugins.push({
                name,
                handler: plugin.handler || plugin,
                command: Array.isArray(plugin.command) ? plugin.command : (plugin.command ? [plugin.command] : []),
                customPrefix: plugin.customPrefix
            })
        }

        let text = m.text || ''
        if (!text.startsWith(usedPrefix)) return  // Solo comandos con prefijo

        const noPrefix = text.slice(usedPrefix.length).trim()
        const [commandText, ...args] = noPrefix.split(/\s+/)
        const command = commandText.toLowerCase()

        // Buscar plugin que coincida
        for (let plugin of processedPlugins) {
            const cmds = plugin.command.map(c => typeof c === 'string' ? c.toLowerCase() : c)
            if (cmds.includes(command)) {
                try {
                    await plugin.handler.call(this, m, {
                        conn: this,
                        args,
                        text: args.join(' '),
                        usedPrefix,
                        command,
                        isOwner,
                        isMods,
                        isPrems,
                        __dirname: ___dirname,
                        __filename: join(___dirname, plugin.name)
                    })
                } catch (e) {
                    console.error(`Error en plugin ${plugin.name}:`, e)
                }
                return  // Comando encontrado, no procesar más
            }
        }

        // Si no hay plugin, simplemente ignorar
    } catch (e) {
        console.error(e)
    }
}

// Recarga automática
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizó 'handler.js'"))
})