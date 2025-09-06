// plugins/sticker-addco.js

function extractSticker(node) {
  // Desenvuelve capas hasta encontrar stickerMessage
  let msg = node?.message ?? node
  for (let i = 0; i < 6 && msg; i++) {
    if (msg.stickerMessage) return msg.stickerMessage
    if (msg.ephemeralMessage) { msg = msg.ephemeralMessage.message; continue }
    if (msg.viewOnceMessageV2) { msg = msg.viewOnceMessageV2.message; continue }
    if (msg.viewOnceMessageV2Extension) { msg = msg.viewOnceMessageV2Extension.message; continue }
    if (msg.documentWithCaptionMessage) { msg = msg.documentWithCaptionMessage.message; continue }
    break
  }
  // Rutas normalizadas por smsg
  if (node?.mtype === 'stickerMessage' && node?.msg?.fileSha256) return node.msg
  if (node?.msg?.mimetype === 'image/webp' && node?.msg?.fileSha256) return node.msg
  // Sticker citado dentro del mensaje de texto
  const q = node?.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (q) return extractSticker({ message: q })
  return null
}

let handler = async (m, { args }) => {
  const stickerObj =
    extractSticker(m.quoted) ||  // cuando respondes a un sticker
    extractSticker(m)            // cuando mandas el sticker con el comando

  if (!stickerObj?.fileSha256) {
    return m.reply('⚠️ Responde al *sticker* con:\n`.addco <comando>`')
  }
  if (!args[0]) {
    return m.reply('⚠️ Debes indicar el comando.\nEjemplo: `.addco menu`')
  }

  const hash = Buffer.from(stickerObj.fileSha256).toString('hex')
  const cmd  = args[0].toLowerCase()

  global.db.data.stickerCmds = global.db.data.stickerCmds || {}
  global.db.data.stickerCmds[hash] = cmd

  return m.reply(`✅ Sticker registrado como comando: *${cmd}*`)
}

handler.help = ['addco <comando> (respondiendo al sticker)']
handler.tags = ['sticker']
handler.command = ['addco']
handler.group = true

export default handler