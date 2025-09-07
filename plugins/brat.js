// plugins/brat.js
// Sticker .brat -> texto dinámico, adaptado y con fuente bonita
import Jimp from 'jimp'
import { createSticker } from 'wa-sticker-formatter'
import path from 'path'
import fs from 'fs'

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

      // Ruta de fuente bonita (asegúrate de poner el archivo en ./fonts)
      const fontPath = path.resolve('./fonts/Montserrat-Bold.ttf')
      if (!fs.existsSync(fontPath)) {
        return conn.sendMessage(chat, { text: "❌ Falta la fuente Montserrat-Bold.ttf en ./fonts/" }, { quoted: m })
      }

      // Función para calcular tamaño dinámico
      let fontSize = 128
      let font
      while (fontSize > 16) {
        font = await Jimp.loadFont(Jimp[`FONT_SANS_${fontSize}_BLACK`] || Jimp.FONT_SANS_16_BLACK)
        const textWidth = Jimp.measureText(font, input)
        const textHeight = Jimp.measureTextHeight(font, input, size - 60)
        if (textWidth <= size - 60 && textHeight <= size - 60) break
        fontSize -= 16
      }

      const textBoxWidth = size - 60
      const textBoxHeight = size - 60

      // Dibujar con contorno elegante
      const drawTextWithOutline = (img, font, text) => {
        const positions = [
          [-3, 0], [3, 0], [0, -3], [0, 3],
          [-3, -3], [3, -3], [-3, 3], [3, 3]
        ]

        // contorno gris oscuro
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

      drawTextWithOutline(image, font, input)

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