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

        // Tomamos los 3 primeros resultados
        const top3 = results.videos.slice(0, 3);

        // Mostrar opciones al usuario
        let msgText = '🎵 *Resultados encontrados:*\n\n';
        top3.forEach((v, i) => {
            msgText += `*${i+1}.* ${v.title}\n⏱ ${v.timestamp} | 📺 ${v.author.name}\n🔗 ${v.url}\n\n`;
        });
        msgText += 'Envía el número (1, 2 o 3) de la canción que quieres descargar.';

        await conn.sendMessage(chatId, { text: msgText }, { quoted: m });

        // Esperamos la respuesta del usuario
        const filter = (msg) => msg.key.remoteJid === chatId && msg.key.fromMe === false;
        const collected = await new Promise((resolve) => {
            const handlerMsg = (msg) => {
                const num = parseInt(msg.message?.conversation || msg.message?.extendedTextMessage?.text);
                if (num >= 1 && num <= top3.length) {
                    conn.ev.off('messages.upsert', handlerMsg);
                    resolve(num);
                }
            };
            conn.ev.on('messages.upsert', handlerMsg);
        });

        const video = top3[collected - 1];

        // Aseguramos carpeta tmp
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
