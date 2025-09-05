import ytdl from 'ytdl-core';
import axios from 'axios';
import fs from 'fs';
import { join } from 'path';

const handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const chatId = m.key.remoteJid;
        const query = args.join(' ');

        if (!query) {
            return conn.sendMessage(chatId, { text: `✏️ Usa el comando así:\n${usedPrefix}play [nombre o link de la canción]` }, { quoted: m });
        }

        let url = '';
        if (ytdl.validateURL(query)) {
            url = query;
        } else {
            // Busca en YouTube usando API de búsqueda de YouTube (sin API key)
            const response = await axios.get('https://www.youtube.com/results', {
                params: { search_query: query }
            });
            const videoIdMatch = response.data.match(/"videoId":"(.*?)"/);
            if (!videoIdMatch) return conn.sendMessage(chatId, { text: '❌ No encontré resultados para tu búsqueda.' }, { quoted: m });
            url = 'https://www.youtube.com/watch?v=' + videoIdMatch[1];
        }

        conn.sendMessage(chatId, { text: '🎵 Descargando tu canción...' }, { quoted: m });

        const tempFile = join('./tmp', `${Date.now()}.mp3`);
        const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
        const writeStream = fs.createWriteStream(tempFile);

        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            await conn.sendMessage(chatId, { audio: { url: tempFile }, mimetype: 'audio/mpeg' }, { quoted: m });
            fs.unlinkSync(tempFile);
        });

    } catch (e) {
        console.error(e);
        conn.sendMessage(m.key.remoteJid, { text: '❌ Ocurrió un error al intentar reproducir la canción.' }, { quoted: m });
    }
};

handler.help = ['play'];
handler.tags = ['audio'];
handler.command = ['play'];
export default handler;
