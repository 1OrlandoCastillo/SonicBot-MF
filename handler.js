import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
// delay corregido
const delay = ms => isNumber(ms) ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()

export async function handler(chatUpdate) {
// aseguro la cola de mensajes
this.msgqueque = this.msgqueque || []
if (!chatUpdate) return
// conveniencia: conn apunta a this para mantener compatibilidad en el código antiguo
const conn = this

try {
// pushMessage puede no existir en algunos entornos; lo intento en try/catch
if (typeof this.pushMessage === 'function') {
this.pushMessage(chatUpdate.messages).catch(console.error)
}
} catch (e) {
console.error('pushMessage error:', e)
}

let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) return

if (global.db.data == null) await global.loadDatabase().catch(console.error)

try {
m = smsg(this, m) || m
if (!m) return
// protección extra: algunos mensajes pueden venir sin sender
if (!m.sender) {
console.warn('handler: mensaje sin sender', m.key || m)
return
}
if (m.messageStubType) return
m.exp = 0
m.limit = false

// inicializo opts (evita ReferenceError)  
global.opts = global.opts || {}  
let opts = global.opts  

// ---------- manejo de datos de usuario / chat / settings ----------  
try {  
  // datos del usuario en la base  
  let userData = global.db.data.users[m.sender] ||= {}  
  if (!isNumber(userData.exp)) userData.exp = 0  
  if (!isNumber(userData.limit)) userData.limit = 10  
  if (!('registered' in userData)) userData.registered = false  
  if (!userData.registered) {  
    if (!('name' in userData)) userData.name = m.name  
    if (!isNumber(userData.age)) userData.age = -1  
    if (!isNumber(userData.regTime)) userData.regTime = -1  
  }  
  if (!('banned' in userData)) userData.banned = false  
  if (!isNumber(userData.level)) userData.level = 0  
  if (!isNumber(userData.coins)) userData.coins = 0  

  // datos del chat  
  let chat = global.db.data.chats[m.chat] ||= {}  
  if (!('isBanned' in chat)) chat.isBanned = false  
  if (!('bienvenida' in chat)) chat.bienvenida = true  
  if (!('antiLink' in chat)) chat.antiLink = false  
  if (!('onlyLatinos' in chat)) chat.onlyLatinos = false  
  if (!('nsfw' in chat)) chat.nsfw = false  
  if (!isNumber(chat.expired)) chat.expired = 0  

  // settings para este usuario/bot  
  let settings = global.db.data.settings[this.user.jid] ||= {}  
  if (!('self' in settings)) settings.self = false  
  if (!('autoread' in settings)) settings.autoread = true  
  // eliminé la referencia errónea a opts aquí; no tiene sentido asignarlo en este bloque  

  // limpieza de notas expiradas (si existen)  
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
  console.error('handler - init user/chat/settings error:', e)  
}

// ---------- detección de owner ----------
const createOwnerIds = number => [
number + '@s.whatsapp.net',
number + '@whatsapp.net',
number + '@lid'
]

const allOwnerIds = [  
  this.decodeJid(global.conn.user.id),  
  ...global.owner.flatMap(([number]) => createOwnerIds(number)),  
  ...(global.ownerLid || []).flatMap(([number]) => createOwnerIds(number))  
]  

const isROwner = allOwnerIds.includes(m.sender)  
const isOwner = isROwner || m.fromMe  

// permisos de mods y prems  
const isMods = isOwner || global.mods.includes(m.sender)  
const isPrems = isROwner || global.prems.includes(m.sender)  

// anti flood / cola de mensajes  
if (!('autoread' in opts)) opts.autoread = true  
if (opts['nyimak']) return  
if (!m.fromMe && opts['self']) return  
if (opts['swonly'] && m.chat !== 'status@broadcast') return  
if (opts['queque'] && m.text && !(isMods || isPrems)) {  
  this.msgqueque.push(m.id || m.key.id)  
  await delay(this.msgqueque.length * 1000)  
}  

// ignore chats bloqueados  
if (m.isBaileys) return  
if (m.chat === 'status@broadcast' && opts['swonly']) return  
if (global.db.data.chats[m.chat]?.isBanned) return  

// ---------- procesar comandos ----------  
m.isCommand = false  
let usedPrefix  
let _user = global.db.data.users[m.sender]  

const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => null) : {}  
const participants = m.isGroup ? groupMetadata.participants : []  
const senderInGroup = (m.isGroup ? participants.find(p => this.decodeJid(p.id) === m.sender) : {}) || {}  
const isAdmin = m.isGroup && (senderInGroup.admin === 'admin' || senderInGroup.admin === 'superadmin')  
const isBotAdmin = m.isGroup && (participants.find(p => this.decodeJid(p.id) === this.decodeJid(this.user.id)) || {}).admin  

