import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://g-mini-ia.vercel.app/api/meme');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const meme = json.url;

    if (!meme) throw new Error('No se encontró la URL del meme');

    await conn.sendFile(m.chat, meme, 'meme.jpg', `Aquí tienes un meme 😄\nDescargado de: ${meme}`, m);
  } catch (e) {
    console.error('[ERROR MEME]', e);
    m.reply('😿 Ocurrió un error al obtener el meme.');
  }
};

handler.help = ['meme'];
handler.tags = ['fun'];
handler.command = ['meme', 'memes'];
handler.register = false; // <--- Cambiado a false

export default handler;