var handler = async (m, { conn, text, usedPrefix, command, isAdmin }) => {
  if (!m.isGroup) 
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);

  if (!isAdmin) 
    return conn.reply(m.chat, '🚫 Solo administradores pueden usar este comando.', m);

  const metadata = await conn.groupMetadata(m.chat);
  const participants = metadata.participants;

  // Detectar si el bot es admin sin depender de JIDs exactos
  const botMaybeAdmin = participants.some(p => p.admin && p.id.includes(conn.user.id.split('@')[0]));

  if (!botMaybeAdmin) {
    return conn.reply(m.chat, '❌ Necesito ser administrador para mencionar a todos.', m);
  }

  // Crear lista de menciones, excluyendo al bot mismo
  const mentionList = participants
    .map(p => p.id)
    .filter(id => !id.includes(conn.user.id.split('@')[0]) && !id.endsWith('@g.us'));

  const chunk = (arr, size) => {
    let res = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  };
  const batches = chunk(mentionList, 50);

  if (m.quoted) {
    for (const batch of batches) {
      await conn.copyNForward(m.chat, m.quoted.fakeObj, true, {
        quoted: m,
        mentions: batch
      });
    }
  } else if (text) {
    for (const batch of batches) {
      await conn.sendMessage(m.chat, { text, mentions: batch }, { quoted: m });
    }
  } else {
    return conn.reply(m.chat, `⚠️ Usa el comando así:\n- Responde a un mensaje (texto o multimedia)\n- O escribe: ${usedPrefix}${command} <mensaje>`, m);
  }
}

handler.help = ['hidetag','tagall','n'];
handler.tags = ['group'];
handler.command = ['hidetag','tagall','n'];
handler.group = true;
handler.admin = true;

export default handler;
