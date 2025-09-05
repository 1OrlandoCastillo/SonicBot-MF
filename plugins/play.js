// plugins/play.js
import yts from 'yt-search';
import ytdl from 'ytdl-core';

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const chatId = m.key.remoteJid;
    const query = args.join(' ');
    if (!query) {
      return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });
    }

    // Buscar video en YouTube
    const results = await yts(query);
    if (!results || !results.videos.length) {
      return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });
    }

    const video = results.videos[0];

    // Mostrar info de la canción
    const infoText = 
`🎵 *${video.title}*
⏱ Duración: ${video.timestamp}
👁 Vistas: ${video.views}
📺 Canal: ${video.author.name}
📅 Publicado: ${video.ago}
\n⏳ Descargando audio...`;

    await conn.sendMessage(chatId, { text: infoText }, { quoted: m });

    // Descargar el audio
    const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });

    // Enviar el audio
    await conn.sendMessage(chatId, {
      audio: stream,
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
    }, { quoted: m });

  } catch (e) {
    console.error('❌ Error en play:', e);
    await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
  }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
