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

    const totalBlocks = 20;
    const filledBlocks = Math.round((lovePercent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;

    const barFilled = '█'.repeat(filledBlocks);
    const barEmpty = '░'.repeat(emptyBlocks);
    const progressBar = `${barFilled}${barEmpty}`;

    let heartsCount = Math.floor(lovePercent / 20);
    let hearts = '';
    for (let i = 0; i < 5; i++) {
      if (i < heartsCount) {
        if (i < 2) hearts += '❤️';       // rojo intenso
        else if (i < 4) hearts += '🧡';  // naranja
        else hearts += '💛';             // amarillo
      } else {
        hearts += '🤍';                  // corazón blanco
      }
    }

    const love = `
💞 *Ship Love Calculator* 💞

*${text1}* ❤️ *${text2}*

${progressBar}  ${lovePercent}%

${hearts}
`;

    let mentions = [];
    if (typeof conn.parseMention === 'function') {
      mentions = conn.parseMention(love);
    }

    await m.reply(love.trim(), null, { mentions });

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