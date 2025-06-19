import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, text, participants }) => {
  try {
    const decodeJid = conn.decodeJid ? conn.decodeJid : (jid => jid); // fallback si no existe
    const users = participants.map(u => decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const quotedMsg = m.quoted && m.getQuotedObj ? await m.getQuotedObj() : m.msg || m.text || m.sender;
    const mtype = m.quoted ? quoted.mtype : 'extendedTextMessage';
    const cMod = conn.cMod ? conn.cMod : (_chat, msg, _text, _sender, opts) => msg; // fallback si no existe
    const userId = conn.user.id || conn.user.jid;
    const msg = cMod(
      m.chat,
      generateWAMessageFromContent(
        m.chat,
        {
          [mtype]: m.quoted ? quotedMsg.message[quoted.mtype] : { text: text || '' }
        },
        { quoted: m, userJid: userId }
      ),
      text || quoted.text,
      userId,
      { mentions: users }
    );
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (e) {
    console.error('Error en el envío principal:', e);
    const decodeJid = conn.decodeJid ? conn.decodeJid : (jid => jid);
    const users = participants.map(u => decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted)?.mimetype || '';
    const isMedia = /image|video|sticker|audio/.test(mime);
    const htextos = text || '*Hola soy SonicBot 😸*';
    const invisible = String.fromCharCode(8206).repeat(850);
    try {
      if (isMedia && quoted.download) {
        const media = await quoted.download();
        if (quoted.mtype === 'imageMessage') {
          await conn.sendMessage(m.chat, { image: media, caption: htextos, mentions: users }, { quoted: m });
        } else if (quoted.mtype === 'videoMessage') {
          await conn.sendMessage(m.chat, { video: media, caption: htextos, mentions: users }, { quoted: m });
        } else if (quoted.mtype === 'audioMessage') {
          await conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mpeg', fileName: 'Hidetag.mp3', mentions: users }, { quoted: m });
        } else if (quoted.mtype === 'stickerMessage') {
          await conn.sendMessage(m.chat, { sticker: media, mentions: users }, { quoted: m });
        }
      } else {
        await conn.relayMessage(
          m.chat,
          {
            extendedTextMessage: {
              text: `${invisible}\n${htextos}\n`,
              contextInfo: {
                mentionedJid: users,
                externalAdReply: {
                  title: 'SonicBot',
                  body: 'Notificación de grupo',
                  sourceUrl: 'https://whatsapp.com/channel/0029Vb1AFK6HbFV9kaB3b13W'
                }
              }
            }
          },
          {}
        );
      }
    } catch (err) {
      console.error('Error al reenviar con fallback:', err);
    }
  }
};

handler.command = /^(hidetag|notify|notificar|noti|n|hidetah|hidet)$/i;
handler.group = true;
handler.admin = true;

export default handler;