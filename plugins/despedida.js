import Canvas from 'canvas'
import fetch from 'node-fetch'

const handler = async (update) => {
  const { conn } = global
  const { participants, action, id } = update
  if (action !== 'remove') return // Solo al salir alguien
  if (!id) return

  try {
    const groupMetadata = await conn.groupMetadata(id)
    const groupName = groupMetadata.subject

    for (let user of participants) {
      // Obtener foto de perfil del usuario
      let ppUrl
      try {
        ppUrl = await conn.profilePictureUrl(user, 'image')
      } catch {
        ppUrl = 'https://telegra.ph/file/0d4d3f3d0f7c1a0d0a4f9.jpg' // Default
      }

      // Crear canvas
      const canvas = Canvas.createCanvas(700, 250)
      const ctx = canvas.getContext('2d')

      // Fondo
      const background = await Canvas.loadImage('https://i.ibb.co/5cF1B3v/welcome-bg.jpg') // Fondo bonito
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

      // Foto del usuario
      const avatar = await Canvas.loadImage(ppUrl)
      ctx.beginPath()
      ctx.arc(125, 125, 100, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatar, 25, 25, 200, 200)
      ctx.restore()

      // Texto
      ctx.font = '40px Sans'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'left'
      ctx.fillText(`¡Adiós!`, 250, 100)
      ctx.fillText(`${user.split('@')[0]}`, 250, 160)
      ctx.fillText(`del grupo:`, 250, 210)
      ctx.fillText(`${groupName}`, 250, 260)

      // Convertir canvas a buffer
      const buffer = canvas.toBuffer()

      // Enviar mensaje con imagen
      await conn.sendMessage(id, {
        image: buffer,
        caption: `😢 @${user.split('@')[0]} ha salido del grupo *${groupName}*`,
        mentions: [user]
      })
    }

  } catch (err) {
    console.error('Error en goodbye.js con banner:', err)
  }
}

handler.event = 'group-participants.update'
export default handler