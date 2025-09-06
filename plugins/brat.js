// plugins/brat.js
// Plugin .brat -> genera un sticker con texto dinámico y ajusta tamaño automáticamente
import Jimp from 'jimp'
import { createSticker } from 'wa-sticker-formatter'

export default {
  name: 'brat',
  command: ['brat'],
  tags: ['sticker', 'fun'],
  help: ['.brat <texto> - Crea un sticker con el texto'],
  async handler(m, { conn, args, usedPrefix, command, text }) {
    try {
      const chat = m.chat || (m.key && m.key.remoteJid)
      const input = (text || args?.join(' ') || '').trim()
      if (!input) {
        return conn.sendMessage(
          chat,
          { text: `Uso: ${usedPrefix || '.'}${command} <texto>\nEjemplo: ${usedPrefix || '.'}${command} ola soy Adri` },
          { quoted: m }
        )
      }

      const size = 512
      const image = new Jimp(size, size, '#ffffff') // 🔥 fondo blanco

      // Fuentes disponibles de mayor a menor
      const fonts = [
        await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK),
        await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK),
        await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK),
        await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)
      ]

      const textBoxWidth = size - 60
      const textBoxHeight = size - 60

      // Seleccionar la fuente más grande que quepa
      let chosenFont = fonts[fonts.length - 1] // por defecto la más pequeña
      for (let f of fonts) {
        const textWidth = Jimp.measureText(f, input)
        const textHeight = Jimp.measureTextHeight(f, input, textBoxWidth)
        if (textWidth <= textBoxWidth && textHeight <= textBoxHeight) {
          chosenFont = f
          break
        }
      }

      // Dibujar texto con contorno
      const drawTextWithOutline = (img, font, text) => {
        const positions = [
          [-2, 0], [2, 0], [0, -2], [0, 2],
          [-2, -2], [2, -2], [-2, 2], [2, 2]
        ]

        // contorno gris
        positions.forEach(([dx, dy]) => {
          img.print(
            font,
            30 + dx,
            30 + dy,
            {
              text,
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            textBoxWidth,
            textBoxHeight
          )
        })

        // texto principal negro
        img.print(
          font,
          30,
          30,
          {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
          },
          textBoxWidth,
          textBoxHeight
        )
      }

      drawTextWithOutline(image, chosenFont, input)

      const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG)

      const stickerBuffer = await createSticker(pngBuffer, {
        pack: 'Adribot Pack',
        author: 'El mejor bot Adribot ✨',
        type: 'full',
        quality: 80,
        categories: ['✨']
      })

      await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m })
    } catch (err) {
      console.error(err)
      try {
        const chat = m.chat || (m.key && m.key.remoteJid)
        await conn.sendMessage(chat, { text: '❌ Error al crear el sticker, revisa la consola.' }, { quoted: m })
      } catch {}
    }
  }
}