const emoji = '❤️';
const emoji2 = '💔';

var handler = async (m, { conn, command, text }) => {
  try {
    if (!text || text.trim().length === 0) {
      return conn.reply(m.chat, `${emoji} Escribe tu nombre y el nombre de la otra persona para calcular su amor.`, m);
    }

    let [text1, ...text2] = text.trim().split(' ');
    text2 = text2.join(' ').trim();

    if (!text2) {
      return conn.reply(m.chat, `${emoji2} Escribe el nombre de la segunda persona.`, m);
    }

    const lovePercent = Math.floor(Math.random() * 100) + 1;

    // Barra de progreso con 20 bloques
    const totalBlocks = 20;
    const filledBlocks = Math.round((lovePercent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;

    // Construir barra con bloques llenos (🟩) y vacíos (⬜)
    const progressBar = '🟩'.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks);

    // Corazones que reflejan progreso (cada corazón equivale a 20%)
    const heartsCount = Math.floor(lovePercent / 20);
    const hearts = '❤️'.repeat(heartsCount) + '🤍'.repeat(5 - heartsCount);

    const love = 
`💖 *${text1}* tu oportunidad de enamorarte de *${text2}* es de *${lovePercent}%* 👩🏻‍❤️‍👨🏻

${progressBar}  ${lovePercent}%

${hearts}`;

    let mentions = [];
    if (typeof conn.parseMention === 'function') {
      mentions = conn.parseMention(love);
    }

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

export default handler;