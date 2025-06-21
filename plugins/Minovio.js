import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender];
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://qu.ax/qhKfn.jpg');
  let name = conn.getName(who);

  let str = `𝙀𝙎𝙏𝙀 𝙀𝙎 𝙈𝙄 𝙉𝙊𝙑𝙄𝙊, *¿* 𝙀𝙎 𝙃𝙀𝙍𝙈𝙊𝙎𝙊 𝙑𝙀𝙍𝘿𝘼𝘿 *?* 😍 @${who.replace(/@.+/, '')} 𝙀𝙍𝙀𝙎 𝙀𝙇 𝙈𝙀𝙅𝙊𝙍 𝙉𝙊𝙑𝙄𝙊 𝘿𝙀𝙇 𝙈𝙐𝙉𝘿𝙊.🫶🏻♥️ `.trim();

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

handler.help = ['minovio'];
handler.tags = ['rg'];
handler.command = /^minovio$/i;

export default handler;