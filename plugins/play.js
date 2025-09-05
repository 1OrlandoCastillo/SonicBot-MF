import yts from 'yt-search';
import { spawn } from 'child_process';
import fs from 'fs';
import { tmpdir } from 'os';
import path from 'path';
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

        // Archivo temporal
        const tmpFile = path.join(tmpdir(), `audio_${Date.now()}.mp3`);

        // Descargar y convertir audio con yt-dlp + ffmpeg
        await new Promise((resolve, reject) => {
            const ytProcess = spawn('yt-dlp', [
                '-f', 'bestaudio',
                '-o', '-', // salida a stdout
                video.url
            ]);

            const ffmpeg = spawn('ffmpeg', [
                '-i', 'pipe:0',
                '-vn',
                '-c:a', 'libmp3lame',
                '-b:a', '128k',
                tmpFile
            ]);

            ytProcess.stdout.pipe(ffmpeg.stdin);
            ytProcess.stderr.on('data', d => console.log(d.toString()));
            ffmpeg.stderr.on('data', d => console.log(d.toString()));

            ffmpeg.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error('ffmpeg error'));
            });
        });

        // Leer archivo y enviar
        const audioBuffer = fs.readFileSync(tmpFile);
        await conn.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        }, { quoted: m });

        fs.unlinkSync(tmpFile); // eliminar temporal

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
    }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
