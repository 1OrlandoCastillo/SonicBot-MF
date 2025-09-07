// plugins/index/link.js
const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!m.isGroup) {
      return m.reply('❌ Este comando solo funciona en grupos.')
    }

    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupInvite = await conn.groupInviteCode(m.chat)

    const groupLink = `https://chat.whatsapp.com/${groupInvite}`

    await conn.sendMessage(m.chat, { text: `🔗 Enlace del grupo:\n${groupLink}` }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('⚠️ No pude obtener el link del grupo.')
  }
}

handler.help = ['link']
handler.tags = ['group']
handler.command = /^link$/i
handler.group = true

export default handler