import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs/promises';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const chatId = m.key.remoteJid;
        const query = args.join(' ');

        if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });

        const results = await yts(query);
        if (!results || !results.videos.length) return conn.sendMessage(chatId, { text: '❌ No encontré resultados.' }, { quoted: m });

        const top3 = results.videos.slice(0, 3);

        // Crear botones para los 3 resultados
        const buttons = top3.map((v, i) => ({
            buttonId: `play_${i}`,
            buttonText: { displayText: `${i+1}` },
            type: 1
        }));

        const buttonMessage = {
            image: { url: top3[0].thumbnail },
            caption: `🎵 *Resultados para:* ${query}\n\n${top3.map((v,i) => `${i+1}. ${v.title} | ⏱ ${v.timestamp} | 📺 ${v.author.name}`).join('\n')}\n\nPulsa el número de la canción que quieres descargar.`,
            buttons,
            headerType: 4
        };

        await conn.sendMessage(chatId, buttonMessage, { quoted: m });

        // Escuchar la respuesta del usuario
        const handlerResponse = async (msg) => {
            const selected = msg.message?.buttonsResponseMessage?.selectedButtonId;
            if (!selected?.startsWith('play_')) return;

            conn.ev.off('messages.upsert', handlerResponse);

            const index = parseInt(selected.split('_')[1]);
            const video = top3[index];

            // Crear carpeta temporal si no existe
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

            // Leer archivo y enviar
            const audioBuffer = await fs.readFile(tempFile);
            await conn.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: m });

            await fs.unlink(tempFile);
        };

        conn.ev.on('messages.upsert', handlerResponse);

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
    }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
