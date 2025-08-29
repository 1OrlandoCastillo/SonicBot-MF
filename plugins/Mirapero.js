import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender];
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/3vivwf.jpg');
  let name = conn.getName(who);

  let str = `🎵 El papá de C-Kan, mi rapero favorito 😎\nEl rey del rap, siempre en la cima 🖤\n*#PPCDSALVC*`.trim();

  let fkon = {
    key: {
      fromMe: false,
      participant: `${m.sender.split('@')[0]}@s.whatsapp.net`,
      ...(m.chat ? { remoteJid: '16504228206@s.whatsapp.net' } : {})
    },
    message: {
      contactMessage: {
        displayName: name,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${name}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    }
  };

  conn.sendFile(m.chat, pp, 'perfil.jpg', str, fkon, false, { mentions: [who] });
};

handler.help = ['mirapero'];
handler.tags = ['rg'];
handler.command = /^mirapero$/i;

export default handler;