var handler = async (m, { conn, text, usedPrefix, command, isAdmin }) => {
    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    if (!isAdmin)
        return conn.reply(m.chat, '🚫 Este comando solo puede ser usado por *administradores*.', m);

    // Verificar si el bot es admin manualmente
    let bot = conn.user.jid;
    let botAdmin = false;

    if (m.isGroup) {
        let groupMetadata = await conn.groupMetadata(m.chat);
        let groupAdmins = groupMetadata.participants.filter(p => p.admin);
        botAdmin = groupAdmins.some(p => p.id === bot);
    }

    if (!botAdmin) {
        return conn.reply(m.chat, '❌ Necesito ser administrador para mencionar a todos.', m);
    }

    let participants = (await conn.groupMetadata(m.chat)).participants.map(p => p.id);
    participants = participants.filter(jid => !conn.user.jid.includes(jid) && !jid.endsWith('@g.us'));

    const chunk = (arr, size) => {
        let result = [];
        for (let i = 0; i < arr.length; i += size)
            result.push(arr.slice(i, i + size));
        return result;
    }

    const batches = chunk(participants, 50);

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
