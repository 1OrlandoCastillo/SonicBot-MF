import ytdl from 'ytdl-core';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const chatId = m.key.remoteJid;
    const query = args.join(' ');
    if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });

    // Buscar video en YouTube
    const r = await yts(query);
    const video = r.videos[0];
    if (!video) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });

    // Mostrar info de la canción
    const infoText = 
`🎵 *${video.title}*
⏱ Duración: ${video.timestamp}
👁 Vistas: ${video.views}
📺 Canal: ${video.author.name}
📅 Publicado: ${video.ago}\n\n⏳ Descargando audio...`;
    await conn.sendMessage(chatId, { text: infoText }, { quoted: m });

    // Descargar audio con ytdl-core
    const audioPath = path.join('./tmp', `${video.videoId}.mp3`);
    const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
    const writeStream = fs.createWriteStream(audioPath);
    stream.pipe(writeStream);

    // Esperar a que termine la descarga
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      stream.on('error', reject);
    });

    // Enviar audio a WhatsApp
    await conn.sendMessage(chatId, {
      audio: fs.readFileSync(audioPath),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
    }, { quoted: m });

    // Eliminar archivo temporal
    fs.unlinkSync(audioPath);

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
  }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
