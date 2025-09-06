// plugins/sticker-comandos.js

let handler = async (m, { conn, command, args }) => {
  let user = m.sender

  // Validar que sea un sticker
  if (!m.message?.stickerMessage) 
    return m.reply('⚠️ Envía el sticker junto con el comando.\n\nEjemplo:\n`.addco menu` (respondiendo al sticker)')

  // Validar que se haya pasado un comando
  if (!args[0]) 
    return m.reply('⚠️ Debes indicar el comando que quieres asignar.\n\nEjemplo:\n`.addco menu`')

  let cmd = args[0].toLowerCase()
  let hash = m.message.stickerMessage.fileSha256.toString('hex')

  // Crear estructura si no existe
  global.db.data.stickerCmds = global.db.data.stickerCmds || {}

  // Guardar en la base de datos
  global.db.data.stickerCmds[hash] = cmd

  m.reply(`✅ El sticker fue guardado como comando: *${cmd}*`)
}

handler.command = /^addco$/i
handler.group = true
handler.tags = ['sticker']
handler.help = ['addco <comando> (respondiendo al sticker)']

export default handler