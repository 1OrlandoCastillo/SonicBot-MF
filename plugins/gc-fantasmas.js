/*
- Código Mejorado Por WillZek 🗿🍷
- Etiqueta A Los Inactivos En Los Grupos De WhatsApp💫
- https://whatsapp.com/channel/0029Vb1AFK6HbFV9kaB3b13W
*/
let handler = async (m, { conn, text, participants }) => {
  let member = participants.map(u => u.id)
  let sum = !text ? member.length : Number(text) || member.length
  let total = 0
  let sider = []

  for (let i = 0; i < sum; i++) {
    let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
    let isAdmin = users && (users.admin === 'admin' || users.admin === 'superadmin')
    // Verificamos la existencia del usuario en la base de datos y si está marcado como whitelist
    if (
      (typeof global.db.data.users[member[i]] === 'undefined' ||
        global.db.data.users[member[i]].chat === 0) &&
      !isAdmin
    ) {
      if (typeof global.db.data.users[member[i]] !== 'undefined') {
        if (global.db.data.users[member[i]].whitelist == false) {
          total++
          sider.push(member[i])
        }
      } else {
        total++
        sider.push(member[i])
      }
    }
  }

  if (total == 0)
    return conn.reply(
      m.chat,
      `*[⚔️] En Este Grupo No Hay Fantasmas✨🍷*`,
      m
    )

  const stickerUrl = 'https://files.catbox.moe/agx2sc.webp'
  await m.react('💫')
  await conn.sendFile(m.chat, stickerUrl, 'sticker.webp', '', m, null)

  m.reply(
    `[⚠ *FANTASMAS - INACTIVOS* ⚠]\n\n𝙶𝚁𝚄𝙿𝙾: ${await conn.getName(
      m.chat
    )} & 𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂: \n${sum}\n\n[ ⇲ 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂 ⇱ ]\n${sider
      .map(v => '  👻 @' + v.replace(/@.+/, ''))
      .join('\n')}\n\n𝙽𝙾𝚃𝙰: 𝙴𝚂𝚃𝙾 𝙽𝙾 𝙿𝚄𝙴𝙳𝙴 𝚂𝙴𝚁 𝟷𝟶𝟶% 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾, 𝙴𝙻 𝙱𝙾𝚃 𝙸𝙽𝙸𝙲𝙸𝙰 𝙴𝙻 𝙲𝙾𝙽𝚃𝙴𝙾 𝙳𝙴 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂 𝙳𝙴𝚂𝙳𝙴 𝙻𝙰 𝙰𝙲𝚃𝙸𝚅𝙰𝙲𝙸Ó𝙽 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾`,
    null,
    { mentions: sider }
  )
}

handler.help = ['fantasmas']
handler.tags = ['grupo']
handler.command = /^(verfantasmas|fantasmas|sider)$/i
handler.admin = true
handler.botAdmin = true
// handler.register = true   <--- ELIMINADA O COMENTADA

export default handler