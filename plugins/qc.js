// plugins/qc.js
import Jimp from 'jimp'
import { createSticker } from 'wa-sticker-formatter'

export default {
  name: 'qc',
  command: ['qc'],
  tags: ['sticker', 'fun'],
  help: ['.qc <texto> - Convierte texto en sticker estilo chat de WhatsApp'],
  async handler(m, { conn, args, text, usedPrefix, command }) {
    const chat = m.chat || (m.key && m.key.remoteJid)
    try {
      const input = (text || args?.join(' ') || '').trim()
      if (!input) {
        return conn.sendMessage(chat, { text: `Uso: ${usedPrefix || '.'}${command} <texto>` }, { quoted: m })
      }

      // Foto de perfil (fallback si no tiene)
      let pfp
      try {
        const url = await conn.profilePictureUrl(m.sender, 'image')
        pfp = await Jimp.read(url)
      } catch {
        pfp = await Jimp.read('https://i.ibb.co/fx3Dzj8/avatar.png')
      }
      pfp.resize(50, 50)
      // máscara circular
      const mask = new Jimp(50, 50, 0x00000000)
      mask.scan(0, 0, 50, 50, function (x, y, idx) {
        const dx = x - 25, dy = y - 25
        if (dx * dx + dy * dy <= 25 * 25) this.bitmap.data[idx + 3] = 255
      })
      pfp.mask(mask)

      // Nombre tal cual sale en WhatsApp y número
      const displayName = m.pushName || 'Usuario'
      const number = (m.sender || '').split('@')[0] || ''

      // Fuentes (válidas en Jimp)
      const fontName = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
      const fontNumber = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE) // <- 16 (no 14)
      const fontMsg = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

      // Dimensiones dinámicas
      const width = 500
      const textWidth = width - 120
      const textHeight = Jimp.measureTextHeight(fontMsg, input, textWidth)
      const height = Math.max(120, textHeight + 90)

      // Fondo estilo WhatsApp
      const image = new Jimp(width, height, '#121b22')

      // Burbuja con borde negro (2px)
      const bubbleW = width - 80
      const bubbleH = textHeight + 60
      const bubble = new Jimp(bubbleW, bubbleH, '#1f2c34')

      // Borde negro simple
      const bw = 2
      bubble.scan(0, 0, bubbleW, bubbleH, function (x, y, idx) {
        const onBorder = (x < bw || y < bw || x >= bubbleW - bw || y >= bubbleH - bw)
        if (onBorder) {
          this.bitmap.data[idx + 0] = 0
          this.bitmap.data[idx + 1] = 0
          this.bitmap.data[idx + 2] = 0
          this.bitmap.data[idx + 3] = 255
        }
      })

      // Componer
      image.composite(bubble, 60, 20)
      image.composite(pfp, 5, 35)

      // Nombre (arriba)
      image.print(fontName, 70, 25, displayName)

      // Número debajo del nombre
      image.print(fontNumber, 70, 45, `+${number}`)

      // Mensaje (respeta saltos de línea)
      image.print(
        fontMsg,
        70,
        70,
        { text: input, alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, alignmentY: Jimp.VERTICAL_ALIGN_TOP },
        textWidth,
        textHeight
      )

      // PNG -> Sticker
      const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
      const stickerBuffer = await createSticker(pngBuffer, {
        pack: 'Adribot Pack',
        author: 'El mejor bot Adribot ✨',
        type: 'full',
        quality: 90
      })

      await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m })
    } catch (err) {
      console.error('qc error:', err)
      await conn.sendMessage(chat, { text: '❌ Error al generar el sticker: ' + (err?.message || err) }, { quoted: m })
    }
  }
}