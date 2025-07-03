let toM = a => '@' + a.split('@')[0];

function handler(m, { groupMetadata }) {
  // Obtener los participantes del grupo
  let ps = groupMetadata.participants.map(v => v.id);

  // Si hay menos de 2 participantes, avisa y termina
  if (ps.length < 2) {
    return m.reply('El grupo no tiene suficientes participantes para formar una pareja.');
  }

  // Seleccionar un usuario al azar
  let a = ps[Math.floor(Math.random() * ps.length)];
  let b;

  // Asegurarse de que no se seleccione el mismo usuario
  do {
    b = ps[Math.floor(Math.random() * ps.length)];
  } while (b === a);

  // Enviar el mensaje de la pareja seleccionada
  m.reply(`*${toM(a)}, 𝙳𝙴𝙱𝙴𝚁𝙸𝙰𝚂 Hacerte  NV 𝙲𝙾𝙽 ${toM(b)}, 𝙷𝙰𝙲𝙴𝙽 𝚄𝙽𝙰 𝙱𝚄𝙴𝙽𝙰 𝙿𝙰𝚁𝙴𝙹𝙰 💓*`, null, {
    mentions: [a, b]
  });
}

handler.help = ['formarnv'];
handler.tags = ['fun'];
handler.command = ['formarnv'];
handler.group = true;

export default handler;