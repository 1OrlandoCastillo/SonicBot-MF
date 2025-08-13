import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
    if (!text) return conn.reply(m.chat, 'Ingresa el nombre de la música que quieres buscar 🎵', m);

    const idioma = (global.db?.data?.users?.[m.sender]?.language) || 'es';
    const langFile = `./language/${idioma}.json`;

    let traductor = {
        notFound: 'No encontré resultados en YouTube 🎬',
        downloadOptions: 'OPCIONES DE DESCARGA',
        buttonTitles: {
            ytmp3: 'Descargar MP3 (Audio)',
            ytmp4: 'Descargar MP4 (Video)',
            ytmp3doc: 'Descargar MP3 como Documento',
            ytmp4doc: 'Descargar MP4 como Documento',
        },
        footerText: (global.dev || 'Desarrollador').toString().trim(),
    };

    if (fs.existsSync(langFile)) {
        try {
            const _translate = JSON.parse(fs.readFileSync(langFile));
            traductor = { ...traductor, ..._translate.plugins?.buscador_yts };
        } catch {
            // seguimos con español por defecto
        }
    }

    const results = await yts(text);
    const videos = results.videos.slice(0, 10); // limitar a 10 resultados
    if (!videos.length) return conn.reply(m.chat, traductor.notFound, m);

    // Preparar la imagen de la primera miniatura para el encabezado
    const messa = await prepareWAMessageMedia(
        { image: { url: videos[0].thumbnail } },
        { upload: conn.waUploadToServer }
    );

    // Crear las secciones con botones para cada video
    const sections = videos.map(video => ({
        title: video.title.length > 40 ? video.title.slice(0, 37) + '...' : video.title,
        rows: [
            {
                title: traductor.buttonTitles.ytmp3,
                description: video.author?.name || 'Desconocido',
                rowId: `${prefijo}ytmp3 ${video.url}`
            },
            {
                title: traductor.buttonTitles.ytmp4,
                description: video.author?.name || 'Desconocido',
                rowId: `${prefijo}ytmp4 ${video.url}`
            },
            {
                title: traductor.buttonTitles.ytmp3doc,
                description: video.author?.name || 'Desconocido',
                rowId: `${prefijo}ytmp3doc ${video.url}`
            },
            {
                title: traductor.buttonTitles.ytmp4doc,
                description: video.author?.name || 'Desconocido',
                rowId: `${prefijo}ytmp4doc ${video.url}`
            }
        ]
    }));

    const interactiveMessage = {
        text: `ＹＯＵＴＵＢＥ － ＰＬＡＹ\n\n` +
              `Resultados para: *${text}*`,
        footer: traductor.footerText,
        title: '',
        buttonText: traductor.downloadOptions,
        sections
    };

    const waMessage = generateWAMessageFromContent(m.chat, {
        listMessage: interactiveMessage
    }, { userJid: conn.user.jid, quoted: m });

    await conn.relayMessage(m.chat, waMessage.message, { messageId: waMessage.key.id });
};

handler.help = ['play *<texto>*'];
handler.tags = ['dl'];
handler.command = ['play'];
handler.register = false;

export default handler;