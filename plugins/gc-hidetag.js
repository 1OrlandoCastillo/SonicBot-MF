var handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup)
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

  // Obtener participantes del grupo
  const metadata = await conn.groupMetadata(m.chat);
  const participants = metadata.participants.map(p => p.id);

  // Excluir al bot mismo y grupos
  const mentionList = participants.filter(id => id !== conn.user.jid && !id.endsWith('@g.us'));

  // Función para partir arrays en chunks de 50 (limite para mentions)
  const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const batches = chunk(mentionList, 50);

  if (m.quoted) {
    // Si respondes a un mensaje, reenviar ese mensaje mencionando a todos
    for (const batch of batches) {
      await conn.copyNForward(m.chat, m.quoted, true, { mentions: batch, quoted: m });
    }
  } else if (text) {
    // Si no respondes, pero hay texto, enviar texto mencionando a todos
    for (const batch of batches) {
      await conn.sendMessage(m.chat, { text, mentions: batch }, { quoted: m });
    }
  } else {
    // No texto ni mensaje respondido
    return conn.reply(m.chat, `⚠️ Usa el comando así:\n${usedPrefix}${command} <mensaje>`, m);
  }
};

handler.help = ['hidetag <mensaje>'];
handler.tags = ['group'];
handler.command = ['hidetag', 'tagall', 'n'];
handler.group = true;

export default handler;
