import { sticker} from '../lib/sticker.js'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, args, usedPrefix, command}) => {
  if (!text) return m.reply(`《★》Ingresa un texto para crear tu sticker\n> *Ejemplo:* ${usedPrefix + command} Copilot`)

  try {
    const encodedText = encodeURIComponent(text)
    const stiker = await sticker(null, `https://api.nekorinn.my.id/maker/brat-v2?text=${encodedText}`, global.packname, global.wm)

    conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
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
}, { quoted: m})
} catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al generar el sticker.')
}
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = ['brat']
handler.estrellas = 3

export default handler