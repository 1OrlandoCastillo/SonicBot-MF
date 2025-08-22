const handler = async (m, { conn, command, text }) => {
  // Obtener el usuario mencionado o al remitente
  let userId;
  let displayName;

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    userId = m.mentionedJid[0]; // ID real del usuario
    displayName = conn.getName(userId); // Nombre visible
  } else {
    userId = m.sender;
    displayName = conn.getName(m.sender);
  }

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

    case 'lesbiana':
      emoji = '🏳️‍🌈';
      if (percentages < 50) description = `👻 ${displayName} es *${percentages}%* Lesbiana ${emoji}\n✰ Quizás más películas románticas.`;
      else if (percentages > 100) description = `❣️ ${displayName} es *${percentages}%* Lesbiana ${emoji}\n> ✰ ¡Amor extremo!`;
      else description = `💗 ${displayName} es *${percentages}%* Lesbiana ${emoji}\n> ✰ Mantén el amor floreciendo!`;
      break;

    case 'pajero':
    case 'pajera':
      emoji = '😏💦';
      if (percentages < 50) description = `🧡 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Tal vez más hobbies!`;
      else if (percentages > 100) description = `💕 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Resistencia admirable!`;
      else description = `💞 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Buen trabajo en solitario.`;
      break;

    case 'puto':
    case 'puta':
      emoji = '🔥🥵';
      if (percentages < 50) description = `😼 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✧ ¡Más suerte!`;
      else if (percentages > 100) description = `😻 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ ¡Estás en llamas!`;
      else description = `😺 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Encanto ardiente!`;
      break;

    case 'manco':
    case 'manca':
      emoji = '💩';
      if (percentages < 50) description = `🌟 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ ¡No eres el único!`;
      else if (percentages > 100) description = `💌 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ ¡Talento especial!`;
      else description = `🥷 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Mantén esa actitud valiente!`;
      break;

    case 'rata':
      emoji = '🐁';
      if (percentages < 50) description = `💥 ${displayName} es *${percentages}%* Rata ${emoji}\n> ✰ Nada de malo en disfrutar del queso!`;
      else if (percentages > 100) description = `💖 ${displayName} es *${percentages}%* Rata ${emoji}\n> ✰ Un auténtico ratón de lujo!`;
      else description = `👑 ${displayName} es *${percentages}%* Rata ${emoji}\n> ✰ Come queso con responsabilidad!`;
      break;

    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) description = `❀ ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ El mercado está en auge!`;
      else if (percentages > 100) description = `💖 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Profesional!`;
      else description = `✨️ ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Hora de negocios!`;
      break;

    default:
      return conn.reply(m.chat, `☁️ Comando inválido.`, m);
  }

  const responses = ["El universo ha hablado.", "Los científicos lo confirman.", "¡Sorpresa!"];
  const response = responses[Math.floor(Math.random() * responses.length)];
  const cal = `💫 *CALCULADORA*\n\n${description}\n\n➤ ${response}`.trim();

  async function loading() {
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

    // Mensaje final con mención usando el número real
    await conn.sendMessage(m.chat, {
      text: cal,
      mentions: [userId] // Etiqueta con el número real de WhatsApp
    });
  }

  loading();
};

handler.help = [
  'gay <@usuario>', 'lesbiana <@usuario>', 'pajero <@usuario>', 'pajera <@usuario>',
  'puto <@usuario>', 'puta <@usuario>', 'manco <@usuario>', 'manca <@usuario>',
  'rata <@usuario>', 'prostituta <@usuario>', 'prostituto <@usuario>'
];
handler.tags = ['fun'];
handler.group = true;
handler.command = [
  'gay','lesbiana','pajero','pajera','puto','puta','manco','manca','rata','prostituta','prostituto'
];

export default handler;