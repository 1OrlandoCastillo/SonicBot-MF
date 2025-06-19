try {
  const decodeJid = conn.decodeJid || (jid => jid);
  const users = participants?.map(u => decodeJid(u.id)) || [];
  const quoted = m.quoted ? m.quoted : m;
  const mime = (quoted.msg || quoted)?.mimetype || '';
  const isMedia = /image|video|sticker|audio/.test(mime);
  const htextos = text || '*Hola soy SonicBot 😸*';
  const invisible = String.fromCharCode(8206).repeat(850);

  const msg = cMod(
    m.chat,
    generateWAMessageFromContent(
      m.chat,
      { [mtype]: messageContent },
      { quoted: m, userJid: userId }
    ),
    text || quoted.text || '',
    userId,
    { mentions: users }
  );

  // OBTENER messageId CORRECTO
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key && msg.key.id ? msg.key.id : undefined });

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