// extra: log simple  
console.log(`[MSG] ${m.isGroup ? '[GRUPO]' : '[PRIVADO]'} ${m.sender} > ${m.text || m.mtype}`)  

// anti-spam simple  
global.userSpam = global.userSpam || {}  
const now = Date.now()  
const spamWindow = 5000  
const spamLimit = 5  

if (!global.userSpam[m.sender]) {  
  global.userSpam[m.sender] = { count: 1, lastMessage: now, messages: [m.key] }  
} else {  
  const spamData = global.userSpam[m.sender]  
  if (now - spamData.lastMessage < spamWindow) {  
    spamData.count++  
    spamData.messages.push(m.key)  
    if (spamData.count > spamLimit) {  
      // ban temporal  
      _user.banned = true  
      console.log(`[SPAM] Usuario baneado por spam: ${m.sender}`)  
      try {  
        await this.sendMessage(m.chat, { text: '🚫 Has sido baneado temporalmente por spam.' }, { quoted: m })  
        for (const msgKey of spamData.messages) {  
          try { await this.sendMessage(m.chat, { delete: msgKey }) } catch {}  
        }  
      } catch {}  
    }  
  } else {  
    spamData.count = 1  
    spamData.messages = [m.key]  
  }  
  spamData.lastMessage = now  
}  

// anti-caracteres raros (ejemplo simple)  
if (m.text && /[^\u0000-\u007F]+/.test(m.text)) {  
  if (!isOwner && !isAdmin) {  
    try {  
      await this.sendMessage(m.chat, { text: '❌ Caracteres no permitidos.' }, { quoted: m })  
      return  
    } catch {}  
  }  
}  

// manejo de comandos: extraer prefijo  
let prefixRegex = /^(?:(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|[^\p{Letter}\p{Number}\s]))/u  
usedPrefix = (m.text && m.text.match(prefixRegex)) ? m.text.match(prefixRegex)[0] : global.prefix  
let noPrefix = m.text ? m.text.replace(usedPrefix, '') : ''  

// marcar si es comando  
let cmd = (noPrefix.split` `[0] || '').toLowerCase()  
let quoted = m.quoted ? m.quoted : m  
let command = global.plugins[cmd] || global.plugins[Object.keys(global.plugins).find(v => global.plugins[v].alias?.includes(cmd))]  

if (command) {  
  m.isCommand = true  
  try {  
    await command(m, {  
      conn: this,  
      text: noPrefix.replace(cmd, '').trim(),  
      usedPrefix,  
      command: cmd,  
      args: noPrefix.trim().split(/\s+/).slice(1),  
      isOwner,  
      isROwner,  
      isAdmin,  
      isBotAdmin,  
      participants,  
      groupMetadata,  
      isPrems  
    })  
  } catch (e) {  
    console.error('Error en comando:', e)  
    try {  
      await this.sendMessage(m.chat, { text: '❌ Error ejecutando el comando.' }, { quoted: m })  
    } catch {}  
  }  
}

