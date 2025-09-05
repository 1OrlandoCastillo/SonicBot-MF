import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
  clearTimeout(this)
  resolve()
}, ms))

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

    // --- Inicialización de usuario, chat y settings ---
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
      if (!('autoread' in opts)) opts.autoread = true

      // Limpieza de notas expiradas
      if (global.db.data.notes && global.db.data.notes[m.chat]) {
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

    const createOwnerIds = (number) => {
      const cleanNumber = number.replace(/[^0-9]/g, '')
      return [
        cleanNumber + '@s.whatsapp.net',
        cleanNumber + '@lid'
      ]
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

    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      let queque = this.msgqueque, time = 1000 * 5
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
    const participants = (m.isGroup ? groupMetadata.participants : []) || []
    const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {}
    const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {}
    const isRAdmin = user?.admin == 'superadmin' || false
    const isAdmin = isRAdmin || user?.admin == 'admin' || false
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

    // --- Procesamiento de plugins ---
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

    // --- Ejecución flexible de plugins ---
    for (let plugin of processedPlugins) {
      const __filename = join(___dirname, plugin.name)

      // Determinar función a ejecutar
      let fn = null
      if (plugin.handler) {
        fn = plugin.handler.call || plugin.handler.run || plugin.handler
        if (plugin.handler.default) fn = plugin.handler.default.call || plugin.handler.default.run || plugin.handler.default
      }

      if (typeof fn !== 'function') continue

      try {
        await fn.call(this, m, {
          match,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename,
          usedPrefix,
          command,
          args,
          text: args?.join(' ').trim()
        })
        m.plugin = plugin.name
        m.command = command
        m.args = args
        commandExecuted = true
      } catch (e) {
        m.error = e
        console.error(`Error ejecutando plugin ${plugin.name}:`, e)
      }
    }

    // --- Resto de tu código (anti-link, anti-spam, IA, Hot, Ilegal, etc.) ---
    // Aquí puedes mantener intactas todas las demás secciones de tu handler.js
    // sin tocar nada, ya que el cambio solo afecta la ejecución de plugins

  } catch (e) {
    console.error(e)
  } finally {
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }
  }
}

// --- Auto-reload del handler.js ---
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})