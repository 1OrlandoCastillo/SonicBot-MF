let toM = a => '@' + a.split('@')[0];

function handler(m, { groupMetadata }) {
  // Obtener los participantes del grupo
  let ps = groupMetadata.participants.map(v => v.id);

  // Si hay menos de 2 participantes, avisa y termina
  if (ps.length < 2) {
    return m.reply('😏 Ups... se necesitan al menos 2 personas para formar una pareja coqueta 💕');
  }

  // Seleccionar un usuario al azar
  let a = ps[Math.floor(Math.random() * ps.length)];
  let b;

  // Asegurarse de que no se seleccione el mismo usuario
  do {
    b = ps[Math.floor(Math.random() * ps.length)];
  } while (b === a);

  // Enviar el mensaje de la pareja seleccionada
  m.reply(
    `💘 *Pareja traviesa del día:* ${toM(a)} 😏 + ${toM(b)} 💖\n\n🔥 ¡Se ven perfectos juntos! Tal vez sea hora de coquetear un poquito 😜💌\n💫 Que la chispa del amor los acompañe ✨`,
    null,
    { mentions: [a, b] }
  );
}

handler.help = ['formarnv'];
handler.tags = ['fun'];
handler.command = ['formarnv'];
handler.group = true;

export default handler;