var handler = async (m, { conn, text, usedPrefix, command, isAdmin }) => {
    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    if (!isAdmin)
        return conn.reply(m.chat, '🚫 Este comando solo puede ser usado por *administradores*.', m);

    // Obtener metadata del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants;

    // Obtener JID del bot y del remitente
    const botNumber = conn.decodeJid(conn.user.id); // ✅ este es el fix
    const botParticipant = participants.find(p => p.id === botNumber);

    // Verificar si el bot es admin
    if (!botParticipant?.admin) {
        return conn.reply(m.chat, '❌ Necesito ser administrador para mencionar a todos.', m);
    }

    // Obtener todos los miembros excepto el bot
    const mentionList = participants
        .map(p => p.id)
        .filter(id => id !== botNumber && !id.endsWith('@g.us'));

    // Dividir en lotes de 50
    const chunk = (arr, size) => {
        let result = [];
        for (let i = 0; i < arr.length; i += size)
            result.push(arr.slice(i, i + size));
        return result;
    }

    const batches = chunk(mentionList, 50);

    if (m.quoted) {
        for (let batch of batches) {
            await conn.copyNForward(m.chat, m.quoted.fakeObj, true, {
                quoted: m,
                mentions: batch
            });
        }
    } else if (text) {
        for (let batch of batches) {
            await conn.sendMessage(
                m.chat,
                {
                    text,
                    mentions: batch
                },
                { quoted: m }
            );
        }
    } else {
        return conn.reply(m.chat, `⚠️ Usa el comando así:\n- Responde a un mensaje (de texto o multimedia)\n- O escribe: ${usedPrefix}${command} <mensaje>`, m);
    }
}

handler.help = ['hidetag', 'tagall', 'n'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;
handler.admin = true;

export default handler;
