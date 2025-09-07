import Canvas from 'canvas'

const handler = async (update) => {
  const { conn } = global
  const { participants, action, id } = update
  if (action !== 'remove') return
  if (!id) return

  try {
    const groupMetadata = await conn.groupMetadata(id)
    const groupName = groupMetadata.subject

    for (let user of participants) {
      let ppUrl
      try {
        ppUrl = await conn.profilePictureUrl(user, 'image')
      } catch {
        ppUrl = 'https://telegra.ph/file/0d4d3f3d0f7c1a0d0a4f9.jpg'
      }

      const canvas = Canvas.createCanvas(700, 300)
      const ctx = canvas.getContext('2d')

      const background = await Canvas.loadImage('https://i.ibb.co/5cF1B3v/welcome-bg.jpg')
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

      const avatar = await Canvas.loadImage(ppUrl)
      ctx.save()
      ctx.beginPath()
      ctx.arc(125, 125, 100, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatar, 25, 25, 200, 200)
      ctx.restore()

      ctx.font = '40px sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'left'
      ctx.fillText(`¡Adiós!`, 250, 100)
      ctx.fillText(`${user.split('@')[0]}`, 250, 160)
      ctx.fillText(`del grupo:`, 250, 210)
      ctx.fillText(`${groupName}`, 250, 260)

      const buffer = canvas.toBuffer()

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