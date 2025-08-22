let toM = a => '@' + a.split('@')[0]; // Genera la mención visible

const handler = async (m, { conn, command, text, groupMetadata }) => {
  let userId;

  // Si hay menciones, tomar la primera; si no, usar el remitente
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    userId = m.mentionedJid[0];
  } else {
    userId = m.sender;
  }

  const displayName = toM(userId); // @usuario
  const percentages = Math.floor(Math.random() * 501); // 0 - 500
  let emoji = '';
  let description = '';

  switch (command) {
    case 'gay':
      emoji = '🏳️‍🌈';
      if (percentages < 50) description = `💙 ${displayName} es *${percentages}%* Gay ${emoji}\n> ✰ Eso es bajo.`;
      else if (percentages > 100) description = `💜 ${displayName} es *${percentages}%* Gay ${emoji}\n> ✰ ¡Más gay de lo esperado!`;
      else description = `🖤 ${displayName} es *${percentages}%* Gay ${emoji}\n> ✰ Eres Gay.`;
      break;

    case 'prostituta':
    case 'prostituto':
      emoji = '🫦👅';
      if (percentages < 50) description = `❀ ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ El mercado está en auge!`;
      else if (percentages > 100) description = `💖 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Profesional!`;
      else description = `✨️ ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Hora de negocios!`;
      break;

    // Agrega aquí los demás comandos siguiendo el mismo patrón
    default:
      return conn.reply(m.chat, `☁️ Comando inválido.`, m);
  }

  const responses = ["El universo ha hablado.", "Los científicos lo confirman.", "¡Sorpresa!"];
  const response = responses[Math.floor(Math.random() * responses.length)];

  const cal = `💫 *CALCULADORA*\n\n${description}\n\n➤ ${response}`.trim();

  // Animación de carga
  const hawemod = [
    "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
    "《 ████▒▒▒▒▒▒▒▒》30%",
    "《 ███████▒▒▒▒▒》50%",
    "《 ██████████▒▒》80%",
    "《 ████████████》100%"
  ];

  const key = await conn.sendMessage(m.chat, { text: `[🌠] ¡Calculando Porcentaje!` });

  for (let i = 0; i < hawemod.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await conn.sendMessage(m.chat, { text: hawemod[i], edit: key });
  }

  // Mensaje final con mención usando mentions
  await conn.sendMessage(m.chat, {
    text: cal,
    mentions: [userId]
  });
};

handler.help = ['gay', 'prostituta', 'prostituto'];
handler.tags = ['fun'];
handler.group = true;
handler.command = ['gay', 'prostituta', 'prostituto'];

export default handler;