var handler = async (m, { conn, text, usedPrefix, command, participants }) => {
    if (!m.isGroup) 
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    // Obtener metadata del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupAdmins = groupMetadata.participants
        .filter(p => p.admin)
        .map(p => p.id);

    // Verificar si el remitente es admin
    if (!groupAdmins.includes(m.sender)) {
        return conn.reply(m.chat, '🚫 Solo los administradores pueden usar este comando.', m);
    }

    // Obtener lista de participantes, excluyendo al bot
    let mentionList = groupMetadata.participants
        .map(p => p.id)
        .filter(id => id !== conn.user.jid && !id.endsWith('@g.us'));

    // Si respondió a un mensaje
    if (!text && m.quoted) {
        // Si el mensaje citado tiene texto
        text = m.quoted.text || m.quoted.caption || '';

        if (text) {
            await conn.sendMessage(m.chat, { text, mentions: mentionList }, { quoted: m });
            return;
        }

        // Si es multimedia sin texto
        await conn.copyNForward(m.chat, m.quoted, true, {
            quoted: m,
            mentions: mentionList
        });
        return;
    }

    // Si no hay mensaje ni texto, enviar advertencia
    if (!text) {
        return conn.reply(m.chat, `⚠️ Usa el comando así:\n${usedPrefix}${command} <mensaje>\nO responde a un mensaje para mencionarlo a todos.`, m);
    }

    // Si hay texto, enviar mensaje una sola vez mencionando a todos
    await conn.sendMessage(m.chat, { text, mentions: mentionList }, { quoted: m });
};

handler.help = ['hidetag <mensaje>'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;
handler.admin = false; // Se controla manualmente dentro del handler

export default handler;
