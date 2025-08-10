import { proto } from '@whiskeysockets/baileys'

let listaActiva = false
let escuadra = []
let suplentes = []
let messageId = null
let chatId = null

// Función para generar texto con menciones
function generarEmbed(escuadra, suplentes, horasEnPais) {
  const mentions = [...escuadra, ...suplentes].map(u => u.jid)

  const escuadraText = escuadra.length
    ? escuadra.map(u => `┊ 👍🏻 ➤ @${u.nombre}`).join('\n')
    : `┊ 👍🏻 ➤ \n┊ 👍🏻 ➤ \n┊ 👍🏻 ➤ \n┊ 👍🏻 ➤`

  const suplentesText = suplentes.length
    ? suplentes.map(u => `┊ ❤️ ➤ @${u.nombre}`).join('\n')
    : `┊ ❤️ ➤ \n┊ ❤️ ➤`

  const text = `
*4 𝐕𝐄𝐑𝐒𝐔𝐒 4*

🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : ${horasEnPais ? formatTime(horasEnPais[0]) : ''}
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${horasEnPais ? formatTime(horasEnPais[1]) : ''}
🇨🇱 𝐂𝐇𝐈𝐋𝐄 : ${horasEnPais ? formatTime(horasEnPais[2]) : ''}
🇦🇷 𝐀𝐑𝐆𝐄𝐍𝐓𝐈𝐍𝐀 : ${horasEnPais ? formatTime(horasEnPais[3]) : ''}

𝐇𝐎𝐑𝐀 𝐀𝐂𝐓𝐔𝐀𝐋 𝐄𝐍 𝐌𝐄𝐗𝐈𝐂𝐎🇲🇽 : ${formatTime(new Date())}

𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔
${escuadraText}

ㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄:
${suplentesText}

❤️ = Suplente | 👍🏻 = Escuadra

• Lista activa por 5 minutos
`

  return { text, mentions }
}

const formatTime = (date) =>
  date.toLocaleTimeString('es', { hour12: false, hour: '2-digit', minute: '2-digit' })

// Listener global para reacciones
async function reactionListener(msg, conn) {
  try {
    if (!listaActiva) return
    if (msg.key.remoteJid !== chatId) return
    if (msg.key.id !== messageId) return
    if (!msg.message?.reactionMessage) return
    if (msg.key.fromMe) return

    const userJid = msg.key.participant || msg.key.remoteJid
    const nombre = await conn.getName(userJid)
    const reaction = msg.message.reactionMessage.text

    if (reaction === '👍🏻') {
      if (!escuadra.find(u => u.jid === userJid)) {
        escuadra.push({ jid: userJid, nombre })
        suplentes = suplentes.filter(u => u.jid !== userJid)
      }
    } else if (reaction === '❤️') {
      if (!suplentes.find(u => u.jid === userJid)) {
        suplentes.push({ jid: userJid, nombre })
        escuadra = escuadra.filter(u => u.jid !== userJid)
      }
    } else {
      return
    }

    const { text, mentions } = generarEmbed(escuadra, suplentes, horasEnPais)
    // Editar mensaje original para actualizar lista
    await conn.sendMessage(chatId, { text, mentions, editingMessage: messageId })
  } catch (e) {
    console.error(e)
  }
}

// Registrar el listener global UNA vez, con acceso a conn
let listenerRegistrado = false
function registrarListenerGlobal(conn) {
  if (listenerRegistrado) return
  listenerRegistrado = true
  conn.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) reactionListener(msg, conn)
  })
}

let horasEnPais = null

const handler = async (m, { conn, args }) => {
  if (listaActiva) {
    return conn.sendMessage(
      m.chat,
      { text: '❌ *¡Ya hay una lista activa! Por favor espera que termine antes de crear otra.*' },
      { quoted: m }
    )
  }

  if (args.length < 2) {
    conn.reply(m.chat, '𝘋𝘦𝘣𝘦𝘴 𝘱𝘳𝘰𝘱𝘰𝘳𝘤𝘪𝘰𝘯𝘢𝘳 𝘭𝘢 𝘩𝘰𝘳𝘢 (𝘏𝘏:𝘔𝘔) 𝘺 𝘦𝘭 𝘱𝘢𝘪́𝘴 (𝘔𝘟, 𝘊𝘖, 𝘊𝘓, 𝘈𝘙).', m)
    return
  }

  const horaRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/
  if (!horaRegex.test(args[0])) {
    conn.reply(m.chat, '𝘍𝘰𝘳𝘮𝘢𝘵𝘰 𝘥𝘦 𝘩𝘰𝘳𝘢 𝘪𝘯𝘤𝘰𝘳𝘳𝘦𝘤𝘵𝘰. 𝘋𝘦𝘣𝘦 𝘴𝘦𝘳 𝘏𝘏:𝘔𝘔 𝘦𝘯 𝘧𝘰𝘳𝘮𝘢𝘵𝘰 𝘥𝘦 24 𝘩𝘰𝘳𝘢𝘴.', m)
    return
  }

  const horaUsuario = args[0]
  const pais = args[1].toUpperCase()

  const diferenciasHorarias = {
    MX: 0,
    CO: 1,
    CL: 2,
    AR: 3
  }

  if (!(pais in diferenciasHorarias)) {
    conn.reply(m.chat, 'País no válido. Usa MX para México, CO para Colombia, CL para Chile o AR para Argentina.', m)
    return
  }

  listaActiva = true
  escuadra = []
  suplentes = []
  chatId = m.chat

  const diferenciaHoraria = diferenciasHorarias[pais]
  const hora = parseInt(horaUsuario.split(':')[0], 10)
  const minutos = parseInt(horaUsuario.split(':')[1], 10)

  horasEnPais = []
  for (let i = 0; i < 4; i++) {
    const horaActual = new Date()
    horaActual.setHours(hora + i)
    horaActual.setMinutes(minutos)
    horaActual.setSeconds(0)
    horaActual.setMilliseconds(0)

    const horaEnPais = new Date(horaActual.getTime() - 3600000 * diferenciaHoraria)
    horasEnPais.push(horaEnPais)
  }

  const { text, mentions } = generarEmbed(escuadra, suplentes, horasEnPais)
  const message = await conn.sendMessage(chatId, { text, mentions }, { quoted: m })

  messageId = message.key.id

  registrarListenerGlobal(conn)

  // Tiempo para cerrar la lista y liberar variable
  setTimeout(() => {
    listaActiva = false
    escuadra = []
    suplentes = []
    messageId = null
    chatId = null
    horasEnPais = null
    console.log('La lista ha expirado.')
  }, 300000)
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(4vs4|vs4)$/i

export default handler