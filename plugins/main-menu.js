import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

// Definir __dirname en ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let tags = {
  'ADRIPENUDO': '👑「 *`MENUS SONIBOT-MF`* 」👑',
  'main': '「INFO」🍨',
  'buscador': '「BUSQUEDAS」🍨',
  'fun': '「JUEGOS」🍨',
  'serbot': '「SUB BOTS」🍨',
  'rpg': '「RPG」🍨',
  'rg': '「REGISTRO」🍨',
  'sticker': '「STICKERS」🍨',
  'emox': '「ANIMES」🍨',
  'database': '「DATABASE」🍨',
  'grupo': '「GRUPOS」🍨',
  'nable': '「ON / OFF」',
  'descargas': '「DESCARGAS」🍨',
  'tools': '「HERRAMIENTAS」🍨',
  'info': '「INFORMACIÓN」🍨',
  'owner': '「CREADOR」🍨',
  'logos': '「EDICION LOGOS」🍨',
}

const vid = 'https://files.catbox.moe/wsm4rs.jpg'

const defaultMenu = {
  before: `*•:•:•:•:•:•:•:•:•:•☾☼☽•:•.•:•.•:•:•:•:•:•*

"「💛」 ¡Hola! *%name* %greeting, Para Ver Tu Perfil Usa *#perfil* ❒"

╔━━━━━ *⊱𝐈𝐍𝐅𝐎 - 𝐁𝐎𝐓⊰*
✦  👤 *Cliente:* %name
✦  🔱 *Modo:* Privado VIP
✧  ✨ *Baileys:* Multi Device
✦  🪐 *Tiempo Activo:* %muptime
╚━━━━━━━━━━━━━━
%readmore
*✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧*\n\n> Para Ser Un Sub Bots Usa #code para codigo de 8 dígitos y #qr para codigo qr.

\t*(✰◠‿◠) 𝐂 𝐨 𝐦 𝐚 𝐧 𝐝 𝐨 𝐬*   
`.trimStart(),
  header: '┊➳ %category\n',
  body: '*┃⏤͟͟͞͞⚡➤›* %cmd',
  footer: '*┗━*\n',
  after: '> ¡Gracias por usar el bot!',
}

// Función segura para obtener nombres
async function safeGetName(conn, id) {
  try {
    if (!id) return 'Usuario'
    return await conn.getName(id) || id
  } catch {
    return id || 'Usuario'
  }
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Cargar package.json
    let _package = JSON.parse(await fs.readFile(join(__dirname, '../package.json')).catch(_ => '{}')) || {}

    // Datos de usuario
    let user = global.db.data.users[m.sender] || {}
    let exp = user.exp || 0
    let estrellas = user.estrellas || 0
    let level = user.level || 1
    let role = user.role || 'Aldeano'
    let { min, xp, max } = xpRange(level, global.multiplier || 1)
    let name = await safeGetName(conn, m.sender)

    // Fecha y hora
    let d = new Date(Date.now() + 3600000)
    let locale = 'es'
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let dateIslamic = new Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
    let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })

    // Greeting
    let hour = d.getHours()
    let greeting = (hour >= 0 && hour < 6) ? 'Bᴜᴇɴᴀs Nᴏᴄʜᴇs 🌙'
      : (hour < 12) ? 'Bᴜᴇɴᴏs Dɪᴀs 🌞'
      : (hour < 18) ? 'Bᴜᴇɴᴀs Tᴀʀᴅᴇs 🌇'
      : 'Bᴜᴇɴᴀs Nᴏᴄʜᴇs 🌙'

    // Uptime
    let _uptime = process.uptime() * 1000
    let _muptime = 0
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)

    // Registro de usuarios
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(u => u.registered).length

    // Plugins
    let help = Object.values(global.plugins).filter(p => !p.disabled).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      prefix: 'customPrefix' in plugin,
      premium: plugin.premium || false,
      enabled: !plugin.disabled
    }))

    for (let plugin of help)
      for (let tag of plugin.tags)
        if (!(tag in tags) && tag) tags[tag] = tag

    // Construir menú
    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        let categoryHeader = defaultMenu.header.replace(/%category/g, tags[tag])
        let commands = help
          .filter(p => p.tags.includes(tag) && p.help)
          .map(p => p.help.map(cmd => defaultMenu.body.replace(/%cmd/g, p.prefix ? cmd : _p + cmd)).join('\n'))
          .join('\n')
        return `${categoryHeader}\n${commands}\n${defaultMenu.footer}`
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      uptime, muptime,
      me: conn.user ? await safeGetName(conn, conn.user.id || conn.user.jid) : 'SonicBot-MF',
      taguser: '@' + (m.sender ? m.sender.split('@')[0] : 'user'),
      npmname: _package.name || '',
      npmdesc: _package.description || '',
      version: _package.version || '',
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      level, estrellas, name, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
      greeting,
      readmore: readMore
    }

    let text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => replace[name] || ''
    )

    // Reacción al mensaje
    await m.react?.('✨')

    // Descargar thumbnail como buffer
    let thumb = await (await fetch('https://qu.ax/kJBTp.jpg')).buffer()

    // Enviar menú
    await conn.sendMessage(m.chat, {
      video: { url: vid },
      caption: text,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: 'SonicBot-MF',
          body: 'Bot Oficial',
          thumbnail: thumb,
          sourceUrl: 'https://qu.ax/GEUuj.jpg'
        }
      }
    })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error al enviar el menú:\n${e.message}`, m)
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'menuall', 'allmenú', 'allmenu', 'menucompleto']
handler.register = false

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}