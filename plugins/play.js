import ytSearch from 'yt-search';
import { exec } from 'child_process';

const handler = async (m, { conn, args }) => {
  try {
    if (!args || args.length === 0) 
      return conn.sendMessage(m.chat, { text: '🚩 Usa: .play <nombre de la canción>' }, { quoted: m });

    const query = args.join(' ');
    const results = await ytSearch(query);

    if (!results || !results.videos.length) 
      return conn.sendMessage(m.chat, { text: '❌ No se encontró la canción.' }, { quoted: m });

    const video = results.videos[0];

    // Mensaje con info
    const infoMsg = `
🎵 *Título:* ${video.title}
📺 *Canal:* ${video.author.name}
⏱️ *Duración:* ${video.timestamp}
👀 *Vistas:* ${video.views.toLocaleString()}
🔗 *Enlace:* ${video.url}
    `;
    await conn.sendMessage(m.chat, { text: infoMsg }, { quoted: m });

    // Enviar enlace de audio directo usando ytdl (no descarga)
    const audioUrl = `${video.url}`;
    await conn.sendMessage(m.chat, { 
      text: `Puedes reproducir el audio desde este enlace: ${audioUrl}` 
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
  }
};

handler.command = ['play'];
export default handler;
