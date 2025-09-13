import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Validar texto
  if (!text) 
    return m.reply(`《★》Ingresa un texto para crear tu sticker\n> *Ejemplo:* ${usedPrefix + command} Copilot`)

  try {
    const encodedText = encodeURIComponent(text)

    // Generar sticker usando la API
    const stiker = await sticker(
      null,
      `https://api.nekorinn.my.id/maker/brat-v2?text=${encodedText}`,
      global.packname,
      global.wm
    )

    // Enviar sticker al chat
    conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
      quoted: m,
      contextInfo: {
        forwardingScore: 200,
        isForwarded: false,
        externalAdReply: {
          showAdAttribution: false,
          title: global.wm,
          body: global.dev,
          mediaType: 2,
          sourceUrl: global.imagen1,
          thumbnail: global.imagen1
        }
      }
    })

  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al generar el sticker.')
  }
}

// Configuración del handler
handler.help = ['brat']
handler.tags = ['sticker']
handler.command = ['brat']
handler.estrellas = 3

export default handler