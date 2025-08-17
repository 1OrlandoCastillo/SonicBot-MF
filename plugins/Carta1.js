import fetch from 'node-fetch';

const cartas = [
  {
    texto: `💌 *⌈ Carta de Amor 🌸 ⌋* 💌  
De: {remitente}  
Para: {destinatario}  

✨ Solo quería recordarte lo especial que eres para mí y cuánto iluminas mis días. 💖`
  },
  {
    texto: `💌 *⌈ Carta de Amor 🌷 ⌋* 💌  
De: {remitente}  
Para: {destinatario}  

🌼 Me he enamorado de tu dulzura, tu sonrisa y cada pequeño detalle que te hace único/a. 💕`
  },
  {
    texto: `💌 *⌈ Carta de Amor 🌟 ⌋* 💌  
De: {remitente}  
Para: {destinatario}  

🌸 Te quiero más que ayer, y cada día descubro nuevas razones para quererte aún más. 🥰`
  },
  {
    texto: `💌 *⌈ Carta de Amor 🐻 ⌋* 💌  
De: {remitente}  
Para: {destinatario}  

💖 Eres mi alegría diaria, mi abrazo en la distancia y mi razón para sonreír siempre. 🌷`
  },
  {
    texto: `💌 *⌈ Carta de Amor 🌈 ⌋* 💌  
De: {remitente}  
Para: {destinatario}  

🌹 Gracias por existir y llenar mi mundo de colores y ternura. Siempre pienso en ti. 💕`
  }
];

let handler = async (m, { conn }) => {
  try {
    let _user = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
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