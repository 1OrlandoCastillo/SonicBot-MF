let handler = async (m, { conn }) => {
  let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;White444;;\nFN:White444\nWhite444\nTEL;waid=5212731590195:5212731590195\nEND:VCARD`
  await conn.sendMessage(m.chat, { contacts: { displayName: 'White444', contacts: [{ vcard }] }}, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño']
export default handler