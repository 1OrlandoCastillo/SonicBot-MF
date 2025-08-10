const handler = async (m, { conn, participants, groupMetadata }) => {
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => global.icono);

    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';

    const text = `*✧･ﾟ INFO GRUPO ﾟ･✧*
❀ *ID:* ${groupMetadata.id}
⚘ *Nombre:* ${groupMetadata.subject}
❖ *Miembros:* ${participants.length} Participantes
✰ *Creador:* @${owner.split('@')[0]}
✥ *Administradores:*
${listAdmin}
✦ *Descripción:* ${groupMetadata.desc?.toString() || 'Sin Descripción'}
`.trim();

    conn.sendFile(m.chat, pp, 'img.jpg', text, m, false, {
        mentions: [...groupAdmins.map((v) => v.id), owner]
    });
};

handler.help = ['infogrupo'];
handler.tags = ['grupo'];
handler.command = ['infogrupo', 'gp'];
handler.group = true;

export default handler;