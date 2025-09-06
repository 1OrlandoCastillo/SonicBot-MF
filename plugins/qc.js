// plugins/qc.js
// Plugin .qc -> genera sticker tipo captura de mensaje de WhatsApp
import Jimp from 'jimp'
import { createSticker } from 'wa-sticker-formatter'

export default {
  name: 'qc',
  command: ['qc'],
  tags: ['sticker', 'fun'],
  help: ['.qc <texto> - Convierte texto en estilo chat de WhatsApp'],
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

      // Crear imagen base (estilo captura de chat)
      const width = 600
      const height = 300
      const image = new Jimp(width, height, '#ece5dd') // fondo típico WhatsApp

      // cargar fuentes
      const fontName = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
      const fontMsg = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
      const fontTime = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)

      // nombre del remitente
      const senderName = m.pushName || 'Usuario'

      // Dibuja burbuja verde (como mensaje enviado)
      const bubbleWidth = width - 100
      const bubbleHeight = height - 100
      const bubble = new Jimp(bubbleWidth, bubbleHeight, '#dcf8c6') // verde chat
      image.composite(bubble, 50, 50)

      // Nombre del remitente (arriba en negrita/oscuro)
      image.print(
        fontName,
        70,
        60,
        {
          text: senderName,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        bubbleWidth - 20,
        40
      )

      // Texto del mensaje
      image.print(
        fontMsg,
        70,
        100,
        {
          text: input,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        bubbleWidth - 40,
        bubbleHeight - 60
      )

      // Hora (abajo a la derecha)
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const timeStr = `${hours}:${minutes}`
      image.print(
        fontTime,
        70,
        bubbleHeight + 30,
        {
          text: timeStr,
          alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
          alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
        },
        bubbleWidth - 40,
        30
      )

      // Convertir a sticker
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
      await conn.sendMessage(chat, { text: '❌ Error al generar la captura de chat' }, { quoted: m })
    }
  }
}