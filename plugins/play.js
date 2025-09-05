import yts from 'yt-search';
import fetch from 'node-fetch';
import fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const handler = async (m, { conn, args }) => {
  try {
    if (!args || args.length === 0) {
      return conn.sendMessage(m.chat, { text: '❌ Uso: .play [nombre de la canción]' }, { quoted: m });
    }

    const query = args.join(' ');
    const search = await yts(query);
    const video = search.videos[0];

    if (!video) {
      return conn.sendMessage(m.chat, { text: '❌ No se encontró la canción.' }, { quoted: m });
    }

    const infoText = `
🎵 *Título:* ${video.title}
📺 *Canal:* ${video.author.name}
⏱ *Duración:* ${video.timestamp}
👁 *Vistas:* ${video.views}
🔗 *URL:* ${video.url}
    `.trim();

    await conn.sendMessage(m.chat, { text: infoText }, { quoted: m });

    // Descargar audio
    const res = await fetch(`https://yt-download.org/api/button/mp3/${video.videoId}`);
    const html = await res.text();
    const match = html.match(/href="(https:\/\/[^\"]+\.mp3)"/);

    if (!match) {
      return conn.sendMessage(m.chat, { text: '❌ No se pudo descargar el audio.' }, { quoted: m });
    }

    const audioUrl = match[1];
    const audioRes = await fetch(audioUrl);
    const buffer = Buffer.from(await audioRes.arrayBuffer());

    const tmpFile = join(tmpdir(), `${video.videoId}.mp3`);
    fs.writeFileSync(tmpFile, buffer);

    await conn.sendMessage(m.chat, { audio: { url: tmpFile }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m });

    fs.unlinkSync(tmpFile); // borrar temporal

  } catch (e) {
    console.error('Error en .play:', e);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
  }
};

handler.command = ['play'];
handler.tags = ['downloader', 'music'];
handler.help = ['play [nombre de la canción]'];

export default handler;
