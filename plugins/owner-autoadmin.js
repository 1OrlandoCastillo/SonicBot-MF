const handler = async (m, { conn, isAdmin, groupMetadata }) => {
  if (isAdmin) return await m.reply('🚩 *¡YA ERES ADM JEFE!*');
  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
    await m.react('✅');
    await m.reply('🚩 *¡YA TE DI ADM MI JEFE!*');
    let nn = await conn.getName(m.sender);
    await conn.reply(
      '543876577197@s.whatsapp.net',
      `🚩 *${nn}* se dio Auto Admin en:\n> ${groupMetadata.subject}.`,
      m
    );
  } catch (e) {
    await m.reply('🚩 Ocurrió un error.');
    console.error(e);
  }
};
handler.tags = ['owner'];
handler.help = ['autoadmin'];
handler.command = ['autoadmin'];
handler.mods = true;
handler.group = true;
handler.botAdmin = true;
export default handler;