// plugins/sticker-comandos.js

let handler = async (m, { conn, args }) => {
  // Buscar sticker ya sea en el mensaje o en la respuesta
  let q = m.quoted ? m.quoted : m
  let sticker = q.message?.stickerMessage

  if (!sticker) 
    return m.reply('⚠️ Responde o envía un sticker con el comando.\n\nEjemplo:\n`.addco menu`')

  if (!args[0]) 
    return m.reply('⚠️ Debes indicar el comando que quieres asignar.\n\nEjemplo:\n`.addco menu`')

  let cmd = args[0].toLowerCase()
  let hash = sticker.fileSha256.toString('hex')

  global.db.data.stickerCmds = global.db.data.stickerCmds || {}
  global.db.data.stickerCmds[hash] = cmd

  m.reply(`✅ El sticker fue guardado como comando: *${cmd}*`)
}

handler.tags = ['sticker']
handler.command = ['addco']   // 🔥 AQUÍ ESTÁ EL FIX
handler.group = true
handler.help = ['addco <comando> (responde o envía un sticker)']

export default handler