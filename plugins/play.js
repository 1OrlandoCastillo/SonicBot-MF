import yts from 'yt-search';
import ytdl from 'ytdl-core';
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

        // Mostrar info con mensaje de descarga
        const infoText = `🎵 *${video.title}*\n⏱ Duración: ${video.timestamp}\n👁 Vistas: ${video.views}\n📺 Canal: ${video.author.name}\n📅 Publicado: ${video.ago}\n\n⏳ Descargando audio...`;
        await conn.sendMessage(chatId, { image: thumbBuffer, caption: infoText }, { quoted: m });

        // Descargar audio en streaming con manejo de errores
        let audioBuffer;
        try {
            const audioStream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
            const chunks = [];

            await new Promise((resolve, reject) => {
                audioStream.on('data', chunk => chunks.push(chunk));
                audioStream.on('end', () => {
                    audioBuffer = Buffer.concat(chunks);
                    resolve();
                });
                audioStream.on('error', reject);
            });
        } catch (err) {
            console.error('Error descargando audio:', err);
            return conn.sendMessage(chatId, { text: '❌ No se pudo descargar el audio del video.' }, { quoted: m });
        }

        // Enviar audio
        await conn.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
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
