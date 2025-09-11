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

    try {
      // Users
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

      // Chats
      let chat = global.db.data.chats[m.chat] ||= {}
      if (!('isBanned' in chat)) chat.isBanned = false
      if (!('bienvenida' in chat)) chat.bienvenida = true
      if (!('antiLink' in chat)) chat.antiLink = false
      if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
      if (!('nsfw' in chat)) chat.nsfw = false
      if (!isNumber(chat.expired)) chat.expired = 0

      // Settings
      let settings = global.db.data.settings[this.user.jid] ||= {}
      if (!('self' in settings)) settings.self = false
      if (!('autoread' in settings)) settings.autoread = true

      // Notes cleanup
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

    const _user = global.db.data?.users?.[m.sender]

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

    // Procesamiento de plugins
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

      if (typeof normalizedPlugin.command === 'string') {
        normalizedPlugin.command = [normalizedPlugin.command]
      }

      if (normalizedPlugin.command instanceof RegExp) {
        normalizedPlugin.command = [normalizedPlugin.command.source]
      }

      processedPlugins.push(normalizedPlugin)
    }

    // Ejecución de handlers antes
    const sessionPlugins = ['xnxx.js', 'hentai.js', 'xvideos.js']
    for (let plugin of processedPlugins) {
      if (plugin.handler && typeof plugin.handler.before === 'function' && sessionPlugins.includes(plugin.name)) {
        try {
          await plugin.handler.before.call(this, m, {
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
            __filename: join(___dirname, plugin.name)
          })
          if (m.commandExecuted) break
        } catch (e) {
          console.error(`Error en handler.before de ${plugin.name}:`, e)
        }
      }
    }

    // Ejecución de plugins "all" y comandos
    for (let plugin of processedPlugins) {
      const __filename = join(___dirname, plugin.name)

      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
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
            __filename
          })
        } catch (e) {
          console.error(`Error en plugin.all de ${plugin.name}:`, e)
        }
      }

      if (m.isGroup && m.text && !commandExecuted) {
        // Aquí puedes procesar los comandos como lo tenías antes
        // Incluye sugerencias de comandos y dfail
      }
    }

  } catch (e) {
    console.error(e)
  } finally {
    // Limpieza de la cola de mensajes
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }

    // Actualización de stats
    if (m) {
      let user, stats = global.db.data.stats
      if (m.sender && (user = global.db.data.users[m.sender])) {
        user.exp += m.exp
        user.limit -= m.limit * 1
      }

      if (m.plugin) {
        let now = +new Date
        let stat = stats[m.plugin] ||= { total: 0, success: 0, last: 0, lastSuccess: 0 }
        stat.total += 1
        stat.last = now
        if (m.error == null) {
          stat.success += 1
          stat.lastSuccess = now
        }
      }
    }

    // Impresión opcional
    try {
      if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
    } catch (e) {
      console.log(m, m.quoted, e)
    }

    // Lectura automática
    try {
      await this.readMessages([m.key])
      if (m.isGroup) await this.readMessages([m.key], { readEphemeral: true })
    } catch (e) {
      console.error('Error al marcar como leído:', e)
    }
  }
}

// Hot reload
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})