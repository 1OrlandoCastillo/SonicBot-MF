const emoji = '❤️';
const emoji2 = '💔';

var handler = async (m, { conn, command, text }) => {
  try {
    // Validar que se haya ingresado texto
    if (!text || text.trim().length === 0) {
      return conn.reply(m.chat, `${emoji} Escribe tu nombre y el nombre de la otra persona para calcular su amor.`, m);
    }

    // Separar texto en dos partes (nombre1 y nombre2)
    let [text1, ...text2] = text.trim().split(' ');

    text2 = text2.join(' ').trim();

    // Validar que el segundo nombre exista
    if (!text2) {
      return conn.reply(m.chat, `${emoji2} Escribe el nombre de la segunda persona.`, m);
    }

    // Calcular porcentaje de amor aleatorio entre 1 y 100 (no 0%)
    const lovePercent = Math.floor(Math.random() * 100) + 1;

    // Construir mensaje de resultado
    let love = `❤️ *${text1}* tu oportunidad de enamorarte de *${text2}* es de ${lovePercent}% 👩🏻‍❤️‍👨🏻`;

    // Obtener menciones detectadas en el texto para etiquetar usuarios (si la función existe)
    let mentions = [];
    if (typeof conn.parseMention === 'function') {
      mentions = conn.parseMention(love);
    }

    // Enviar respuesta con menciones si las hay
    await m.reply(love, null, { mentions });

  } catch (error) {
    console.error('Error en handler ship/love:', error);
    conn.reply(m.chat, '❌ Ocurrió un error inesperado, intenta de nuevo.', m);
  }
};

handler.help = ['ship', 'love'];
handler.tags = ['fun'];
handler.command = ['ship', 'pareja'];
handler.group = true;
handler.register = true;

export default handler;