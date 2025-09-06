// plugins/qc.js
// Plugin .qc -> genera un sticker idéntico a un mensaje de WhatsApp en modo oscuro
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
        return conn.sendMessage(
          chat,
          { text: `Uso: ${usedPrefix || '.'}${command} <texto>\nEjemplo: ${usedPrefix || '.'}${command} Hola 👋` },
          { quoted: m }
        )
      }

      // obtener foto de perfil
      let pfp
      try {
        const url = await conn.profilePictureUrl(m.sender, 'image')
        pfp = await Jimp.read(url)
      } catch {
        pfp = await Jimp.read('https://i.ibb.co/fx3Dzj8/avatar.png') // fallback
      }

      // preparar avatar circular
      pfp.resize(90, 90)
      const mask = await new Jimp(90, 90, 0x00000000)
      mask.scan(0, 0, 90, 90, function (x, y, idx) {
        const dx = x - 45
        const dy = y - 45
        if (dx * dx + dy * dy <= 2025) {
          this.bitmap.data[idx + 3] = 255
        }
      })
      pfp.mask(mask)

      // base del sticker
      const width = 700
      const height = 220
      const image = new Jimp(width, height, '#0b141a') // fondo oscuro WhatsApp

      // fuentes
      const fontName = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
      const fontMsg = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
      const fontTime = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

      const senderName = m.pushName || 'Usuario'

      // burbuja oscura
      const bubbleWidth = width - 180
      const bubbleHeight = height - 70
      const bubble = new Jimp(bubbleWidth, bubbleHeight, '#202c33')
      image.composite(bubble, 120, 30)

      // avatar
      image.composite(pfp, 20, 60)

      // nombre arriba en verde
      image.print(
        fontName,
        140,
        40,
        {
          text: senderName,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        bubbleWidth - 30,
        40
      )

      // mensaje
      image.print(
        fontMsg,
        140,
        85,
        {
          text: input,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        bubbleWidth - 40,
        bubbleHeight - 50
      )

      // hora
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const timeStr = `${hours}:${minutes}`
      image.print(
        fontTime,
        140,
        bubbleHeight + 20,
        {
          text: timeStr,
          alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
          alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
        },
        bubbleWidth - 40,
        30
      )

      // convertir en sticker
      const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
      const stickerBuffer = await createSticker(pngBuffer, {
        pack: 'Adribot Pack',
        author: 'El mejor bot Adribot ✨',
        type: 'full',
        quality: 80,
        categories: ['💬']
      })

      await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m })
    } catch (err) {
      console.error(err)
      const chat = m.chat || (m.key && m.key.remoteJid)
      await conn.sendMessage(chat, { text: '❌ Error al generar el sticker tipo chat' }, { quoted: m })
    }
  }
}