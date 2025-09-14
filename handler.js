import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()

export async function handler(chatUpdate) {
  try {
    if (!chatUpdate || !chatUpdate.messages) return
    this.msgqueque = this.msgqueque || []
    const conn = this
    const opts = global.opts || {}
    
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (!global.db.data) await global.loadDatabase().catch(() => {})

    m = smsg(this, m) || m
    m.exp = 0
    m.limit = 0

    // Inicializar usuario
    global.db.data.users[m.sender] ||= {}
    let user = global.db.data.users[m.sender]
    user.exp = isNumber(user.exp) ? user.exp : 0
    user.limit = isNumber(user.limit) ? user.limit : 10
    user.registered = user.registered || false
    user.name = user.name || m.name
    user.age = isNumber(user.age) ? user.age : -1
    user.regTime = isNumber(user.regTime) ? user.regTime : -1
    user.premium = user.premium || false
    user.afk = isNumber(user.afk) ? user.afk : -1
    user.afkReason = user.afkReason || ''
    user.banned = user.banned || false
    user.level = isNumber(user.level) ? user.level : 0
    user.bank = isNumber(user.bank) ? user.bank : 0

    // Inicializar chat
    global.db.data.chats[m.chat] ||= {}
    let chat = global.db.data.chats[m.chat]
    chat.isBanned = chat.isBanned || false
    chat.bienvenida = chat.bienvenida ?? true
    chat.antiLink = chat.antiLink || false
    chat.onlyLatinos = chat.onlyLatinos || false
    chat.nsfw = chat.nsfw || false
    chat.expired = isNumber(chat.expired) ? chat.expired : 0

    // Inicializar settings del bot
    global.db.data.settings[this.user.jid] ||= {}
    let settings = global.db.data.settings[this.user.jid]
    settings.self = settings.self || false
    settings.autoread = settings.autoread ?? true

    // Evitar mensajes si el bot está en modo self o nyimak
    if ((opts.self && !m.fromMe) || opts.nyimak) return

    // Anti spam simple
    global.userSpam ||= {}
    const now = Date.now()
    const spamLimit = 5
    const spamWindow = 5000

    if (!global.userSpam[m.sender]) {
      global.userSpam[m.sender] = { count: 1, lastMessage: now, messages: [m.key] }
    } else {
      const spamData = global.userSpam[m.sender]
      if (now - spamData.lastMessage < spamWindow) {
        spamData.count++
        spamData.messages.push(m.key)
        if (spamData.count > spamLimit) {
          user.banned = true
          try {
            await conn.sendMessage(m.chat, { text: '🚫 Has sido baneado temporalmente por spam.' }, { quoted: m })
            for (const msgKey of spamData.messages) {
              try { await conn.sendMessage(m.chat, { delete: msgKey }) } catch {}
            }
          } catch {}
        }
      } else {
        spamData.count = 1
        spamData.messages = [m.key]
      }
      spamData.lastMessage = now
    }

    // Detectar roles
    const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([num]) => num + '@s.whatsapp.net')].includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || global.mods.includes(m.sender)
    const isPrems = isROwner || global.prems.includes(m.sender) || user.premium

    // Manejo de comandos
    let ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      if (typeof plugin.all === 'function') {
        try { await plugin.all.call(conn, m, { chatUpdate, __dirname: ___dirname, __filename: join(___dirname, name) }) } 
        catch {}
      }

      if (!plugin.command) continue
      let isCommand = Array.isArray(plugin.command) ? plugin.command.some(c => m.text?.toLowerCase().startsWith(c.toLowerCase())) : m.text?.toLowerCase().startsWith(plugin.command.toLowerCase())
      if (!isCommand) continue

      try {
        await plugin.call?.(conn, m, { isOwner, isROwner, isMods, isPrems })
      } catch (e) {
        m.error = e
        try { await conn.sendMessage(m.chat, { text: '❌ Error ejecutando el comando.' }, { quoted: m }) } catch {}
      }
    }

    // Auto-read
    if (settings.autoread) {
      try { await conn.readMessages([m.key]) } catch {}
    }

  } catch (err) {
    console.error('Error en handler.js:', err)
  }
}

// Hot reload
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.reloadHandler) await global.reloadHandler()
})