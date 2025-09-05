import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs/promises';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const chatId = m.key.remoteJid;
        const query = args.join(' ');
        if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });

        // Buscar la canción en YouTube
        const results = await yts(query);
        if (!results || !results.videos.length) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });

        const video = results.videos[0];

        // Mostrar información
        const infoMessage = `🎵 *${video.title}*\n⏱ Duración: ${video.timestamp}\n👁 Vistas: ${video.views}\n📺 Canal: ${video.author.name}\n📅 Publicado: ${video.ago}\n\nDescargando audio...`;
        await conn.sendMessage(chatId, { text: infoMessage }, { quoted: m });

        // Crear carpeta temporal
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

        const audioBuffer = await fs.readFile(tempFile);
        const thumbnailBuffer = Buffer.from(await (await fetch(video.thumbnail)).arrayBuffer());

        // Enviar audio
        await conn.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            contextInfo: { externalAdReply: { title: video.title, body: video.author.name, mediaUrl: video.url, mediaType: 2, thumbnail: thumbnailBuffer } }
        }, { quoted: m });

        // Eliminar archivo temporal
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
