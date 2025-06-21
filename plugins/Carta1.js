import fetch from 'node-fetch';

const cartas = [
  {
    texto: `💌 *⌈* 𝑪𝑨𝑹𝑻𝑨 𝑫𝑬 𝑨𝑴𝑶𝑹 *⌋* 💌 𝑫𝑬: {remitente} 𝑷𝑨𝑹𝑨: {destinatario} 𝑬𝒔𝒄𝒓𝒊𝒃𝒐 𝒆𝒔𝒕𝒂 𝒄𝒂𝒓𝒕𝒂 𝒅𝒆 𝒂𝒎𝒐𝒓 𝒑𝒐𝒓 𝒔𝒊 𝒂𝒍𝒈𝒖𝒏𝒂 𝒗𝒆𝒛 𝒐𝒍𝒗𝒊𝒅𝒂𝒔 𝒄𝒖𝒂́𝒏𝒕𝒐 𝒕𝒆 𝒒𝒖𝒊𝒆𝒓𝒐 𝒚 𝒄𝒖𝒂́𝒏𝒕𝒐 𝒗𝒂𝒍𝒆𝒔.`
  },
  {
    texto: `💌 *⌈* 𝑪𝑨𝑹𝑻𝑨 𝑫𝑬 𝑨𝑴𝑶𝑹 *⌋* 💌 𝑫𝑬: {remitente} 𝑷𝑨𝑹𝑨: {destinatario} 𝑴𝒆 𝒉𝒆 𝒆𝒏𝒂𝒎𝒐𝒓𝒂𝒅𝒐 𝒅𝒆 𝒕𝒖 𝒃𝒆𝒍𝒍𝒆𝒛𝒂 𝒚 𝒕𝒖 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒍𝒊𝒅𝒂𝒅.`
  },
  {
    texto: `💌 *⌈* 𝑪𝑨𝑹𝑻𝑨 𝑫𝑬 𝑨𝑴𝑶𝑹 *⌋* 💌 𝑫𝑬: {remitente} 𝑷𝑨𝑹𝑨: {destinatario} 𝑻𝒆 𝒂𝒎𝒐 𝒎𝒂́𝒔 𝒒𝒖𝒆 𝒂𝒚𝒆𝒓, 𝒑𝒆𝒓𝒐 𝒎𝒆𝒏𝒐𝒔 𝒒𝒖𝒆 𝒎𝒂𝒏̃𝒂𝒏𝒂.`
  }
];

let handler = async (m, { conn }) => {
  try {
    let _user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    let remitente = m.sender.split('@')[0];
    let destinatario = _user.split('@')[0];

    const cartaAleatoria = cartas[Math.floor(Math.random() * cartas.length)];
    const text2 = cartaAleatoria.texto
      .replace('{remitente}', `@${remitente}`)
      .replace('{destinatario}', `@${destinatario}`);

    conn.sendMessage(m.chat, { text: text2, mentions: [m.sender, _user] });
  } catch (e) {
    m.reply(`*Error:* ${e.message}`);
  }
};

handler.command = /^(carta)$/i;
export default handler;