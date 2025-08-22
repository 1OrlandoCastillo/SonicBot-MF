let handler = async (m, { conn, command, text }) => {
  if (!text) 
    return conn.reply(
      m.chat,
      `⚡ Ingresa el @ o el nombre de la persona para calcular su porcentaje de *${command.toUpperCase()}*`,
      m
    )

  // Genera un porcentaje entre 0 y 700
  let porcentaje = Math.floor(Math.random() * 701)
  
  // Asigna un emoji según el porcentaje
  let reaccion = '🤔'
  if (porcentaje <= 100) reaccion = '😂'
  else if (porcentaje <= 300) reaccion = '😅'
  else if (porcentaje <= 500) reaccion = '🔥'
  else if (porcentaje <= 650) reaccion = '🤯'
  else if (porcentaje <= 700) reaccion = '👑'

  // Construye el mensaje
  let msg = `
━━━━━━━✨━━━━━━━
📊 Cálculo de *${command.toUpperCase()}*
👤 Persona: *${text}*
🔮 Resultado: *${porcentaje}% ${command.toUpperCase()}* ${reaccion}
━━━━━━━━━━━━━━━
`.trim()

  // Envía el mensaje, mencionando solo si hay menciones válidas
  const context = Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0 
    ? { contextInfo: { mentionedJid: m.mentionedJid } } 
    : {}

  await conn.reply(m.chat, msg, m, context)
}

// Comandos que activan esta función
handler.command = /^(manco|manca)$/i

export default handler