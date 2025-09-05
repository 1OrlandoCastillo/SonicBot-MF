import fetch from 'node-fetch';
import yts from 'yt-search';

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const chatId = m.key.remoteJid;
    const query = args.join(' ');
    if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa: ${usedPrefix}play [canción]` }, { quoted: m });

    const results = await yts(query);
    if (!results?.videos?.length) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });

    const video = results.videos[0];
    await conn.sendMessage(chatId, { text: `🎵 *${video.title}*\n📺 ${video.author.name}\n⏱ ${video.timestamp}\n🔗 https://youtu.be/${video.videoId}` }, { quoted: m });

    // API que devuelve enlace directo MP3
    const apiRes = await fetch(`https://youtube-to-mp315.p.rapidapi.com/dl?id=${video.videoId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'youtube-to-mp315.p.rapidapi.com',
        'X-RapidAPI-Key': 'TU_RAPIDAPI_KEY'
      }
    });

    const data = await apiRes.json();
    if (!data?.link) throw new Error('No se pudo obtener el audio.');

    const audioRes = await fetch(data.link);
    const buffer = await audioRes.buffer();

    await conn.sendMessage(chatId, { 
      audio: buffer, 
      mimetype: 'audio/mpeg', 
      fileName: `${video.title}.mp3`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
  }
};

handler.command = ['play'];
export default handler;
