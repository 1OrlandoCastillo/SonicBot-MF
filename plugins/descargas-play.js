import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
    const device = await getDevice(m.key.participant || m.key.remoteJid);

    if (!text) return conn.reply(m.chat, 'Ingresa el nombre de la música que quieres buscar 🎵', m);

    if (device !== 'desktop' && device !== 'web') {
        const results = await yts(text);
        const videos = results.videos.slice(0, 20);
        if (!videos.length) return conn.reply(m.chat, 'No encontré resultados en YouTube 🎬', m);

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        const messa = await prepareWAMessageMedia(
            { image: { url: randomVideo.thumbnail } },
            { upload: conn.waUploadToServer }
        );

        const interactiveMessage = {
            body: {
                text: `ＹＯＵＴＵＢＥ － ＰＬＡＹ\n\n` +
                      `» *Título:* ${randomVideo.title}\n` +
                      `» *Duración:* ${randomVideo.duration?.timestamp || 'Desconocida'}\n` +
                      `» *Autor:* ${randomVideo.author?.name || 'Desconocido'}\n` +
                      `» *Publicado:* ${randomVideo.ago || 'N/D'}\n` +
                      `» *Enlace:* ${randomVideo.url}\n`
            },
            footer: { text: (global.dev || 'Desarrollador').toString().trim() },
            header: {
                title: ``,
                hasMediaAttachment: true,
                imageMessage: messa.imageMessage || messa.image,
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: 'OPCIONES DE DESCARGA',
                            sections: videos.map(video => ({
                                title: video.title,
                                rows: [
                                    { header: video.title, title: video.author.name, description: 'Descargar MP3 (Audio)', id: `${prefijo || '/'}ytmp3 ${video.url}` },
                                    { header: video.title, title: video.author.name, description: 'Descargar MP4 (Video)', id: `${prefijo || '/'}ytmp4 ${video.url}` },
                                    { header: video.title, title: video.author.name, description: 'Descargar MP3 como Documento', id: `${prefijo || '/'}ytmp3doc ${video.url}` },
                                    { header: video.title, title: video.author.name, description: 'Descargar MP4 como Documento', id: `${prefijo || '/'}ytmp4doc ${video.url}` }
                                ]
                            }))
                        })
                    }
                ],
                messageParamsJson: ''
            }
        };

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: { interactiveMessage },
            },
        }, { userJid: conn.user.jid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } else {
        // Idioma seguro, si no existe usa español por defecto
        const idioma = (global.db?.data?.users?.[m.sender]?.language) || 'es';
        const langFile = `./language/${idioma}.json`;

        let traductor = {
            notFound: 'No encontré resultados en YouTube 🎬',
            listFormat: (v) => `
° *_${v.title}_*
↳ 🫐 *_Enlace :_* ${v.url}
↳ 🕒 *_Duración :_* ${v.timestamp || 'N/D'}
↳ 📥 *_Subido :_* ${v.ago || 'N/D'}
↳ 👁 *_Vistas :_* ${v.views || 'N/D'}`
        };

        if (fs.existsSync(langFile)) {
            try {
                const _translate = JSON.parse(fs.readFileSync(langFile));
                traductor = _translate.plugins?.buscador_yts || traductor;
            } catch {
                // Si el archivo está corrupto o mal formateado, seguimos con el español por defecto
            }
        }

        const results = await yts(text);
        const tes = results.videos;
        if (!tes.length) return conn.reply(m.chat, traductor.notFound, m);

        const teks = tes.map(v => traductor.listFormat(v))
            .join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');

        await conn.sendFile(m.chat, tes[0].thumbnail, 'video.jpg', teks.trim(), m);
    }
};

handler.help = ['play *<texto>*'];
handler.tags = ['dl'];
handler.command = ['play'];
handler.register = false; // no requiere registro

export default handler;