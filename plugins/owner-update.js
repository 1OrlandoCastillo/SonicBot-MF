import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  await m.react('🕓')

  // Compatibilidad tanto con array de arrays como de strings
  let ownerList = global.owner || []
  const creatorJIDs = Array.isArray(ownerList[0]) ? ownerList.map(([jid]) => jid) : ownerList
  const botOwnerJID = conn.user?.jid

  // Permite solo a dueño real y creadores
  if (m.sender === botOwnerJID || creatorJIDs.includes(m.sender)) {
    try {
      let command = 'git pull'
      // Validación básica para evitar inyección de comandos
      if (m.fromMe && text && /^[\w\-./]+$/.test(text)) command += ' ' + text
      let stdout = execSync(command)
      await conn.reply(m.chat, stdout.toString(), m)
      await m.react('✅')
    } catch (e) {
      await conn.reply(m.chat, e?.toString() || 'Error al ejecutar git pull', m)
      await m.react('❌')
    }
  } else {
    await conn.reply(m.chat, 'Solo el creador del bot puede usar este comando.', m)
    await m.react('❌')
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']
handler.rowner = true

export default handler