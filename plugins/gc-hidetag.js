var handler = async (m, { conn, text, usedPrefix, command }) => {
    // Si no hay texto, revisa mensaje citado
    if (!text && m.quoted) {
        text = m.quoted.text || m.quoted.caption;
    }

    if (!m.isGroup) 
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

    if (!text) 
        return conn.reply(m.chat, `⚠️ Usa el comando así:\n${usedPrefix}${command} <mensaje>`, m);

    let chat = conn.chats[m.chat];
    // Obtener participantes presentes o todos
    let participants = chat?.presences ? Object.keys(chat.presences) : chat?.participants?.map(p => p.id) || [];

    // Filtrar al bot y grupos
    participants = participants.filter(jid => !conn.user.jid.includes(jid) && !jid.endsWith('@g.us'));

    // Función para dividir en lotes
    const chunk = (arr, size) => {
        let result = [];
        for (let i = 0; i < arr.length; i += size)
            result.push(arr.slice(i, i + size));
        return result;
    }

    const batches = chunk(participants, 50);

    // Enviar mensajes en lotes con menciones
    for (let batch of batches) {
        await conn.sendMessage(
            m.chat, 
            { text, mentions: batch }, 
            { quoted: m }
        );
    }
}

handler.help = ['hidetag <mensaje>'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;

export default handler;