// ---------- sugerencias de comandos (autocorrección) ----------
if (!m.isCommand && m.text && m.isGroup) {
const allCommands = []
for (let name in global.plugins) {
const plugin = global.plugins[name]
if (plugin.command) {
if (Array.isArray(plugin.command)) allCommands.push(...plugin.command)
else if (typeof plugin.command === 'string') allCommands.push(plugin.command)
}
}

let input = cmd  
  let bestMatch = null  
  let bestScore = 0  

  for (let c of allCommands) {  
    let score = 0  
    const cLower = c.toLowerCase()  
    if (cLower.includes(input)) score += 50  
    if (cLower.startsWith(input)) score += 40  
    if (input.startsWith(cLower)) score += 20  

    if (score > bestScore) {  
      bestScore = score  
      bestMatch = c  
    }  
  }  

  if (bestMatch && bestScore >= 30) {  
    try {  
      await this.sendMessage(m.chat, {  
        text: `⚠️ Comando *${usedPrefix + input}* no encontrado.\nTal vez quisiste decir: *${usedPrefix + bestMatch}*`  
      }, { quoted: m })  
    } catch {}  
  }  
}  

// ---------- dfail helpers ----------  
global.dfail = (type, m, connParam) => {  
  const messages = {  
    rowner: '✤ Solo el *Creador* puede usar este comando.',  
    owner: '✤ Solo el *Creador* y Sub Bots pueden usar este comando.',  
    mods: '✤ Solo los *Moderadores* pueden usar este comando.',  
    premium: '✤ Solo Usuarios *Premium* pueden usar este comando.',  
    group: '✤ Solo se puede usar en *Grupos*.',  
    private: '✤ Solo se puede usar en Chat *Privado*.',  
    admin: '✤ Solo *Admins* pueden usar este comando.',  
    botAdmin: '✤ La Bot debe ser *Administradora*.',  
    unreg: '✤ Debes estar *Registrado* para usar este comando.',  
    restrict: '✤ Esta función está *deshabilitada*.'  
  }  
  const msg = messages[type]  
  if (!msg) return  
  if (connParam.reply) return connParam.reply(m.chat, msg, m)  
  return this.reply ? this.reply(m.chat, msg, m) : null  
}  

// ---------- estadísticas y experiencia ----------  
if (m.sender && _user) {  
  _user.exp = (_user.exp || 0) + (m.exp || 0)  
  _user.limit = (_user.limit || 0) - (m.limit || 0)  
}  

if (m.plugin) {  
  global.db.data.stats = global.db.data.stats || {}  
  let stat = global.db.data.stats[m.plugin] ||= { total: 0, success: 0, last: 0, lastSuccess: 0 }  
  stat.total += 1  
  stat.last = Date.now()  
  if (!m.error) {  
    stat.success += 1  
    stat.lastSuccess = Date.now()  
  }  
}  

// ---------- auto-read y presencia ----------  
try {  
  if (m.key) await this.readMessages([m.key])  
  if (m.isGroup) await this.readMessages([m.key], { readEphemeral: true })  
  await this.sendPresenceUpdate('composing', m.chat)  
} catch (e) {  
  console.error('Error en auto-read o presencia:', e)  
}  

// ---------- Modo IA (Gemini) ----------  
if (m.isGroup && global.db.data.modoIA && global.db.data.modoIA[m.chat] && !m.fromMe && m.text) {  
  try {  
    const { callGeminiAPI, isLikelyCommand } = await import('./lib/geminiAPI.js')  
    if (!isLikelyCommand(m.text)) {  
      const userName = m.pushName || m.name || 'Usuario'  
      const groupName = await this.getName(m.chat) || 'Grupo'  
      const response = await callGeminiAPI(m.text, userName, groupName, m.chat)  
      if (response) {  
        await this.sendMessage(m.chat, {  
          text: response,  
          contextInfo: { ...rcanal.contextInfo }  
        }, { quoted: m })  
      }  
    }  
  } catch (e) {  
    console.error('Error en Modo IA:', e)  
  }  
}  

