const handler = async (m, { conn, isOwner, groupMetadata }) => {
  if (!isOwner) return; // Solo el owner puede usar este comando

  try {
    const isAdmin = groupMetadata.participants
      .filter(p => p.admin)
      .map(p => p.id)
      .includes(m.sender);

    if (isAdmin) {
      return await m.reply('🚩 *¡YA ERES ADM JEFE!*');
    }

    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
    await m.react('✅');
    await m.reply('🚩 *¡YA TE DI ADM MI JEFE!*');

    let nn = await conn.getName(m.sender);
    await conn.reply(
      '543876577197@s.whatsapp.net', // Aquí pon tu número owner
      `🚩 *${nn}* se dio Auto Admin en:\n> ${groupMetadata.subject}.`,
      m
    );
  } catch (e) {
    await m.reply('🚩 Ocurrió un error.');
    console.error(e);
  }
};

handler.help = ['autoadmin'];
handler.tags = ['owner'];
handler.command = ['autoadmin'];
handler.owner = true; // 🔑 Solo owner
handler.group = true;
handler.botAdmin = true;

export default handler;