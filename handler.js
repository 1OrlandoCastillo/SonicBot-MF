import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate, conn, opts) {
  this.msgqueque = this.msgqueque || []
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0
    m.limit = false

    // Inicialización de usuario y chat
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

    let chat = global.db.data.chats[m.chat] || {}
    global.db.data.chats[m.chat] = {
      isBanned: chat.isBanned || false,
      bienvenida: chat.bienvenida ?? true,
      antiLink: chat.antiLink || false,
      onlyLatinos: chat.onlyLatinos || false,
      nsfw: chat.nsfw || false,
      expired: isNumber(chat.expired) ? chat.expired : 0
    }

    let settings = global.db.data.settings[this.user.jid] || {}
    global.db.data.settings[this.user.jid] = {
      self: settings.self || false,
      autoread: settings.autoread || false,
      status: settings.status || 0
    }

    if (opts?.nyimak) return
    if (!m.fromMe && opts?.self) return
    if (opts?.swonly && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    let _user = global.db.data.users[m.sender]
    const isROwner = [conn.decodeJid(conn.user.id), ...global.owner.map(([number]) => number)]
      .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.premium

    if (opts?.queque && m.text && !(isMods || isPrems)) {
      let queque = this.msgqueque, time = 5000
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async () => {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      const __filename = join(___dirname, name)

      if (typeof plugin.all === 'function') {
        try { await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }) }
        catch (e) { console.error(e) }
      }

      if (!opts?.restrict && plugin.tags?.includes('admin')) continue

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ?? conn.prefix ?? global.prefix
      let match = (_prefix instanceof RegExp
        ? [[_prefix.exec(m.text), _prefix]]
        : Array.isArray(_prefix)
          ? _prefix.map(p => [p instanceof RegExp ? p.exec(m.text) : new RegExp(str2Regex(p)).exec(m.text), p instanceof RegExp ? p : new RegExp(str2Regex(p))])
          : [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
      ).find(p => p[1])

      if (typeof plugin.before === 'function') {
        if (await plugin.before.call(this, m, { match, conn: this })) continue
      }

      if (!match) continue
      let usedPrefix = (match[0] || '')[0]
      if (!usedPrefix) continue

      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split(/\s+/)
      command = command.toLowerCase()
      args = args || []

      let isAccept = plugin.command instanceof RegExp
        ? plugin.command.test(command)
        : Array.isArray(plugin.command)
          ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
          : typeof plugin.command === 'string'
            ? plugin.command === command
            : false

      if (!isAccept) continue
      m.plugin = name

      try {
        await plugin.call(this, m, { match, usedPrefix, command, args, conn: this })
      } catch (e) {
        console.error(e)
        let text = format(e)
        for (let key of Object.values(global.APIKeys)) text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
        m.reply?.(text)
      }
      break
    }

  } catch (e) {
    console.error(e)
  }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'