let handler = async (m, { conn, usedPrefix }) => {

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[who]
  
  let txt = `│\n`
  txt += `╰ *ID:* ${who}\n`
  txt += `╰ *Nombre:* ${user?.name || 'Sin registrar'}\n`
  txt += `│`
  
  await conn.sendMessage(m.chat, {
    text: txt,
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
}

handler.help = ['id']
handler.tags = ['info']
handler.command = ['id', 'getid', 'detid']

export default handler