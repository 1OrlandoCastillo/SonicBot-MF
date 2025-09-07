// plugins/index/link.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('❌ Este comando solo funciona en grupos.')
  }

  try {
    let inviteCode = await conn.groupInviteCode(m.chat)
    let link = `https://chat.whatsapp.com/${inviteCode}`

    await conn.sendMessage(
      m.chat,
      { text: `🔗 Enlace del grupo:\n${link}` },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply('⚠️ No pude obtener el link del grupo.')
  }
}

handler.help = ['link']
handler.tags = ['group']
handler.command = ['link']   // Se activa con .link
handler.group = true         // Solo en grupos

export default handler