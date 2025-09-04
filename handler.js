import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  if (!chatUpdate || !chatUpdate.messages) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  if (!global.db.data) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    m.exp = 0
    m.limit = false

    // Inicialización de usuario
    let user = global.db.data.users[m.sender] || {}
    global.db.data.users[m.sender] = {
      exp: isNumber(user.exp) ? user.exp : 0,
      limit: isNumber(user.limit) ? user.limit : 10,
      registered: user.registered || false,
      name: user.name || m.name,
      age: isNumber(user.age) ? user.age : -1,
      regTime: isNumber(user.regTime) ? user.regTime : -1,
      afk: isNumber(user.afk) ? user.afk : -1,
      afkReason: user.afkReason || '',
      banned: user.banned || false,
      useDocument: user.useDocument ?? true,
      bank: isNumber(user.bank) ? user.bank : 0,
      level: isNumber(user.level) ? user.level : 0,
      premium: user.premium || false,
      premiumTime: user.premiumTime || 0
    }

    // Inicialización de chat
    let chat = global.db.data.chats[m.chat] || {}
    global.db.data.chats[m.chat] = {
      isBanned: chat.isBanned || false,
      bienvenida: chat.bienvenida ?? true,
      antiLink: chat.antiLink || false,
      onlyLatinos: chat.onlyLatinos || false,
      nsfw: chat.nsfw || false,
      expired: isNumber(chat.expired) ? chat.expired : 0
    }

    if (!m.fromMe && global.opts?.self) return
    if (m.isBaileys) return

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      const __filename = join(___dirname, name)

      if (typeof plugin.all === 'function') {
        try { await plugin.all.call(this, m, { __dirname: ___dirname, __filename }) } 
        catch (e) { console.error(e) }
      }

      if (!plugin.command) continue

      let prefix = plugin.customPrefix ?? global.prefix
      let matched = Array.isArray(prefix)
        ? prefix.map(p => (p instanceof RegExp ? p.exec(m.text) : new RegExp(p).exec(m.text))).find(Boolean)
        : (prefix instanceof RegExp ? prefix.exec(m.text) : new RegExp(prefix).exec(m.text))
      if (!matched) continue

      let usedPrefix = matched[0]
      let args = m.text.replace(usedPrefix, '').trim().split(/\s+/)
      let command = args.shift()?.toLowerCase()

      if (typeof plugin.command === 'string' && plugin.command !== command) continue
      if (Array.isArray(plugin.command) && !plugin.command.includes(command)) continue

      m.plugin = name
      try { await plugin.call(this, m, { command, args }) } 
      catch (e) { console.error(e); m.reply?.(format(e)) }
      break
    }
  } catch (e) {
    console.error(e)
  }
}

// Recarga automática del handler
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
})
