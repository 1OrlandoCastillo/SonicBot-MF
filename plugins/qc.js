import { sticker } from '../lib/sticker.js'
import axios from 'axios'

const handler = async (m, { conn, args }) => {
  try {
    // 1️⃣ Obtener texto
    let text
    if (args.length >= 1) {
      text = args.join(' ')
    } else if (m.quoted && m.quoted.text) {
      text = m.quoted.text
    } else {
      return conn.reply(m.chat, '🚩 Te faltó el texto!', m)
    }

    if (!text) return conn.reply(m.chat, '🚩 Te faltó el texto!', m)

    // 2️⃣ Determinar usuario (para foto y nombre)
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    const nombre = await conn.getName(who)

    // Limitar longitud del texto
    if (text.length > 40) return conn.reply(m.chat, '🚩 El texto no puede tener más de 40 caracteres', m)

    // 3️⃣ Obtener foto de perfil
    const pp = await conn.profilePictureUrl(who).catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

    // 4️⃣ Crear objeto para API de quote
    const obj = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#000000', // fondo oscuro
      width: 512,
      height: 768,
      scale: 2,
      messages: [
        {
          entities: [],
          avatar: true,
          from: { id: 1, name: nombre, photo: { url: pp } },
          text: text,
          replyMessage: {}
        }
      ]
    }

    // 5️⃣ Llamar a la API
    const json = await axios.post('https://bot.lyo.su/quote/generate', obj, {
      headers: { 'Content-Type': 'application/json' }
    })

    const buffer = Buffer.from(json.data.result.image, 'base64')

    // 6️⃣ Crear sticker y enviar
    const stiker = await sticker(buffer, false, global.packname || 'SonicBot', global.author || 'SonicBot')
    if (stiker) return conn.sendFile(m.chat, stiker, 'quote.webp', '', m)

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Ocurrió un error creando el sticker', m)
  }
}

handler.help = ['qc <texto>']
handler.tags = ['sticker']
handler.command = /^(qc)$/i
handler.limit = 2

export default handler
