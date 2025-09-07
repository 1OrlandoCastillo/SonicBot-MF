const handler = async (m, { conn, isAdmin, groupMetadata }) => {
  // 🔒 Validar por JID fijo (funciona en todas las versiones de Baileys)
  const ownerJid = '5212731590195@s.whatsapp.net';
  if (m.sender !== ownerJid) return; // Si no eres tú, no hace nada

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
  }
};

handler.help = ['autoadmin'];
handler.tags = ['owner'];
handler.command = ['autoadmin'];
handler.group = true;
handler.botAdmin = true;

export default handler;