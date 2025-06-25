import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  let res = await fetch('https://g-mini-ia.vercel.app/api/meme');
  let json = await res.json();

  if (!json?.url) return conn.reply(m.chat, '❌ No se pudo sacar el meme we :c', m);

  await conn.sendMessage(m.chat, {
    image: { url: json.url },
    caption: `🤣 *Aca Tienes Un Meme*`,
    footer: '📸',
    buttons: [
      {
        buttonId: '.meme',
        buttonText: { displayText: '🌀 Otro meme' },
        type: 1,
      }
    ],
    headerType: 4
  }, { quoted: m });
};

handler.command = ['meme'];
handler.help = ['meme'];
handler.tags = ['fun'];
export default handler;