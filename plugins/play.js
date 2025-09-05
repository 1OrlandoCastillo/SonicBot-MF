import ytdl from 'ytdl-core';
import yts from 'yt-search';
import streamToBuffer from 'stream-to-buffer';

const handler = async (msg, { conn, args }) => {
    const chatId = msg.key.remoteJid;

    if (!args || args.length === 0) {
        return conn.sendMessage(chatId, { text: '✏️ Uso: .play [nombre de la canción]' }, { quoted: msg });
    }

    const query = args.join(' ');
    await conn.sendMessage(chatId, { text: `🔎 Buscando: ${query}...` }, { quoted: msg });

    try {
        // Buscar en YouTube
        const result = await yts(query);
        if (!result || !result.videos || result.videos.length === 0) {
            return conn.sendMessage(chatId, { text: '❌ No se encontró la canción.' }, { quoted: msg });
        }

        const video = result.videos[0];
        const url = video.url;

        // Descargar audio como stream
        const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

        // Convertir stream a buffer
        streamToBuffer(audioStream, async (err, buffer) => {
            if (err) {
                console.error(err);
                return conn.sendMessage(chatId, { text: '❌ Error al procesar el audio.' }, { quoted: msg });
            }

            // Enviar audio
            await conn.sendMessage(chatId, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: msg });
        });

    } catch (err) {
        console.error(err);
        return conn.sendMessage(chatId, { text: '❌ Ocurrió un error al reproducir la canción.' }, { quoted: msg });
    }
};

handler.command = ['play'];
handler.tags = ['music'];
handler.help = ['play [nombre de la canción]'];

export default handler;