// ---------- limpieza de cola ----------  
if (opts.queque && m.key) {  
  const index = this.msgqueque.indexOf(m.key.id)  
  if (index !== -1) this.msgqueque.splice(index, 1)  
}

} catch (err) {
console.error('Error en handler.js:', err)
}
}

// ---------- hot reload ----------
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizó 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})
// ---------- Anti-link y Anti-media ----------
export async function antiContent(m, conn) {
const chatSettings = global.db.data.chats[m.chat] || {}
const participant = (m.isGroup && chatSettings.participants) ? chatSettings.participants.find(u => u.id === m.sender) : {}
const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'

const contentChecks = [
{ type: 'antiLink', regex: /(https?://[^\s]+|www.[^\s]+)/i },
{ type: 'antiImg', regex: m.message?.imageMessage ? /.+/ : null },
{ type: 'antiAudio', regex: m.message?.audioMessage ? /.+/ : null },
{ type: 'antiVideo', regex: m.message?.videoMessage ? /.+/ : null },
{ type: 'antiSticker', regex: m.message?.stickerMessage ? /.+/ : null }
]

for (let check of contentChecks) {
if (chatSettings[check.type] && check.regex && !isAdmin) {
try {
await conn.sendMessage(m.chat, { delete: m.key })
} catch (err) {
console.error(Error eliminando ${check.type}:, err)
}

if (check.type === 'antiLink') {  
    try {  
      await conn.sendMessage(m.chat, {  
        text: `@${m.sender.split('@')[0]} no se permiten links aquí, serás eliminado.`,  
        contextInfo: { ...rcanal.contextInfo, mentionedJid: [m.sender] }  
      }, { quoted: m })  
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')  
    } catch (err) {  
      console.error('Error eliminando usuario por link:', err)  
    }  
  }  
  return true  
}

}
return false
}

// ---------- Plugins globales ----------
export async function runPlugins(m, conn) {
const processedPlugins = []
const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

for (let name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin || plugin.disabled) continue

let normalized = {  
  name,  
  handler: plugin.handler || plugin,  
  command: Array.isArray(plugin.command) ? plugin.command : (typeof plugin.command === 'string' ? [plugin.command] : []),  
  tags: plugin.tags || [],  
  help: plugin.help || [],  
  all: plugin.all,  
  customPrefix: plugin.customPrefix  
}  
processedPlugins.push(normalized)

}

for (let plugin of processedPlugins) {
const __filename = join(___dirname, plugin.name)

if (typeof plugin.all === 'function') {  
  try {  
    await plugin.all.call(conn, m, {  
      conn,  
      __dirname: ___dirname,  
      __filename  
    })  
  } catch (err) {  
    console.error(`Error plugin.all de ${plugin.name}:`, err)  
  }  
}  

// Lógica de comandos  
for (let cmd of plugin.command) {  
  const prefix = plugin.customPrefix || global.prefix || '.'  
  const regex = new RegExp(`^${prefix}${cmd}`, 'i')  
  if (regex.test(m.text)) {  
    try {  
      await plugin.handler.call(conn, m, {  
        conn,  
        args: m.text.split(/\s+/).slice(1),  
        command: cmd,  
        text: m.text  
      })  
    } catch (err) {  
      console.error(`Error ejecutando plugin ${plugin.name}:`, err)  
    }  
  }  
}

}
}

// ---------- Export completo ----------
export async function fullHandler(chatUpdate) {
await handler.call(this, chatUpdate)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) return

if (await antiContent(m, this)) return
await runPlugins(m, this)
}

// ---------- Hot reload final ----------
let handlerFile = global.__filename(import.meta.url, true)
watchFile(handlerFile, async () => {
unwatchFile(handlerFile)
console.log(chalk.magenta("Se actualizó 'handler.js' [Parte final]"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})

