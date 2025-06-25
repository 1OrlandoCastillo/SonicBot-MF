let handler = async (m, { conn, command, text }) => {
  const emoji = '📢'
  const emoji2 = '👥'

  if (!text) return m.reply(`${emoji} *Por favor, ingresa el motivo de la reunión.*`)
  if (text.length < 10) return m.reply(`${emoji2} *Por favor, ingresa al menos 10 caracteres.*`)

  const texto = `
${emoji2} *REUNIÓN IMPORTANTE*
${emoji} *Owner:* @${m.sender.split`@`[0]}
${emoji2} *Motivo:* ${text}
${emoji} *Por favor, entra lo más pronto posible al grupo de staff.*
`

  m.reply(`${emoji} *Enviando mensaje de reunión a todos los owners...*`)

  let mentions = [m.sender]
  for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
    let data = (await conn.onWhatsApp(jid))[0] || {}
    if (data.exists) {
      await conn.sendMessage(data.jid, { text: texto, mentions })
    }
  }
}

handler.tags = ['owner']
handler.command = handler.help = ['reunion', 'meeting']
handler.rowner = true
export default handler