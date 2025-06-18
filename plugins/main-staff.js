let handler = async (m, { conn, command, usedPrefix }) => {
let staff = `🚩 *EQUIPO DE AYUDANTES*
🤖 *Bot:* ${global.namebot}
🪐 *Versión:* ${global.vs}

•
🎩 *Propietario del bot:* 
💛 *Número:* Wa.me/2731590195

• 
🍭 *Rol* Developer
💛 *Numero:* +505 5786 5603

• 
🎩 *Rol:* Developer
💛 *Número:*

• 
🍭 *Rol:* Mod
💛 *Número:* 


• 
🍭 *Rol:* Mod
💛 *Numero:*

• 
🎩 *Rol:* Mod
💛 *Número:*

• 
🍭 *Rol:*  Developer
💛 *Número:*

•
🎩 *Rol:* Mod
💛 *Número:*

• 
🍭 *Rol:* Mod
💛 *Numero:*`
await conn.sendFile(
  m.chat,
  'https://raw.githubusercontent.com/WillZek/Storage-CB/main/images/21396e078a24.jpg',
  'brook.jpg',
  staff.trim(),
  true,
  {
    contextInfo: {
      forwardingScore: 200,
      isForwarded: false,
      externalAdReply: {
        showAdAttribution: true,
        renderLargerThumbnail: false,
        title: '🎩 STAFF OFICIAL 🌟',
        body: namebot,
        mediaType: 1,
      },
    },
  },
  {
    mentions: m.sender,
  }
);

m.react(💎);

}
handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.tags = ['main', 'crow']

export default handler