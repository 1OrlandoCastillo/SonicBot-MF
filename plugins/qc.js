// plugins/qc.js
// Plugin .qc -> genera un sticker estilo mensaje de WhatsApp (como "me gusta el líder")
import Jimp from 'jimp'
import { createSticker } from 'wa-sticker-formatter'

export default {
  name: 'qc',
  command: ['qc'],
  tags: ['sticker', 'fun'],
  help: ['.qc <texto> - Convierte texto en estilo chat oscuro de WhatsApp'],
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
        pfp = await Jimp.read('https://i.ibb.co/fx3Dzj8/avatar.png') // default
      }

      // preparar avatar circular
      pfp.resize(100, 100)
      const mask = await new Jimp(100, 100, 0x00000000)
      mask.scan(0, 0, 100, 100, function (x, y, idx) {
        const dx = x - 50
        const dy = y - 50
        if (dx * dx + dy * dy <= 2500) {
          this.bitmap.data[idx + 3] = 255
        }
      })
      pfp.mask(mask)

      // crear base
      const width = 600
      const height = 200
      const image = new Jimp(width, height, '#0b141a') // fondo oscuro WhatsApp

      // fuentes
      const fontName = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
      const fontMsg = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)

      const senderName = m.pushName || 'Usuario'

      // poner avatar
      image.composite(pfp, 20, 50)

      // burbuja oscura
      const bubbleWidth = width - 150
      const bubbleHeight = height - 80
      const bubble = new Jimp(bubbleWidth, bubbleHeight, '#202c33') // gris oscuro burbuja
      image.composite(bubble, 140, 40)

      // nombre arriba (naranja como WhatsApp en modo oscuro)
      image.print(
        fontName,
        160,
        50,
        {
          text: senderName,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        bubbleWidth - 20,
        40
      )

      // texto del mensaje
      image.print(
        fontMsg,
        160,
        90,
        {
          text: input,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        bubbleWidth - 30,
        bubbleHeight - 50
      )

      // convertir a sticker
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