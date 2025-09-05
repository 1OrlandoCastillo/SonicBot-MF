import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import { join } from 'path';

const handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const chatId = m.key.remoteJid;
        const query = args.join(' ');

        if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa el comando así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });

        // Buscar canción en YouTube
        const results = await yts(query);
        if (!results || !results.videos.length) return conn.sendMessage(chatId, { text: '❌ No encontré resultados para tu búsqueda.' }, { quoted: m });

        const video = results.videos[0]; // Tomamos el primer resultado

        // Mostrar info de la canción
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

        // Archivo temporal
        const tempFile = join('./tmp', `${Date.now()}.mp3`);

        // Descargar solo audio
        const stream = ytdl(video.url, { quality: 'highestaudio', filter: 'audioonly' });
        const writeStream = fs.createWriteStream(tempFile);
        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            await conn.sendMessage(chatId, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: m });

            fs.unlinkSync(tempFile); // Eliminar archivo temporal
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
    }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
