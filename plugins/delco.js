// plugins/sticker-delco.js

function extractSticker(node) {
  let msg = node?.message ?? node
  for (let i = 0; i < 6 && msg; i++) {
    if (msg.stickerMessage) return msg.stickerMessage
    if (msg.ephemeralMessage) { msg = msg.ephemeralMessage.message; continue }
    if (msg.viewOnceMessageV2) { msg = msg.viewOnceMessageV2.message; continue }
    if (msg.viewOnceMessageV2Extension) { msg = msg.viewOnceMessageV2Extension.message; continue }
    if (msg.documentWithCaptionMessage) { msg = msg.documentWithCaptionMessage.message; continue }
    break
  }
  if (node?.mtype === 'stickerMessage' && node?.msg?.fileSha256) return node.msg
  if (node?.msg?.mimetype === 'image/webp' && node?.msg?.fileSha256) return node.msg
  const q = node?.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (q) return extractSticker({ message: q })
  return null
}

let handler = async (m) => {
  const stickerObj = extractSticker(m.quoted || m)
  if (!stickerObj?.fileSha256) {
    return m.reply('⚠️ Responde al *sticker* que quieres eliminar con `.delco`')
  }

  const hash = Buffer.from(stickerObj.fileSha256).toString('hex')
  global.db.data.stickerCmds = global.db.data.stickerCmds || {}

  if (!global.db.data.stickerCmds[hash]) {
    return m.reply('❌ Ese sticker no estaba guardado como comando.')
  }

  const cmd = global.db.data.stickerCmds[hash]
  delete global.db.data.stickerCmds[hash]
  return m.reply(`🗑️ Eliminado. (Antes ejecutaba: *${cmd}*)`)
}

handler.help = ['delco (respondiendo al sticker)']
handler.tags = ['sticker']
handler.command = ['delco']
handler.group = true

export default handler