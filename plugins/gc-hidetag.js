var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) 
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    let chat = await conn.groupMetadata(m.chat);
    let participants = chat.participants.map(p => p.id);

    // Filtrar para no mencionar al bot mismo ni otros grupos
    participants = participants.filter(jid => jid !== conn.user.jid && !jid.endsWith('@g.us'));

    // Si no hay texto y se respondió a un mensaje, tomar texto o reenviar mensaje citado
    if (!text && m.quoted) {
        // Si es texto, tomamos el texto o caption
        text = m.quoted.text || m.quoted.caption || '';

        // Si hay texto, enviamos mencionando a todos
        if (text) {
            const chunk = (arr, size) => {
                let result = [];
                for (let i = 0; i < arr.length; i += size)
                    result.push(arr.slice(i, i + size));
                return result;
            }

            const batches = chunk(participants, 50);
            for (let batch of batches) {
                await conn.sendMessage(m.chat, { text, mentions: batch }, { quoted: m });
            }
            return;
        }

        // Si no hay texto (es multimedia), reenviamos el mensaje citado con menciones
        const chunk = (arr, size) => {
            let result = [];
            for (let i = 0; i < arr.length; i += size)
                result.push(arr.slice(i, i + size));
            return result;
        }
        const batches = chunk(participants, 50);
        for (let batch of batches) {
            await conn.copyNForward(m.chat, m.quoted.fakeObj, true, { mentions: batch, quoted: m });
        }
        return;
    }

    // Si no se respondió mensaje y no hay texto, pedir uso correcto
    if (!text) 
        return conn.reply(m.chat, `⚠️ Usa el comando así:\n${usedPrefix}${command} <mensaje>`, m);

    // Si hay texto, enviamos texto mencionando a todos
    const chunk = (arr, size) => {
        let result = [];
        for (let i = 0; i < arr.length; i += size)
            result.push(arr.slice(i, i + size));
        return result;
    }

    const batches = chunk(participants, 50);
    for (let batch of batches) {
        await conn.sendMessage(m.chat, { text, mentions: batch }, { quoted: m });
    }
}

handler.help = ['hidetag <mensaje>'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;

export default handler;
