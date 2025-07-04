const handler = async (m, { conn, args, participants, isAdmin }) => {
  if (!isAdmin) {
    return conn.sendMessage(m.chat, { text: '*Solo los administradores pueden usar este comando.*' }, { quoted: m });
  }

  const message = args.join(' ') || '';
  const mentionText = `*! MENCION GENERAL !*\n*PARA ${participants.length} MIEMBROS* 🗣️\n\n*Mensaje:* ${message}\n\n`;
  const mentions = participants.map((a) => a.id);
  const text = `${mentionText}${mentions.map((id) => `@${id.split('@')[0]}`).join('\n')}`;

  return conn.sendMessage(m.chat, { text, mentions });
};

handler.help = ['todos *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.group = true;

export default handler;