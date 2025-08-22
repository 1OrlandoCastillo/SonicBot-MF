const handler = async (m, { conn, command, text }) => {
  // Tomar el usuario mencionado o, si no hay, al remitente
  let userId;
  let displayName;

  if (text) {
    // Si mencionan a alguien con @, obtener ID del mensaje
    // Esto depende de cómo tu bot recibe el ID real del usuario mencionado
    // Para WhatsApp, normalmente se envía como m.mentionedJid[0]
    userId = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : m.sender;
    displayName = text.split('@')[1] ? text.split('@')[1] : 'Usuario';
  } else {
    userId = m.sender;
    displayName = conn.getName(m.sender); // Nombre del remitente
  }

  const percentages = Math.floor(Math.random() * 501); // 0 - 500
  let emoji = '';
  let description = '';

  switch (command) {
    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) {
        description = `❀ ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ El mercado está en auge!`;
      } else if (percentages > 100) {
        description = `💖 ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Profesional!`;
      } else {
        description = `✨️ ${displayName} es *${percentages}%* ${command} ${emoji}\n> ✰ Hora de negocios!`;
      }
      break;

    // Aquí agregas los demás casos como gay, lesbiana, etc.
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

    // Mensaje final con mención real
    await conn.sendMessage(m.chat, {
      text: cal,
      mentions: [userId] // Aquí se etiqueta al usuario correctamente
    });
  }

  loading();
};

handler.help = ['prostituta <@usuario>', 'prostituto <@usuario>'];
handler.tags = ['fun'];
handler.group = true;
handler.command = ['prostituta', 'prostituto'];

export default handler;