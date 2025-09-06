// plugins/sticker-addco.js

let handler = async (m, { conn, args }) => {
  // Si responde a un mensaje, lo tomamos
  let q = m.quoted ? m.quoted : m
  let stickerMessage = q?.message?.stickerMessage || (q.msg && q.msg.mimetype === 'image/webp' ? q.msg : null)

  if (!stickerMessage || !stickerMessage.fileSha256) {
    return m.reply('⚠️ Responde a un sticker con:\n\n`.addco <comando>`')
  }

  if (!args[0]) {
    return m.reply('⚠️ Debes indicar el comando.\n\nEjemplo:\n`.addco menu`')
  }

  let hash = Buffer.from(stickerMessage.fileSha256).toString('hex')
  let cmd = args[0].toLowerCase()

  global.db.data.stickerCmds = global.db.data.stickerCmds || {}
  global.db.data.stickerCmds[hash] = cmd

  m.reply(`✅ Sticker registrado como comando: *${cmd}*`)
}

handler.help = ['addco <comando> (responde a un sticker)']
handler.tags = ['sticker']
handler.command = /^addco$/i
handler.group = true

export default handler