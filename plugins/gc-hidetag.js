var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    let chat = conn.chats[m.chat];
    let participants = chat?.presences ? Object.keys(chat.presences) : chat?.participants?.map(p => p.id) || [];

    // Filtra al bot y a otros grupos
    participants = participants.filter(jid => !conn.user.jid.includes(jid) && !jid.endsWith('@g.us'));

    // Función para dividir en lotes de 50
    const chunk = (arr, size) => {
        let result = [];
        for (let i = 0; i < arr.length; i += size)
            result.push(arr.slice(i, i + size));
        return result;
    }

    const batches = chunk(participants, 50);

    if (m.quoted) {
        // Si estás respondiendo a un mensaje, reenvíalo mencionando a todos
        for (let batch of batches) {
            await conn.sendMessage(
                m.chat,
                {
                    forward: m.quoted,
                    mentions: batch
                },
                { quoted: m }
            );
        }
    } else if (text) {
        // Si escribiste un texto, envíalo mencionando a todos
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
        // Si no respondiste a nada y no hay texto
        return conn.reply(m.chat, `⚠️ Usa el comando así:\n- Responde a un mensaje\n- O escribe: ${usedPrefix}${command} <mensaje>`, m);
    }
}

handler.help = ['hidetag', 'tagall', 'n'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;

export default handler;
