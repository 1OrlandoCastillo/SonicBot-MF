// plugins/brat.js
// Plugin .brat -> genera un sticker con texto dinámico y remarcado
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
      const image = new Jimp(size, size, '#ffffff') // fondo blanco

      // Selección de fuente dinámica según la longitud
      let font
      if (input.length <= 10) font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK)
      else if (input.length <= 20) font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
      else if (input.length <= 40) font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
      else font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)

      const textBoxWidth = size - 60
      const textBoxHeight = size - 60

      // Función para dibujar texto con contorno
      const drawTextWithOutline = (img, font, text) => {
        const positions = [
          [-2, 0], [2, 0], [0, -2], [0, 2], // lados
          [-2, -2], [2, -2], [-2, 2], [2, 2] // esquinas
        ]

        // dibujar sombra/contorno en gris
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

        // dibujar texto principal en negro
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
        pack: 'BratPack',
        author: (m.pushName || 'Brat Bot').toString(),
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