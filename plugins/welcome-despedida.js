import Jimp from "jimp"

const handler = async (update, { conn }) => {
  try {
    const participants = update.participants || []
    const action = update.action
    const chatId = update.id

    if (!["add", "remove"].includes(action)) return

    const groupMetadata = await conn.groupMetadata(chatId)
    const groupName = groupMetadata.subject || "este grupo"

    for (let user of participants) {
      const nombre = await conn.getName(user)
      let avatar

      try {
        avatar = await conn.profilePictureUrl(user, "image")
      } catch {
        avatar = "https://telegra.ph/file/24fa902ead26340f3df2c.png"
      }

      // Texto según acción
      let msgText = ""
      if (action === "add") {
        msgText = `👋 Bienvenido *@${user.split("@")[0]}* a *${groupName}*`
      } else if (action === "remove") {
        msgText = `👋 *@${user.split("@")[0]}* se fue...\n😈 QUE BUENO QUE SE SALIÓ`
      }

      // Editar imagen con Jimp
      const image = await Jimp.read(avatar)
      image.cover(512, 512)
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
      image.print(font, 10, 470, {
        text: nombre,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      })

      const buffer = await image.getBufferAsync(Jimp.MIME_PNG)

      // Enviar imagen + mención
      await conn.sendMessage(chatId, {
        image: buffer,
        caption: msgText,
        mentions: [user],
      })
    }
  } catch (e) {
    console.error("❌ Error en welcome/despedida:", e)
  }
}

handler.event = "group-participants.update"
export default handler
