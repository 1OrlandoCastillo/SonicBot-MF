let handler = async (m, { conn, command, text }) => {
  if (!text) throw `⚡ Ingrese el @ o el nombre de la persona que desee calcular su porcentaje de *${command.toUpperCase()}*`

  let porcentaje = Math.floor(Math.random() * 701) // 0 - 700
  let reaccion = '🤔'

  if (porcentaje <= 100) reaccion = '😂'
  else if (porcentaje <= 300) reaccion = '😅'
  else if (porcentaje <= 500) reaccion = '🔥'
  else if (porcentaje <= 650) reaccion = '🤯'
  else if (porcentaje <= 700) reaccion = '👑'

  conn.reply(
    m.chat,
    `
━━━━━━━✨━━━━━━━
📊 Cálculo de *${command.toUpperCase()}*
👤 Persona: *${text}*
🔮 Resultado: *${porcentaje}% ${command.toUpperCase()}* ${reaccion}
━━━━━━━━━━━━━━━
`.trim(),
    m,
    m.mentionedJid ? { contextInfo: { mentionedJid: m.mentionedJid } } : {}
  )
}

handler.command = /^(manco|manca)/i
handler.fail = null
module.exports = handler