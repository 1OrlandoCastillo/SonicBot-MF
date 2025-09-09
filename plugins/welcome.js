import Jimp from 'jimp'

const handler = async (update) => {
  const { conn } = global
  const { participants, action, id } = update
  if (action !== 'add') return
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

      const [background, avatar] = await Promise.all([
        Jimp.read('https://i.ibb.co/5cF1B3v/welcome-bg.jpg'),
        Jimp.read(ppUrl)
      ])

      background.resize(700, 250)
      avatar.resize(200, 200)

      const mask = new Jimp(200, 200, 0x00000000)
      mask.scan(0, 0, 200, 200, function (x, y, idx) {
        const dx = x - 100
        const dy = y - 100
        if (dx * dx + dy * dy <= 100 * 100) {
          this.bitmap.data[idx + 3] = 255
        }
      })

      avatar.mask(mask, 0, 0)
      background.composite(avatar, 25, 25)

      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
      background.print(font, 250, 80, '¡Bienvenido(a)!')
      background.print(font, 250, 130, `@${user.split('@')[0]}`)
      background.print(font, 250, 180, 'al grupo:')
      background.print(font, 250, 220, groupName)

      const buffer = await background.getBufferAsync(Jimp.MIME_JPEG)

      await conn.sendMessage(id, {
        image: buffer,
        caption: `👋 ¡Hola @${user.split('@')[0]}! Bienvenido(a) al grupo *${groupName}*`,
        mentions: [user]
      })
    }

  } catch (err) {
    console.error('❌ Error en welcome.js con Jimp:', err)
  }
}

handler.event = 'group-participants.update'
export default handler
