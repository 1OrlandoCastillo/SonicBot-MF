import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import { join } from 'path';

const handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const chatId = m.key.remoteJid;
        const query = args.join(' ');

        if (!query) return conn.sendMessage(chatId, { text: `✏️ Usa el comando así:\n${usedPrefix}play [nombre de la canción]` }, { quoted: m });

        // Buscar canciones en YouTube
        const results = await yts(query);
        if (!results || !results.videos.length) return conn.sendMessage(chatId, { text: '❌ No encontré resultados para tu búsqueda.' }, { quoted: m });

        const videos = results.videos.slice(0, 5); // los primeros 5 resultados
        let listMsg = '🎶 Selecciona la canción que quieres:\n\n';
        videos.forEach((v, i) => {
            listMsg += `*${i+1}.* ${v.title}\nDuración: ${v.timestamp}\nCanal: ${v.author.name}\n\n`;
        });
        listMsg += 'Responde con el número de la canción. Ej: 1';
        await conn.sendMessage(chatId, { text: listMsg }, { quoted: m });

        // Esperar respuesta del usuario
        const filter = (res) => res.key.remoteJid === chatId && !isNaN(res.message?.conversation) && parseInt(res.message.conversation) > 0 && parseInt(res.message.conversation) <= videos.length;
        const collected = await new Promise((resolve) => {
            const listener = async (res) => {
                if (filter(res)) {
                    conn.ev.off('messages.upsert', listener);
                    resolve(res);
                }
            };
            conn.ev.on('messages.upsert', listener);
        });

        const choice = parseInt(collected.message.conversation) - 1;
        const video = videos[choice];

        // Preguntar si quiere audio o video
        await conn.sendMessage(chatId, { text: `Selecciona el formato:\n1. Audio 🎵\n2. Video 🎥\n3. Link 🔗` }, { quoted: m });

        const formatCollected = await new Promise((resolve) => {
            const listener = async (res) => {
                if (res.key.remoteJid === chatId && ['1','2','3'].includes(res.message?.conversation)) {
                    conn.ev.off('messages.upsert', listener);
                    resolve(res.message.conversation);
                }
            };
            conn.ev.on('messages.upsert', listener);
        });

        if (formatCollected === '3') {
            return conn.sendMessage(chatId, { text: `🔗 Aquí está tu link:\n${video.url}` }, { quoted: m });
        }

        const tempFile = join('./tmp', `${Date.now()}.${formatCollected === '1' ? 'mp3' : 'mp4'}`);
        const stream = ytdl(video.url, { quality: 'highestaudio', filter: formatCollected === '1' ? 'audioonly' : 'audioandvideo' });
        const writeStream = fs.createWriteStream(tempFile);
        stream.pipe(writeStream);

        await conn.sendMessage(chatId, { text: '⏳ Descargando, espera un momento...' }, { quoted: m });

        writeStream.on('finish', async () => {
            if (formatCollected === '1') {
                await conn.sendMessage(chatId, { audio: { url: tempFile }, mimetype: 'audio/mpeg' }, { quoted: m });
            } else {
                await conn.sendMessage(chatId, { video: { url: tempFile }, mimetype: 'video/mp4' }, { quoted: m });
            }
            fs.unlinkSync(tempFile);
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: m });
    }
};

handler.help = ['play'];
handler.tags = ['audio', 'video'];
handler.command = ['play'];
export default handler;
