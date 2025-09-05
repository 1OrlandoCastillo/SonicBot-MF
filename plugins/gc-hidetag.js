var handler = async (m, { conn, text, usedPrefix, command }) => {
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

    // Caso 1: si solo ponen .n y responden a un mensaje
    if (!text && m.quoted) {
        let q = m.quoted;

        // Si el mensaje citado tiene texto
        let quotedText = q.text || q.caption || '';
        if (quotedText) {
            await conn.sendMessage(m.chat, { text: quotedText, mentions: mentionList }, { quoted: m });
            return;
        }

        // Si es multimedia sin texto
        await conn.copyNForward(m.chat, q, true, {
            quoted: m,
            mentions: mentionList
        });
        return;
    }

    // Caso 2: si escriben .n <mensaje>
    if (text) {
        await conn.sendMessage(m.chat, { text, mentions: mentionList }, { quoted: m });
        return;
    }

    // Si no ponen nada ni responden a un mensaje
    return conn.reply(m.chat, `⚠️ Usa el comando así:\n${usedPrefix}${command} <mensaje>\nO responde a un mensaje para mencionarlo a todos.`, m);
};

handler.help = ['hidetag <mensaje>'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;
handler.admin = false; // Se controla manualmente dentro del handler

export default handler;