let handler = async (m, { conn, command, usedPrefix }) => {
  let staff = `
🚩 *EQUIPO DE AYUDANTES* 🤖
*Bot:* ${global.namebot}
🪐 *Versión:* ${global.vs}

• 🎩 *Propietario del bot:* 
  💛 *Número:* Wa.me/2731590195

• 🍭 *Rol:* Developer 
  💛 *Numero:* +505 5786 5603

• 🎩 *Rol:* Developer 
  💛 *Número:* +1234567890

• 🍭 *Rol:* Mod 
  💛 *Número:* +9876543210

• 🍭 *Rol:* Mod 
  💛 *Numero:* +1112223333
`;

  await conn.sendMessage(m.chat, {
    text: staff.trim(),
    contextInfo: {
      forwardingScore: 200,
      isForwarded: false,
      externalAdReply: {
        showAdAttribution: true,
        renderLargerThumbnail: false,
        title: '🎩 STAFF OFICIAL 🌟',
        body: global.namebot,
        mediaType: 1,
      },
    },
    mentions: [m.sender],
  });

  m.react('💎');
};

handler.help = ['staff'];
handler.command = ['colaboradores', 'staff'];
handler.tags = ['main', 'crow'];

export default handler;