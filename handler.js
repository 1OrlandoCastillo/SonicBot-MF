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
  if (typeof this.pushMessage === 'function') this.pushMessage(chatUpdate.messages).catch(() => {})

  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  if (!global.db.data) await global.loadDatabase().catch(() => {})

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0
    m.limit = 0

    // ---------- Inicializar DB ----------
    const users = global.db.data.users ||= {}
    const chats = global.db.data.chats ||= {}
    const settings = global.db.data.settings ||= {}

    if (!users[m.sender]) users[m.sender] = {
      exp: 0, limit: 10, registered: false, name: m.name,
      age: -1, regTime: -1, afk: -1, afkReason: '',
      banned: false, useDocument: false, bank: 0, level: 0,
      premium: false, premiumTime: 0
    }

    if (!chats[m.chat]) chats[m.chat] = {
      isBanned: false, bienvenida: true, antiLink: false,
      onlyLatinos: false, nsfw: false, expired: 0
    }

    if (!settings[this.user.jid]) settings[this.user.jid] = {
      self: false, autoread: true, status: 0
    }

    const opts = global.opts ||= {}
    if (opts.nyimak) return
    if (!m.fromMe && opts.self) return
    if (opts.swonly && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    // ---------- Detectar owner y permisos ----------
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
    const _user = users[m.sender]
    const isPrems = isROwner || (Array.isArray(global.prems) ? global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) : false) || _user.premium

    // ---------- Anti-spam básico ----------
    global.userSpam ||= {}
    const now = Date.now()
    if (!global.userSpam[m.sender]) global.userSpam[m.sender] = { count: 1, lastMessage: now, messages: [m.key] }
    else {
      const spam = global.userSpam[m.sender]
      if (now - spam.lastMessage < 5000) {
        spam.count++
        spam.messages.push(m.key)
        if (spam.count > 5) {
          _user.banned = true
          try { await this.sendMessage(m.chat, { text: '🚫 Has sido baneado temporalmente por spam.' }, { quoted: m }) } catch {}
          for (const key of spam.messages) try { await this.sendMessage(m.chat, { delete: key }) } catch {}
        }
      } else {
        spam.count = 1
        spam.messages = [m.key]
      }
      global.userSpam[m.sender].lastMessage = now
    }

    // ---------- Detectar grupo y admins ----------
    const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(() => ({})) : {}
    const participants = m.isGroup ? groupMetadata.participants || [] : []
    const sender = m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) || {} : {}
    const botParticipant = m.isGroup ? participants.find(u => this.decodeJid(u.id) === this.user.jid) || {} : {}
    const isAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin'
    const isBotAdmin = botParticipant?.admin

    // ---------- Plugins ----------
    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    for (let name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue
      const __filename = join(___dirname, name)

      if (typeof plugin.all === 'function') {
        try { await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }) } catch {}
      }

      if (!plugin.command) continue
      const prefixes = plugin.customPrefix ? [plugin.customPrefix] : [global.prefix || '.']
      for (let p of prefixes) {
        const regex = p instanceof RegExp ? p : new RegExp(`^${p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')}`)
        if (regex.test(m.text)) {
          try { await plugin.call(this, m, { command: plugin.command, args: m.text.split(/\s+/).slice(1) }) } catch {}
          break
        }
      }
    }

    // ---------- dfail ----------
    global.dfail = (type, m, conn) => {
      const msg = {
        rowner: '✤ Solo el *Creador* puede usar este comando.',
        owner: '✤ Solo el *Creador* y Sub Bots pueden usar este comando.',
        mods: '✤ Solo los *Moderadores* pueden usar este comando.',
        premium: '✤ Solo usuarios *Premium* pueden usar este comando.',
        group: '✤ Solo se puede usar en *Grupos*.',
        private: '✤ Solo en chat *Privado*.',
        admin: '✤ Solo *Admins* pueden usar este comando.',
        botAdmin: '✤ La Bot debe ser *Administradora*.',
        unreg: '✤ Debes estar *Registrado*.',
        restrict: '✤ Función *deshabilitada*.'
      }[type]
      if (msg) return conn.reply(m.chat, msg, m)
    }

    // ---------- Auto-read ----------
    if (opts.autoread && m.key) await this.readMessages([m.key])

  } catch (e) {
    // Errores ya no se imprimen como letras raras
    console.error('Error en handler.js:', e)
  } finally {
    if (opts.queque && m.text) {
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