import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs/promises';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const chatId = m.key.remoteJid;
        const query = args.join(' ');

        if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa el comando así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });

        const results = await yts(query);
        if (!results || !results.videos.length) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });

        const video = results.videos[0];

        // Mostrar info
        const infoMsg = `
🎵 *Título:* ${video.title}
⏱ *Duración:* ${video.timestamp}
📺 *Canal:* ${video.author.name}
🔗 *Link:* ${video.url}
        `;

        await conn.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: infoMsg
        }, { quoted: m });

        // Asegurarnos de que exista la carpeta tmp
        const tmpDir = './tmp';
        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

        const tempFile = join(tmpDir, `${Date.now()}.mp3`);

        // Descargar audio
        await new Promise((resolve, reject) => {
            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
            const writeStream = createWriteStream(tempFile);
            stream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Leer archivo como Buffer
        const audioBuffer = await fs.readFile(tempFile);

        await conn.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        }, { quoted: m });

        // Borrar archivo temporal
        await fs.unlink(tempFile);

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
    }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
