const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('Este comando solo se puede utilizar en grupos');

  const participants = await conn.groupParticipants(m.chat);
  const mentions = participants.map((participant) => participant.id);

  const tagallMessage = `
╔═══❖『 *MENCIÓN A TODOS* 』❖═══╗
║
║ 👥 *Total de miembros:* ${participants.length}
║ 📝 *Mensaje:* ${m.text.replace(/tagall/i, '').trim()}
║
╚═══❖『 @${m.sender.split('@')[0]} 』❖═══╝
`;

  await conn.sendMessage(m.chat, {
    text: tagallMessage,
    mentions,
  });
};

handler.help = ['tagall'];
handler.tags = ['group'];
handler.command = /^(tagall)$/i;

export default handler;