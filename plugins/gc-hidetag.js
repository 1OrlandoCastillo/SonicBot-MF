var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    let chat = await conn.groupMetadata(m.chat);
    let participants = chat.participants.map(p => p.id);
    participants = participants.filter(jid => jid !== conn.user.jid && !jid.endsWith('@g.us'));

    const chunk = (arr, size) => {
        let result = [];
        for (let i = 0; i < arr.length; i += size)
            result.push(arr.slice(i, i + size));
        return result;
    }
    const batches = chunk(participants, 50);

    if (!text && m.quoted) {
        // Obtenemos el mensaje citado
        let quotedMsg = m.quoted.fakeObj || m.quoted;

        for (let batch of batches) {
            await conn.copyNForward(m.chat, quotedMsg, true, {
                quoted: m,
                mentions: batch
            });
        }
        return;
    }

    if (!text)
        return conn.reply(m.chat, `⚠️ Usa el comando así:\n${usedPrefix}${command} <mensaje>`, m);

    for (let batch of batches) {
        await conn.sendMessage(m.chat, { text, mentions: batch }, { quoted: m });
    }
}

handler.help = ['hidetag <mensaje>'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;

export default handler;
