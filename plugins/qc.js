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
      if (!input) {
        return conn.sendMessage(chat, { text: `Uso: ${usedPrefix || '.'}${command} <texto>` }, { quoted: m })
      }

      // Foto de perfil
      let pfp
      try {
        const url = await conn.profilePictureUrl(m.sender, 'image')
        pfp = await Jimp.read(url)
      } catch {
        pfp = await Jimp.read('https://i.ibb.co/fx3Dzj8/avatar.png')
      }
      pfp.resize(50, 50)
      const mask = new Jimp(50, 50, 0x00000000)
      mask.scan(0, 0, 50, 50, function (x, y, idx) {
        const dx = x - 25, dy = y - 25
        if (dx * dx + dy * dy <= 625) this.bitmap.data[idx + 3] = 255
      })
      pfp.mask(mask)

      // Nombre y número
      const displayName = m.pushName || 'Usuario'
      const number = m.sender.split('@')[0]

      // Fuentes
      const fontName = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
      const fontNumber = await Jimp.loadFont(Jimp.FONT_SANS_14_WHITE)
      const fontMsg = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

      // Calcular alto dinámico
      const width = 500
      const textWidth = width - 120
      const textHeight = Jimp.measureTextHeight(fontMsg, input, textWidth)
      const height = Math.max(120, textHeight + 80)

      // Fondo estilo WhatsApp
      const image = new Jimp(width, height, '#121b22')

      // Burbuja con borde negro
      const bubble = new Jimp(width - 80, textHeight + 50, '#1f2c34')
      bubble.scan(0, 0, bubble.bitmap.width, bubble.bitmap.height, function (x, y, idx) {
        if (x === 0 || y === 0 || x === bubble.bitmap.width - 1 || y === bubble.bitmap.height - 1) {
          this.bitmap.data[idx + 0] = 0 // R
          this.bitmap.data[idx + 1] = 0 // G
          this.bitmap.data[idx + 2] = 0 // B
        }
      })

      // Componer todo
      image.composite(bubble, 60, 20)
      image.composite(pfp, 5, 35)

      // Nombre (arriba)
      image.print(fontName, 70, 25, displayName)

      // Número (debajo del nombre, gris claro)
      image.print(fontNumber, 70, 45, `+${number}`)

      // Mensaje (ajustado al tamaño del texto)
      image.print(fontMsg, 70, 65, {
        text: input,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      }, textWidth, textHeight)

      // Exportar a PNG
      const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG)

      // Convertir en sticker
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