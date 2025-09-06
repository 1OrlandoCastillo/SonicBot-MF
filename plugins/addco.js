// plugins/sticker-addco.js

let handler = async (m, { args }) => {
  // Toma el sticker ya sea del mensaje citado o del propio mensaje
  const q = m.quoted || m
  const sticker = q?.message?.stickerMessage || m.message?.stickerMessage

  if (!sticker || !sticker.fileSha256) {
    return m.reply('⚠️ Responde al *sticker* con:\n\n`.addco <comando>`')
  }

  if (!args[0]) {
    return m.reply('⚠️ Debes indicar el comando.\n\nEjemplo:\n`.addco menu`')
  }

  const hash = Buffer.from(sticker.fileSha256).toString('hex')
  const cmd  = args[0].toLowerCase()

  global.db.data.stickerCmds = global.db.data.stickerCmds || {}
  global.db.data.stickerCmds[hash] = cmd

  return m.reply(`✅ Sticker registrado como comando: *${cmd}*`)
}

handler.help = ['addco <comando> (respondiendo al sticker)']
handler.tags = ['sticker']
handler.command = ['addco']   // <- clave: usa array de strings, no RegExp
handler.group = true

export default handler