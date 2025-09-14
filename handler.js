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
  this.msgqueque = this.msgqueque || []
  if (!chatUpdate) return
  if (typeof this.pushMessage === 'function') this.pushMessage(chatUpdate.messages).catch(console.error)
  
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  if (!global.db.data) await global.loadDatabase().catch(console.error)

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0
    m.limit = false

    // ---------- Inicializar usuario, chat y settings ----------
    try {
      const users = global.db.data.users || {}
      const chats = global.db.data.chats || {}
      const settings = global.db.data.settings || {}

      if (!users[m.sender]) users[m.sender] = {
        exp: 0,
        limit: 10,
        registered: false,
        name: m.name,
        age: -1,
        regTime: -1,
        afk: -1,
        afkReason: '',
        banned: false,
        useDocument: false,
        bank: 0,
        level: 0,
        premium: false,
        premiumTime: 0
      }

      if (!chats[m.chat]) chats[m.chat] = {
        isBanned: false,
        bienvenida: true,
        antiLink: false,
        onlyLatinos: false,
        nsfw: false,
        expired: 0
      }

      if (!settings[this.user.jid]) settings[this.user.jid] = {
        self: false,
        autoread: false,
        status: 0
      }

    } catch (e) {
      console.error('Error inicializando DB:', e)
    }

    // ---------- Opciones básicas ----------
    global.opts = global.opts || {}
    const opts = global.opts
    if (opts['nyimak']) return
    if (!m.fromMe && opts['self']) return
    if (opts['swonly'] && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    // ---------- Detectar owner seguro ----------
    const ownerNumbers = Array.isArray(global.owner) ? global.owner.flatMap(o => {
      let number = Array.isArray(o) ? o[0] : o
      if (!number) return []
      return [
        number.replace(/[^0-9]/g, '') + '@s.whatsapp.net',
        number.replace(/[^0-9]/g, '') + '@whatsapp.net',
        number.replace(/[^0-9]/g, '') + '@lid'
      ]
    }) : []

    const botJid = global.conn?.user?.id ? this.decodeJid(global.conn.user.id) : ''
    const isROwner = botJid ? [botJid, ...ownerNumbers].includes(m.sender) : false
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || (Array.isArray(global.mods) ? global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) : false)
    const _user = global.db.data.users[m.sender] || {}
    const isPrems = isROwner || (Array.isArray(global.prems) ? global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) : false) || _user.premium

    // ---------- Manejo de cola ----------
    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      this.msgqueque.push(m.id || m.key.id)
      await delay(this.msgqueque.length * 1000)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    // ---------- Metadata de grupo ----------
    const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => ({})) : {}
    const participants = m.isGroup ? groupMetadata.participants || [] : []
    const sender = m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) || {} : {}
    const bot = m.isGroup ? participants.find(u => this.decodeJid(u.id) === this.user.jid) || {} : {}
    const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin'
    const isBotAdmin = bot?.admin

    // ---------- Ejecutar plugins ----------
    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    for (let name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue
      const __filename = join(___dirname, name)

      if (typeof plugin.all === 'function') {
        try { await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }) }
        catch(e) { console.error(e) }
      }

      if (plugin.command) {
        const prefixes = plugin.customPrefix ? [plugin.customPrefix] : [global.prefix || '.']
        for (let p of prefixes) {
          const regex = p instanceof RegExp ? p : new RegExp(`^${p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')}`)
          if (regex.test(m.text)) {
            try { await plugin.call(this, m, { command: plugin.command, args: m.text.split(/\s+/).slice(1) }) }
            catch(e) { console.error(e) }
            break
          }
        }
      }
    }

    // ---------- Auto read ----------
    if (opts['autoread'] && m.key) await this.readMessages([m.key])

  } catch (e) {
    console.error('Error en handler.js:', e)
  } finally {
    // ---------- Limpiar cola ----------
    if (opts['queque'] && m.text) {
      const idx = this.msgqueque.indexOf(m.id || m.key.id)
      if (idx !== -1) this.msgqueque.splice(idx, 1)
    }
  }
}

// ---------- Hot reload ----------
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})