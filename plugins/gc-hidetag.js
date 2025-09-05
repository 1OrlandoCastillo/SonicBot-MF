var handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin }) => {
    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    if (!isAdmin)
        return conn.reply(m.chat, '🚫 Este comando solo puede ser usado por *administradores*.', m);

    if (!isBotAdmin)
        return conn.reply(m.chat, '❌ Necesito ser administrador para mencionar a todos.', m);

    let chat = conn.chats[m.chat];
    let participants = chat?.presences ? Object.keys(chat.presences) : chat?.participants?.map(p => p.id) || [];

    // Filtrar el bot y otros grupos
    participants = participants.filter(jid => !conn.user.jid.includes(jid) && !jid.endsWith('@g.us'));

    // Dividir en lotes de 50 usuarios
    const chunk = (arr, size) => {
        let result = [];
        for (let i = 0; i < arr.length; i += size)
            result.push(arr.slice(i, i + size));
        return result;
    }

    const batches = chunk(participants, 50);

    if (m.quoted) {
        // Reenviar el mensaje citado, incluyendo multimedia, y mencionar a todos
        for (let batch of batches) {
            await conn.copyNForward(m.chat, m.quoted.fakeObj, true, {
                quoted: m,
                mentions: batch
            });
        }
    } else if (text) {
        // Enviar mensaje de texto con menciones
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
        // No se respondió a un mensaje ni se escribió texto
        return conn.reply(m.chat, `⚠️ Usa el comando así:\n- Responde a un mensaje (de texto o multimedia)\n- O escribe: ${usedPrefix}${command} <mensaje>`, m);
    }
}

handler.help = ['hidetag', 'tagall', 'n'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;
handler.admin = true; // Solo admins

export default handler;
