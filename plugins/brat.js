// plugins/brat.js
// Plugin .brat -> genera un sticker con el texto provisto
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
        return conn.sendMessage(chat, { text: `Uso: ${usedPrefix || '.'}${command} <texto>\nEjemplo: ${usedPrefix || '.'}${command} ola soy Adri` }, { quoted: m })
      }

      // Crear imagen base (512x512) y escribir texto centrado
      const size = 512
      const image = new Jimp(size, size, '#ffffff') // fondo blanco
      // cargar fuente (tamaño automático según longitud)
      let font
      if (input.length <= 20) font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
      else if (input.length <= 40) font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
      else font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)

      // Ajustar texto para que quede centrado: lo dibujamos con ancho máximo y centrado
      const textWidth = size - 40
      image.print(
        font,
        20,
        20,
        {
          text: input,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        textWidth,
        size - 40
      )

      // Si quieres, puedes poner sombra o borde simple (opcional)
      // exportar a buffer PNG
      const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG)

      // Crear sticker webp con wa-sticker-formatter
      const stickerBuffer = await createSticker(pngBuffer, {
        pack: 'BratPack',
        author: (m.pushName || 'Brat Bot').toString(),
        type: 'full', // tamaño completo
        quality: 80,
        categories: ['🤖', '✨']
      })

      // Enviar sticker
      await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m })
    } catch (err) {
      console.error(err)
      try {
        // fallback: enviar el texto como mensaje de error al usuario
        const chat = m.chat || (m.key && m.key.remoteJid)
        await conn.sendMessage(chat, { text: 'Ocurrió un error al crear el sticker. Revisa la consola del servidor.' }, { quoted: m })
      } catch {}
    }
  }
}