import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const chatId = m.key.remoteJid;
    const query = args.join(' ');
    if (!query) {
      return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });
    }

    // Buscar canción en YouTube
    const results = await yts(query);
    if (!results || !results.videos.length) {
      return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });
    }

    const video = results.videos[0];

    // Mostrar información del video
    const infoText = `🎵 *${video.title}*\n⏱ Duración: ${video.timestamp}\n👁 Vistas: ${video.views}\n📺 Canal: ${video.author.name}\n📅 Publicado: ${video.ago}\n\n⏳ Buscando audio...`;
    await conn.sendMessage(chatId, { text: infoText }, { quoted: m });

    // Obtener enlace de audio MP3 usando la API
    const apiUrl = `https://api.vevioz.com/api/button/mp3/${video.videoId}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('No se pudo obtener el enlace de audio.');
    }
    const data = await response.json();
    const audioUrl = data.url;

    // Descargar el audio
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('No se pudo descargar el audio.');
    }
    const audioBuffer = await audioResponse.buffer();

    // Enviar el audio como mensaje de voz
    await conn.sendMessage(chatId, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
  }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
