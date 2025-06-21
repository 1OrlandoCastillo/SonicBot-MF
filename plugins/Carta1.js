import fetch from 'node-fetch';

const cartas = [
  {
    texto: `💌 *⌈* 𝑪𝑨𝑹𝑻𝑨 𝑫𝑬 𝑨𝑴𝑶𝑹 *⌋* 💌 𝑫𝑬: @${m.sender} 𝑷𝑨𝑹𝑨: @${_user} ...`
  },
  {
    texto: `💌 *⌈* 𝑪𝑨𝑹𝑻𝑨 𝑫𝑬 𝑨𝑴𝑶𝑹 *⌋* 💌 𝑫𝑬: @${m.sender} 𝑷𝑨𝑹𝑨: @${_user} ...`
  },
];

let handler = async (m, { conn, text, groupMetadata }) => {
  try {
    let _user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
    else who = m.sender;
    let name = conn.getName(who);

    const cartaAleatoria = cartas[Math.floor(Math.random() * cartas.length)];
    const text2 = cartaAleatoria.texto.replace('${m.sender}', m.sender).replace('${_user}', _user);

    conn.sendMessage(m.chat, { text: text2, mentions: [_user, m.sender] }, { quoted: m });
  } catch (e) {
    m.reply(`*Error:* ${e.message}`);
  }
};

handler.command = /^(carta|cartaaleatoria)$/i;
export default handler;