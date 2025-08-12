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

    let love = `❤️ *${text1}* tu oportunidad de enamorarte de *${text2}* es de ${lovePercent}% 👩🏻‍❤️‍👨🏻`;

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
// handler.register = true;  <--- QUITADA para que no requiera registro

export default handler;