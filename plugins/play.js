import yts from 'yt-search';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const chatId = m.key.remoteJid;
        const query = args.join(' ');
        if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });

        // Buscar canción en YouTube
        const results = await yts(query);
        if (!results || !results.videos.length) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });

        const video = results.videos[0];

        // Descargar miniatura
        const thumbBuffer = Buffer.from(await (await fetch(video.thumbnail)).arrayBuffer());

        // Mostrar info de la canción
        const infoText = `🎵 *${video.title}*\n⏱ Duración: ${video.timestamp}\n👁 Vistas: ${video.views}\n📺 Canal: ${video.author.name}\n📅 Publicado: ${video.ago}\n\n⏳ Descargando audio...`;
        await conn.sendMessage(chatId, { image: thumbBuffer, caption: infoText }, { quoted: m });

        // Stream de audio usando yt-dlp y ffmpeg
        const ytProcess = spawn('yt-dlp', [
            '-f', 'bestaudio',
            '-o', '-', // salida a stdout
            video.url
        ]);

        const chunks = [];
        ytProcess.stdout.on('data', (chunk) => {
            chunks.push(chunk);
        });

        ytProcess.stderr.on('data', (data) => console.log(data.toString()));

        await new Promise((resolve, reject) => {
            ytProcess.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`yt-dlp exited with code ${code}`));
            });
        });

        const audioBuffer = Buffer.concat(chunks);

        await conn.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
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
