import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";

const dev = "SonicBot-MF";

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];
const formatVideo = ['360', '480', '720', '1080', '1440', '4k'];

// === ddownr helper ===
const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error("Formato no soportado.");
    }

    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    const response = await axios.request(config);
    if (response.data?.success) {
      const { id, title, info } = response.data;
      const downloadUrl = await ddownr.cekProgress(id);
      return { id, image: info.image, title, downloadUrl };
    }
    throw new Error('Fallo al obtener datos del video.');
  },

  cekProgress: async (id) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    let intentos = 0;
    while (intentos < 20) {
      const response = await axios.request(config);
      if (response.data?.success && response.data.progress >= 100) {
        return response.data.download_url;
      }
      await new Promise(r => setTimeout(r, 5000));
      intentos++;
    }
    throw new Error("Timeout esperando descarga.");
  }
};

// === Handler ===
const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, '✎ Ingresa el nombre de la música.', m);

    const search = await yts(text);
    if (!search.all?.length) return m.reply('No se encontraron resultados.');

    const videoInfo = search.all.find(v => !!v.ago) || search.all[0];
    const { title, thumbnail, timestamp, views, ago, url } = videoInfo;

    const thumb = (await conn.getFile(thumbnail)).data;
    const vistaTexto = formatViews(views);
    const mensaje = `🎶 *Título:* ${title}\n📀 *Duración:* ${timestamp}\n👁️ *Vistas:* ${vistaTexto}\n📌 *Canal:* ${videoInfo.author.name || 'Desconocido'}\n🕒 *Publicado:* ${ago}\n🔗 *Enlace:* ${url}`;

    await conn.reply(m.chat, mensaje, m, {
      contextInfo: {
        externalAdReply: {
          title: "Descarga YouTube",
          body: "Downloader",
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true
        }
      }
    });

    // === Audio ===
    if (['play', 'yta', 'mp3', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        const api = await ddownr.download(url, 'mp3');
        await conn.sendMessage(m.chat, { audio: { url: api.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: m });
      } catch {
        const api = await fetch(`https://api.stellarwa.xyz/dow/ytmp3?url=${url}&apikey=proyectsV2`).then(r => r.json());
        if (!api.data?.dl) throw new Error();
        await conn.sendMessage(m.chat, {
          audio: { url: api.data.dl },
          fileName: `${api.data.title}.mp3`,
          mimetype: 'audio/mpeg'
        }, { quoted: m });
      }
    }

    // === Audio DOC ===
    else if (['play3', 'ytadoc', 'playdoc', 'ytmp3doc'].includes(command)) {
      const api = await ddownr.download(url, 'mp3');
      await conn.sendMessage(m.chat, { document: { url: api.downloadUrl }, mimetype: "audio/mpeg", fileName: `${title}`, caption: `${dev} Aquí tienes tu audio` }, { quoted: m });
    }

    // === Video ===
    else if (['play2', 'ytv', 'mp4', 'play4', 'ytvdoc', 'play2doc', 'ytmp4doc'].includes(command)) {
      const docMode = ['play4', 'ytvdoc', 'play2doc', 'ytmp4doc'].includes(command);
      const fuentes = [
        { sistema: "Stellar", url: `https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=proyectsV2` },
        { sistema: "SiputzX", url: `https://api.siputzx.my.id/api/d/ytmp4?url=${url}` }
      ];
      for (let fuente of fuentes) {
        try {
          const res = await fetch(fuente.url).then(r => r.json());
          const dl = res?.data?.dl || res?.result?.download?.url;
          if (dl) {
            const objeto = {
              [docMode ? 'document' : 'video']: { url: dl },
              fileName: `${title}.mp4`,
              mimetype: 'video/mp4',
              caption: `✅ ${docMode ? "Documento" : "Video"} desde *${fuente.sistema}*`,
              thumbnail: thumb
            };
            await conn.sendMessage(m.chat, objeto, { quoted: m });
            return;
          }
        } catch (e) {
          console.error(`Error con ${fuente.sistema}:`, e.message);
        }
      }
      return m.reply("✱ No se encontró un enlace de descarga válido.");
    }

  } catch (error) {
    console.error("Error general:", error);
    return m.reply(`𓁏 *Error:* ${error.message}`);
  }
};

handler.command = handler.help = ['play', 'play2', 'mp3', 'yta', 'mp4', 'ytv', 'play3', 'ytadoc', 'playdoc', 'ytmp3doc', 'play4', 'ytvdoc', 'play2doc', 'ytmp4doc'];
handler.tags = ['downloader'];
export default handler;

function formatViews(views) {
  return views >= 1000 ? `${(views / 1000).toFixed(1)}k (${views.toLocaleString()})` : views.toString();
}