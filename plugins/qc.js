// plugins/qc.js
import Jimp from 'jimp'
import { createSticker } from 'wa-sticker-formatter'

export default {
  name: 'qc',
  command: ['qc'],
  tags: ['sticker', 'fun'],
  help: ['.qc <texto> - Convierte texto en sticker estilo chat de WhatsApp'],
  async handler(m, { conn, args, text, usedPrefix, command }) {
    try {
      const chat = m.chat || (m.key && m.key.remoteJid)
      const input = (text || args?.join(' ') || '').trim()
      if (!input) return conn.sendMessage(chat, { text: `Uso: ${usedPrefix || '.'}${command} <texto>` }, { quoted: m })

      // foto de perfil
      let pfp
      try {
        const url = await conn.profilePictureUrl(m.sender, 'image')
        pfp = await Jimp.read(url)
      } catch {
        pfp = await Jimp.read('https://i.ibb.co/fx3Dzj8/avatar.png')
      }
      pfp.resize(50, 50)
      const mask = await new Jimp(50, 50, 0x00000000)
      mask.scan(0, 0, 50, 50, function (x, y, idx) {
        const dx = x - 25, dy = y - 25
        if (dx * dx + dy * dy <= 625) this.bitmap.data[idx + 3] = 255
      })
      pfp.mask(mask)

      // base sticker
      const width = 500
      const height = 120
      const image = new Jimp(width, height, '#121b22') // fondo oscuro tipo WhatsApp

      // burbuja mensaje
      const bubble = new Jimp(width - 80, height - 40, '#1f2c34') // burbuja negra
      image.composite(bubble, 60, 20)
      image.composite(pfp, 5, 35)

      // fuentes
      const fontName = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
      const fontMsg = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

      const senderName = m.pushName || 'Usuario'

      // nombre arriba
      image.print(fontName, 70, 25, senderName)

      // mensaje
      image.print(fontMsg, 70, 50, input)

      // sticker final
      const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
      const stickerBuffer = await createSticker(pngBuffer, {
        pack: 'Adribot Pack',
        author: 'El mejor bot Adribot ✨',
        type: 'full',
        quality: 90
      })

      await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m })

    } catch (err) {
      console.error(err)
      const chat = m.chat || (m.key && m.key.remoteJid)
      await conn.sendMessage(chat, { text: '❌ Error al generar el sticker tipo chat' }, { quoted: m })
    }
  }
}