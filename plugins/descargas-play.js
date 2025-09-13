import fetch from "node-fetch";
import yts from "yt-search";

const APIS = [
  {
    name: "vreden",
    url: (videoUrl) => `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "zenkey",
    url: (videoUrl) => `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "yt1s",
    url: (videoUrl) => `https://yt1s.io/api/ajaxSearch?q=${encodeURIComponent(videoUrl)}`,
    extract: async (data) => {
      const k = data?.links?.mp3?.auto?.k;
      return k ? `https://yt1s.io/api/ajaxConvert?vid=${data.vid}&k=${k}&quality=64` : null;
    }
  }
];

const getAudioUrl = async (videoUrl) => {
  let lastError = null;

  for (const api of APIS) {
    try {
      console.log(`Probando API: ${api.name}`);
      const apiUrl = api.url(videoUrl);
      const response = await fetch(apiUrl, { timeout: 5000 });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const audioUrl = await api.extract(data);

      if (audioUrl) {
        console.log(`Éxito con API: ${api.name}`);
        return audioUrl;
      }
    } catch (error) {
      console.error(`Error con API ${api.name}:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error("Todas las APIs fallaron");
};

let handler = async (m, { conn }) => {
  const body = m.text?.trim();
  if (!body) return;

  if (!/^play|.play\s+/i.test(body)) return;

  const query = body.replace(/^(play|.play)\s+/i, "").trim();
  if (!query) {
    throw `⭐ Escribe el nombre de la canción\n\nEjemplo: play Bad Bunny - Monaco`;
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    const searchResults = await yts({ query, hl: 'es', gl: 'ES' });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");

    if (video.seconds > 600) {
      throw "❌ El audio es muy largo (máximo 10 minutos)";
    }

    // Enviar miniatura con título en negrita/cursiva y texto adicional
    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: `*_${video.title}_*\n\n> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂 💻`
    }, { quoted: m });

    let audioUrl;
    try {
      audioUrl = await getAudioUrl(video.url);
    } catch (e) {
      console.error("Error al obtener audio:", e);
      throw "⚠️ Error al procesar el audio. Intenta con otra canción";
    }

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${video.title.slice(0, 30)}.mp3`.replace(/[^\w\s.-]/gi, ''),
      ptt: true
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });

    const errorMsg = typeof error === 'string' ? error : 
      `❌ *Error:* ${error.message || 'Ocurrió un problema'}\n\n` +
      `🔸 *Posibles soluciones:*\n` +
      `• Verifica el nombre de la canción\n` +
      `• Intenta con otro tema\n` +
      `• Prueba más tarde`;

    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  }
};

handler.customPrefix = /^(play|.play)\s+/i;
handler.command = new RegExp;
handler.exp = 0;

export default handler;