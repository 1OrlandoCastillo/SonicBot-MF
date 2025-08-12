import { toAudio } from '../lib/converter.js';

// Variables definidas para evitar errores
const emoji = '🎵';
const msm = '⚠️';

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;

    // Detecta audio/video incluso si viene como documento
    const mime = q?.mimetype || q?.msg?.mimetype || q?.mediaType || q?.message?.documentMessage?.mimetype || '';

    if (!/video|audio/.test(mime)) {
      return conn.reply(
        m.chat,
        `${emoji} Por favor, responda al video, nota de voz o documento de audio/video que desee convertir a MP3.`,
        m
      );
    }

    const media = await q.download();
    if (!media) {
      return conn.reply(m.chat, `${msm} Ocurrió un error al descargar su archivo.`, m);
    }

    const audio = await toAudio(media, 'mp4');
    if (!audio?.data) {
      return conn.reply(
        m.chat,
        `${msm} Ocurrió un error al convertir el archivo a Audio/MP3.`,
        m
      );
    }

    await conn.sendMessage(
      m.chat,
      { audio: audio.data, mimetype: 'audio/mpeg' },
      { quoted: m }
    );
  } catch (err) {
    console.error(err);
    conn.reply(m.chat, `${msm} Ha ocurrido un error inesperado.`, m);
  }
};

handler.help = ['tomp3', 'toaudio'];
handler.command = ['tomp3', 'toaudio'];
handler.group = true;
handler.register = true;

export default handler;