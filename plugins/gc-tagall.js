const handler = async (m, { conn, args, participants }) => {
  const message = args.join` `;

  const mentionText = `*! MENCION GENERAL !*\n*PARA ${participants.length} MIEMBROS* 🗣️\n\n*Mensaje:* ${message}\n\n`;

  let text = mentionText;
  for (const participant of participants) {
    text += `@${participant.id.split('@')[0]}\n`;
  }

  conn.sendMessage(m.chat, {
    text,
    mentions: participants.map((a) => a.id),
  });
};

handler.help = ['todos *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.group = true;

export default handler;