// plugins/qc.js
import Jimp from 'jimp'
import { createSticker } from 'wa-sticker-formatter'
import path from 'path'

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

      // Foto de perfil circular
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

      // Nombre y texto
      const displayName = m.pushName || 'Usuario'
      const fontName = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
      const fontMsg = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

      // Dimensiones dinámicas
      const width = 500
      const textWidth = width - 120
      const textHeight = Jimp.measureTextHeight(fontMsg, input, textWidth)
      const height = Math.max(100, textHeight + 70)

      // Fondo general
      const image = new Jimp(width, height, '#121b22')

      // Burbuja redondeada
      const bubble = new Jimp(width - 80, textHeight + 50, '#1f2c34')
      const maskPath = path.join(process.cwd(), 'assets', 'bubble-mask.png') // ruta a tu máscara
      const bubbleMask = await Jimp.read(maskPath)
      bubbleMask.resize(bubble.bitmap.width, bubble.bitmap.height)
      bubble.mask(bubbleMask, 0, 0)

      // Componer
      image.composite(bubble, 60, 20)
      image.composite(pfp, 5, 35)

      // Nombre (arriba, estilo marrón/naranja)
      image.print(fontName, 70, 25, displayName)

      // Mensaje
      image.print(fontMsg, 70, 55, {
        text: input,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      }, textWidth, textHeight)

      // Exportar
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
      await conn.sendMessage(chat, { text: '❌ Error al generar el sticker' }, { quoted: m })
    }
  }
}