import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

// Import robusto de @whiskeysockets/baileys (soporta export en root o en .default)
const _baileysModule = await import('@whiskeysockets/baileys').catch(() => null)
const _baileys = _baileysModule?.default || _baileysModule || {}
const proto = _baileys.proto // puede ser undefined y eso está bien si no se usa aquí

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()

export async function handler(chatUpdate) {
  const conn = this
  const opts = global.opts || {}
  const __filenameRoot = fileURLToPath(import.meta.url)
  const ___dirname = path.join(path.dirname(__filenameRoot), './plugins')

  this.msgqueque = this.msgqueque || []
  if (!chatUpdate) return
  try {
    // pushMessage puede no existir en todas las implementaciones
    try { this.pushMessage?.(chatUpdate.messages) } catch (e) { console.error('pushMessage error:', e) }

    let m = chatUpdate.messages?.[chatUpdate.messages.length - 1]
    if (!m) return

    if (global.db && global.db.data == null) {
      await global.loadDatabase?.()
    }

    // Normalizar mensaje
    m = smsg(this, m) || m
    if (!m) return
    if (m.messageStubType) return

    // valores por defecto
    m.exp = 0
    m.limit = 0

    try {
      // asegurar estructura de db
      global.db.data = global.db.data || {}
      global.db.data.users = global.db.data.users || {}
      global.db.data.chats = global.db.data.chats || {}
      global.db.data.settings = global.db.data.settings || {}

      let user = global.db.data.users[m.sender] ||= {}
      if (!isNumber(user.exp)) user.exp = 0
      if (!isNumber(user.limit)) user.limit = 10
      if (!('registered' in user)) user.registered = false
      if (!user.registered) {
        if (!('name' in user)) user.name = m.name || ''
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

      let settings = global.db.data.settings[conn.user?.jid] ||= {}
      if (!('self' in settings)) settings.self = false
      if (!('autoread' in settings)) settings.autoread = true

      // limpieza de notas expiradas si existen
      if (global.db.data.notes && global.db.data.notes[m.chat]) {
        const now = Date.now()
        const originalLength = global.db.data.notes[m.chat].length
        global.db.data.notes[m.chat] = global.db.data.notes[m.chat].filter(note => (note.expiresAt || 0) > now)
        const cleanedLength = global.db.data.notes[m.chat].length
        if (originalLength > cleanedLength) {
          console.log(`[NOTAS] Se limpiaron ${originalLength - cleanedLength} notas expiradas en ${m.chat}`)
        }
      }
    } catch (e) {
      console.error('DB init error:', e)
    }

    // opciones rápidas
    if (opts['nyimak']) return
    if (!m.fromMe && opts['self']) return
    if (opts['swonly'] && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    const _user = global.db.data?.users?.[m.sender]

    const createOwnerIds = (number) => {
      if (!number) return []
      const n = String(number).replace(/[^0-9]/g, '')
      return [n ? `${n}@s.whatsapp.net` : null, n ? `${n}@lid` : null].filter(Boolean)
    }

    const allOwnersList = [
      conn.decodeJid?.(conn.user?.jid || '') || null,
      ...((global.owner || []).flatMap(([number]) => createOwnerIds(number))),
      ...((global.ownerLid || []).flatMap(([number]) => createOwnerIds(number)))
    ].filter(Boolean)

    const isROwner = allOwnersList.includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || ((global.mods || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender))
    const isPrems = isROwner || ((global.prems || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) || _user?.prem === true

    // Manejo de queue opcional: procesar mensajes uno a la vez por user si opts['queque'] habilitado
    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      const queque = this.msgqueque
      const id = m.id || m.key?.id
      if (id) {
        queque.push(id)
        // esperar hasta que este id sea el primero en la cola (serializa procesamiento)
        while (queque[0] !== id) {
          // si se desea cambiar el polling, ajustar el delay
          await delay(250)
        }
      }
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    const groupMetadata = (m.isGroup ? ((conn.chats?.[m.chat] || {}).metadata || await this.groupMetadata?.(m.chat).catch(_ => null)) : {}) || {}
    const participants = (m.isGroup ? groupMetadata.participants || [] : []) || []
    const userInGroup = (m.isGroup ? participants.find(u => conn.decodeJid?.(u.id) === m.sender) : {}) || {}
    const botInGroup = (m.isGroup ? participants.find(u => conn.decodeJid?.(u.id) == conn.user?.jid) : {}) || {}
    const isRAdmin = userInGroup?.admin === 'superadmin' || false
    const isAdmin = isRAdmin || userInGroup?.admin === 'admin' || false
    const isBotAdmin = botInGroup?.admin || false

    // canal de contexto (guardas para no romper si ya existen)
    global.idcanal = global.idcanal || '120363403143798163@newsletter'
    global.namecanal = global.namecanal || 'LOVELLOUD Official Channel'
    global.rcanal = global.rcanal || {
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.idcanal,
          serverMessageId: 100,
          newsletterName: global.namecanal
        }
      }
    }

    let usedPrefix = '.'
    let commandExecuted = false

    // Normalizar plugins
    const processedPlugins = []
    for (let name in (global.plugins || {})) {
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

    const sessionPlugins = ['xnxx.js', 'hentai.js', 'xvideos.js']

    // before hooks para plugins especiales (si existen)
    for (let plugin of processedPlugins) {
      if (plugin.handler && typeof plugin.handler.before === 'function' && sessionPlugins.includes(plugin.name)) {
        try {
          await plugin.handler.before.call(this, m, {
            conn: this,
            participants,
            groupMetadata,
            user: userInGroup,
            bot: botInGroup,
            isROwner,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            __dirname: ___dirname,
            __filename: __filenameRoot
          })

          if (m.commandExecuted) break
        } catch (e) {
          console.error(`Error en handler.before de ${plugin.name}:`, e)
        }
      }
    }

    // Bucle principal de plugins
    for (let plugin of processedPlugins) {
      const pluginFile = join(___dirname, plugin.name)

      // plugin.all (si existe)
      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            conn: this,
            participants,
            groupMetadata,
            user: userInGroup,
            bot: botInGroup,
            isROwner,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            __dirname: ___dirname,
            __filename: pluginFile
          })
        } catch (e) {
          console.error(`Error en plugin.all de ${plugin.name}:`, e)
        }
      }

      // respetar restricción por tags si opts.restrict
      if (!opts['restrict']) {
        if (plugin.tags && plugin.tags.includes('admin')) continue
      }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ? plugin.customPrefix : (conn.prefix ? conn.prefix : global.prefix)

      let match = (_prefix instanceof RegExp ?
        [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ?
          _prefix.map(p => {
            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
            return [re.exec(m.text), re]
          }) :
          typeof _prefix === 'string' ?
            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
            [[[], new RegExp]]
      ).find(p => p[1] && p[0])

      if (!match) continue

      const prefixMatch = match[0]
      const noPrefix = m.text.slice(prefixMatch[0].length).trim()
      const [commandText, ...args] = noPrefix.split(/\s+/)
      const command = commandText?.toLowerCase()

      const isMatchCommand = plugin.command && plugin.command.some(cmd => {
        if (typeof cmd === 'string') {
          return command === cmd.toLowerCase()
        } else if (cmd instanceof RegExp) {
          return cmd.test(command)
        }
        return false
      })

      if (!isMatchCommand) continue

      // Validaciones generales de ejecución
      const allowedPrivateCommands = ['qr', 'code', 'setbotname', 'setbotimg', 'setautoread']
      if (!m.isGroup && !allowedPrivateCommands.includes(command) && !isOwner) {
        // no devolver error globalmente, simplemente ignorar
        return
      }

      if (m.isGroup && global.db.data?.botGroups && global.db.data.botGroups[m.chat] === false) {
        const alwaysAllowedCommands = ['grupo']
        if (!alwaysAllowedCommands.includes(command) && !isOwner) {
          try {
            return conn.sendMessage?.(m.chat, {
              text: `*[🪐] El bot está desactivado en este grupo.*\n\n> Pídele a un administrador que lo active.`
            }, { quoted: m })
          } catch (e) {
            console.error('Error notificando bot desactivado:', e)
            return
          }
        }
      }

      // antiImg global por chat (evita imágenes si activado)
      if (m.isGroup && global.db.data?.antiImg && global.db.data.antiImg[m.chat] === true) {
        if (m.message && (m.message.imageMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage)) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
            return
          } catch (error) {
            console.error('Error eliminando imagen (antiImg):', error)
          }
        }
      }

      commandExecuted = true

      try {
        await plugin.handler.call(this, m, {
          match,
          conn: this,
          participants,
          groupMetadata,
          user: userInGroup,
          bot: botInGroup,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename: pluginFile,
          usedPrefix: prefixMatch[0],
          command,
          args,
          text: args.join(' ').trim()
        })

        m.plugin = plugin.name
        m.command = command
        m.args = args
      } catch (e) {
        m.error = e
        console.error(`Error ejecutando plugin ${plugin.name}:`, e)
      }
    } // fin loop plugins

    // ---------------------------------------------------------
    // Reglas y filtros posteriores a ejecución de comandos
    // ---------------------------------------------------------

    // antiLink: eliminar si contiene link y no es admin
    if (m.isGroup && global.db.data?.antiLink && global.db.data.antiLink[m.chat] === true) {
      const text = m.text || ''
      const contieneLink = /(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(text)
      if (contieneLink) {
        // comprobar si es comando
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
            await conn.sendMessage?.(m.chat, {
              text: `@${m.sender.split('@')[0]} está prohibido links en este grupo, serás eliminado.`,
              contextInfo: {
                ...global.rcanal?.contextInfo,
                mentionedJid: [m.sender]
              }
            }, { quoted: m })
            await conn.groupParticipantsUpdate?.(m.chat, [m.sender], 'remove')
          } catch (error) {
            console.error('Error en anti-link:', error)
            try {
              await conn.sendMessage?.(m.chat, { delete: m.key })
            } catch {}
          }
          return
        }
      }
    }

    // antiImagenes en grupo (otra comprobación similar)
    if (m.isGroup && global.db.data?.antiImg && global.db.data.antiImg[m.chat] === true) {
      if (m.message && (m.message.imageMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage)) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
          } catch (error) {
            console.error('Error eliminando imagen (antiImg second):', error)
          }
          return
        }
      }
    }

    // antiAudio
    if (m.isGroup && global.db.data?.antiAudio && global.db.data.antiAudio[m.chat] === true) {
      if (m.message && (m.message.audioMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage)) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
          } catch (error) {
            console.error('Error eliminando audio:', error)
          }
          return
        }
      }
    }

    // antiVideo
    if (m.isGroup && global.db.data?.antiVideo && global.db.data.antiVideo[m.chat] === true) {
      if (m.message && (m.message.videoMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage)) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
          } catch (error) {
            console.error('Error eliminando video:', error)
          }
          return
        }
      }
    }

    // antiSticker
    if (m.isGroup && global.db.data?.antiSticker && global.db.data.antiSticker[m.chat] === true) {
      if (m.message && (m.message.stickerMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage)) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
          } catch (error) {
            console.error('Error eliminando sticker:', error)
          }
          return
        }
      }
    }

    // antiSpam (conteo de mensajes)
    if (m.isGroup && global.db.data?.antiSpam && global.db.data.antiSpam[m.chat] === true) {
      if (!isAdmin) {
        global.db.data.spamCount = global.db.data.spamCount || {}
        global.db.data.spamCount[m.chat] = global.db.data.spamCount[m.chat] || {}
        if (!global.db.data.spamCount[m.chat][m.sender]) {
          global.db.data.spamCount[m.chat][m.sender] = { count: 0, lastMessage: 0, messages: [] }
        }

        const now = Date.now()
        const userSpam = global.db.data.spamCount[m.chat][m.sender]
        const timeDiff = now - (userSpam.lastMessage || 0)

        if (timeDiff < 2000) {
          userSpam.count = (userSpam.count || 0) + 1
          userSpam.lastMessage = now
          userSpam.messages.push(m.key)

          if (userSpam.count >= 3) {
            try {
              for (const messageKey of userSpam.messages) {
                try {
                  await conn.sendMessage?.(m.chat, { delete: messageKey })
                } catch (e) {
                  console.error('Error eliminando mensaje de spam:', e)
                }
              }

              await conn.sendMessage?.(m.chat, {
                text: `@${m.sender.split('@')[0]} no está permitido spam y será eliminado.`,
                contextInfo: {
                  ...global.rcanal?.contextInfo,
                  mentionedJid: [m.sender]
                }
              }, { quoted: m })

              await conn.groupParticipantsUpdate?.(m.chat, [m.sender], 'remove')

              userSpam.count = 0
              userSpam.messages = []
            } catch (error) {
              console.error('Error en anti-spam:', error)
            }
            return
          }
        } else {
          userSpam.count = 1
          userSpam.lastMessage = now
          userSpam.messages = [m.key]
        }
      }
    }

    // antiContact
    if (m.isGroup && global.db.data?.antiContact && global.db.data.antiContact[m.chat] === true) {
      if (m.message && (m.message.contactMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.contactMessage)) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
          } catch (error) {
            console.error('Error eliminando contacto:', error)
          }
          return
        }
      }
    }

    // antiMention
    if (m.isGroup && global.db.data?.antiMention && global.db.data.antiMention[m.chat] === true) {
      if (m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo && m.message.extendedTextMessage.contextInfo.mentionedJid && m.message.extendedTextMessage.contextInfo.mentionedJid.length > 0) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
            await conn.sendMessage?.(m.chat, {
              text: `@${m.sender.split('@')[0]} las menciones están prohibidas.`,
              contextInfo: {
                ...global.rcanal?.contextInfo,
                mentionedJid: [m.sender]
              }
            }, { quoted: m })
          } catch (error) {
            console.error('Error en anti-menciones:', error)
          }
          return
        }
      }
    }

    // antiDocument
    if (m.isGroup && global.db.data?.antiDocument && global.db.data.antiDocument[m.chat] === true) {
      if (m.message && (m.message.documentMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage)) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
          } catch (error) {
            console.error('Error eliminando documento:', error)
          }
          return
        }
      }
    }

    // antiCaracter (limita longitud de texto)
    if (m.isGroup && global.db.data?.antiCaracter && global.db.data.antiCaracter[m.chat] && global.db.data.antiCaracter[m.chat].enabled === true) {
      if (m.text && m.text.length > (global.db.data.antiCaracter[m.chat].limit || Infinity)) {
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        let _prefix = global.prefix
        let isCommand = (_prefix instanceof RegExp ?
          _prefix.test(m.text) :
          Array.isArray(_prefix) ?
            _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
            typeof _prefix === 'string' ?
              new RegExp(str2Regex(_prefix)).test(m.text) :
              false
        )
        if (!isCommand && !isAdmin) {
          try {
            await conn.sendMessage?.(m.chat, { delete: m.key })
            await conn.sendMessage?.(m.chat, {
              text: `@${m.sender.split('@')[0]} el mensaje excede el límite de ${global.db.data.antiCaracter[m.chat].limit} caracteres permitidos, serás eliminado.`,
              contextInfo: {
                ...global.rcanal?.contextInfo,
                mentionedJid: [m.sender]
              }
            }, { quoted: m })
            await conn.groupParticipantsUpdate?.(m.chat, [m.sender], 'remove')
          } catch (error) {
            console.error('Error en anti-caracteres:', error)
            try {
              await conn.sendMessage?.(m.chat, { delete: m.key })
            } catch {}
          }
          return
        }
      }
    }

    // soloAdmin mode: si el bot está en modo solo-admin y se ejecutó un comando no admin
    if (m.isGroup && global.db.data?.soloAdmin && global.db.data.soloAdmin[m.chat] === true) {
      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = global.prefix
      let isCommand = (_prefix instanceof RegExp ?
        _prefix.test(m.text) :
        Array.isArray(_prefix) ?
          _prefix.some(p => new RegExp(str2Regex(p)).test(m.text)) :
          typeof _prefix === 'string' ?
            new RegExp(str2Regex(_prefix)).test(m.text) :
            false
      )
      if (isCommand && !isAdmin && !isOwner) {
        try {
          await conn.sendMessage?.(m.chat, {
            text: `╭─「 ✦ 🔐 ᴍᴏᴅᴏ sᴏʟᴏ-ᴀᴅᴍɪɴs ✦ 」─╮\n│\n╰➺ ✧ @${m.sender.split('@')[0]} el bot está en\n╰➺ ✧ modo *Solo Administradores*\n│\n╰➺ ✧ Solo admins del grupo y\n╰➺ ✧ owners del bot pueden usar comandos\n│\n╰➺ ✧ *Estado:* 🔐 Restringido\n\n> LOVELLOUD Official`,
            contextInfo: {
              ...global.rcanal?.contextInfo,
              mentionedJid: [m.sender]
            }
          }, { quoted: m })
        } catch (error) {
          console.error('Error en solo-admin:', error)
        }
        return
      }
    }

    // manejo de texto no comando en grupos para sugerencias — solo si no se ejecutó comando
    if (m.text && !commandExecuted && !m.commandExecuted) {
      if (!m.isGroup) return

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = conn.prefix ? conn.prefix : global.prefix
      let match = (_prefix instanceof RegExp ?
        [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ?
          _prefix.map(p => {
            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
            return [re.exec(m.text), re]
          }) :
          typeof _prefix === 'string' ?
            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
            [[[], new RegExp]]
      ).find(p => p[1] && p[0])

      if (match) {
        const prefixMatch = match[0]
        const noPrefix = m.text.slice(prefixMatch[0].length).trim()
        const [commandText, ...args] = noPrefix.split(/\s+/)
        const command = commandText?.toLowerCase()

        if (command) {
          const fullCommand = prefixMatch[0] + commandText
          const menuCommand = prefixMatch[0] + 'menu'

          // recopilar todos los comandos disponibles (solo strings)
          const allCommands = []
          processedPlugins.forEach(plugin => {
            if (plugin.command && Array.isArray(plugin.command)) {
              plugin.command.forEach(cmd => {
                if (typeof cmd === 'string') allCommands.push(cmd)
              })
            }
          })

          // búsqueda de mejor sugerencia
          let bestSuggestion = null
          let bestScore = 0

          allCommands.forEach(cmd => {
            if (cmd.toLowerCase() === command) return
            const cmdLower = cmd.toLowerCase()
            let score = 0

            // heurísticas similares a las del original
            if (command.length === 1) {
              if (cmdLower.startsWith(command)) score += 50
              if (cmdLower.includes(command)) score += 30
            }
            if (command.length <= 3) {
              if (cmdLower.startsWith(command)) score += 40
              if (cmdLower.includes(command)) score += 25
            }
            if (command.length === cmdLower.length) {
              let charMatches = 0
              for (let i = 0; i < command.length; i++) if (command[i] === cmdLower[i]) charMatches++
              if (charMatches / command.length >= 0.7) score += 35
            }
            if (cmdLower.includes(command)) score += 20
            if (command.includes(cmdLower)) score += 15
            if (cmdLower.startsWith(command) || command.startsWith(cmdLower)) score += 10
            if (cmdLower.endsWith(command) || command.endsWith(cmdLower)) score += 8
            for (let i = 0; i < Math.min(command.length, cmdLower.length); i++) {
              if (command[i] === cmdLower[i]) score += 3
            }
            if (command.length === cmdLower.length) score += 5

            if (score > bestScore) {
              bestScore = score
              bestSuggestion = cmd
            }
          })

          let message = `《✧》El comando *${fullCommand}* no existe en KIYOMI MD.\n\n`
          if (bestSuggestion && bestScore >= 10) {
            const cmdLower = bestSuggestion.toLowerCase()
            let charMatches = 0
            for (let i = 0; i < Math.min(command.length, cmdLower.length); i++) if (command[i] === cmdLower[i]) charMatches++
            const charSimilarity = charMatches / Math.max(command.length, cmdLower.length)

            let contentSimilarity = 0
            if (cmdLower.includes(command)) contentSimilarity = command.length / cmdLower.length
            else if (command.includes(cmdLower)) contentSimilarity = cmdLower.length / command.length

            let startSimilarity = 0
            const minLength = Math.min(command.length, cmdLower.length)
            for (let i = 0; i < minLength; i++) if (command[i] === cmdLower[i]) startSimilarity += 1
            startSimilarity = startSimilarity / (minLength || 1)

            const finalSimilarity = (charSimilarity * 0.4 + contentSimilarity * 0.4 + startSimilarity * 0.2)
            const percentage = Math.min(100, Math.round(finalSimilarity * 100))

            message += `*Posibilidad de que sea:*\n`
            message += `╰➺ *${prefixMatch[0]}${bestSuggestion}* (${percentage}%)\n\n`
          }

          message += `> Por favor usa *${menuCommand}* para ver la lista de comandos disponibles.`

          return conn.sendMessage?.(m.chat, {
            text: message,
            contextInfo: {
              ...global.rcanal?.contextInfo
            }
          }, { quoted: m }).catch(e => console.error('sendMessage suggestion error:', e))
        }
      }
    }

    // dFail helper global (para permisos)
    global.dfail = (type, m2, conn2) => {
      const msg = {
        rowner: `✤ Hola, este comando solo puede ser utilizado por el *Creador* de la Bot.`,
        owner: `✤ Hola, este comando solo puede ser utilizado por el *Creador* de la Bot y *Sub Bots*.`,
        mods: `✤ Hola, este comando solo puede ser utilizado por los *Moderadores* de la Bot.`,
        premium: `✤ Hola, este comando solo puede ser utilizado por Usuarios *Premium*.`,
        group: `✤ Hola, este comando solo puede ser utilizado en *Grupos*.`,
        private: `✤ Hola, este comando solo puede ser utilizado en mi Chat *Privado*.`,
        admin: `✤ Hola, este comando solo puede ser utilizado por los *Administradores* del Grupo.`,
        botAdmin: `✤ Hola, la bot debe ser *Administradora* para ejecutar este Comando.`,
        unreg: `✤ Hola, para usar este comando debes estar *Registrado.*`,
        restrict: `✤ Hola, esta característica está *deshabilitada.*`
      }[type]
      if (msg) return conn2?.reply?.(m2.chat, msg, m2, global.rcanal)
    }

    // MODO IA automático por chat (usa geminiAPI si existe)
    if (m.isGroup && global.db.data?.modoIA && global.db.data.modoIA[m.chat] === true && m.text && !m.fromMe) {
      try {
        const { callGeminiAPI, isLikelyCommand } = await import('./lib/geminiAPI.js')
        if (isLikelyCommand(m.text)) return
        if (m.text.trim().length < 3) return
        if (/^[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]*$/u.test(m.text)) return

        const userName = m.pushName || m.name || 'Usuario'
        const groupName = await this.getName?.(m.chat) || 'Grupo'
        await this.sendPresenceUpdate?.('composing', m.chat)
        const response = await callGeminiAPI(m.text, userName, groupName, m.chat)
        if (response && response.length > 0) {
          await conn.sendMessage?.(m.chat, {
            text: response,
            contextInfo: {
              ...global.rcanal?.contextInfo
            }
          }, { quoted: m })
        }
      } catch (error) {
        console.error('Error en Modo IA:', error)
      }
    }

    // Modo Hot
    if (m.isGroup && global.db.data?.modoHot && global.db.data.modoHot[m.chat] === true && m.text && !m.fromMe) {
      try {
        const { callGeminiHotAPI, isLikelyCommand } = await import('./lib/geminiAPI.js')
        if (isLikelyCommand(m.text)) return
        if (m.text.trim().length < 3) return
        if (/^[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]*$/u.test(m.text)) return

        const userName = m.pushName || m.name || 'Usuario'
        const groupName = await this.getName?.(m.chat) || 'Grupo'
        await this.sendPresenceUpdate?.('composing', m.chat)
        const response = await callGeminiHotAPI(m.text, userName, groupName, m.chat)
        if (response && response.length > 0) {
          await conn.sendMessage?.(m.chat, {
            text: response,
            contextInfo: {
              ...global.rcanal?.contextInfo
            }
          }, { quoted: m })
        }
      } catch (error) {
        console.error('Error en Modo Hot:', error)
      }
    }

    // Modo Ilegal
    if (m.isGroup && global.db.data?.modoIlegal && global.db.data.modoIlegal[m.chat] === true && m.text && !m.fromMe) {
      try {
        const { callGeminiIlegalAPI, isLikelyCommand } = await import('./lib/geminiAPI.js')
        if (isLikelyCommand(m.text)) return
        if (m.text.trim().length < 3) return
        if (/^[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]*$/u.test(m.text)) return

        const userName = m.pushName || m.name || 'Usuario'
        const groupName = await this.getName?.(m.chat) || 'Grupo'
        await this.sendPresenceUpdate?.('composing', m.chat)
        const response = await callGeminiIlegalAPI(m.text, userName, groupName, m.chat)
        if (response && response.length > 0) {
          await conn.sendMessage?.(m.chat, {
            text: response,
            contextInfo: {
              ...global.rcanal?.contextInfo
            }
          }, { quoted: m })
        }
      } catch (error) {
        console.error('Error en Modo Ilegal:', error)
      }
    }
    // fin del try principal
  } catch (e) {
    console.error('Handler main error:', e)
  } finally {
    // limpieza de queue
    try {
      if (opts['queque'] && chatUpdate && this.msgqueque && chatUpdate.messages) {
        // el id del mensaje que procesamos
        const mProcessed = chatUpdate.messages[chatUpdate.messages.length - 1]
        const id = mProcessed?.id || mProcessed?.key?.id
        if (id) {
          const idx = this.msgqueque.indexOf(id)
          if (idx !== -1) this.msgqueque.splice(idx, 1)
        }
      }
    } catch (e) {
      console.error('Queue cleanup error:', e)
    }

    // actualizar stats y usuario
    try {
      const mFinal = chatUpdate.messages?.[chatUpdate.messages.length - 1]
      if (mFinal) {
        const userObj = mFinal.sender && global.db.data?.users?.[mFinal.sender] ? global.db.data.users[mFinal.sender] : null
        if (userObj) {
          userObj.exp = (userObj.exp || 0) + (mFinal.exp || 0)
          userObj.limit = (userObj.limit || 0) - (mFinal.limit || 0)
        }

        if (mFinal.plugin) {
          global.db.data.stats = global.db.data.stats || {}
          let now = Date.now()
          let stat = global.db.data.stats[mFinal.plugin] ||= { total: 0, success: 0, last: 0, lastSuccess: 0 }
          stat.total += 1
          stat.last = now
          if (mFinal.error == null) {
            stat.success += 1
            stat.lastSuccess = now
          }
        }
      }
    } catch (e) {
      console.error('Stats update error:', e)
    }

    // print (si no noprint)
    try {
      if (!opts['noprint']) {
        const printer = (await import('./lib/print.js')).default
        await printer?.(chatUpdate.messages?.[chatUpdate.messages.length - 1], this)
      }
    } catch (e) {
      console.log('Print error:', e)
    }

    // auto-read adaptativo
    try {
      const mFinal = chatUpdate.messages?.[chatUpdate.messages.length - 1]
      const settingsREAD = global.db.data?.settings?.[conn.user?.jid] || {}
      const isSubBot = conn.user?.jid !== global.conn?.user?.jid
      let shouldAutoRead = settingsREAD?.autoread ?? true

      // si sub-bot y hay config local, respetarla
      if (isSubBot) {
        try {
          const botNumber = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
          if (botNumber) {
            const configPath = `./Serbot/${botNumber}/config.json`
            if (existsSync(configPath)) {
              const config = JSON.parse(readFileSync(configPath, 'utf-8'))
              if (config.autoRead === false) shouldAutoRead = false
            }
          }
        } catch (e) {
          console.error('Error leyendo configuración de auto-leer:', e)
        }
      }

      if (shouldAutoRead) {
        const mFinalKey = mFinal?.key ? [mFinal.key] : []
        if (mFinalKey.length > 0) {
          await conn.readMessages?.(mFinalKey).catch(e => console.error('readMessages error:', e))
          if (mFinal?.isGroup) {
            try {
              await conn.readMessages?.(mFinalKey, { readEphemeral: true })
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error('Auto-read error:', e)
    }
  } // finally end
} // handler end

// watcher para recargar cambios del handler
const watchedFile = global.__filename?.(import.meta.url, true) || fileURLToPath(import.meta.url)
watchFile(watchedFile, async () => {
  try {
    unwatchFile(watchedFile)
    console.log(chalk.magenta("Se actualizó 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
  } catch (e) {
    console.error('watcher error:', e)
  }
})