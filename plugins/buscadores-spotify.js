import fetch from 'node-fetch';

const handler = async (m, { args, conn, command, prefix }) => {
  // Verifica si se proporcionó el nombre de la canción
  if (!args[0]) {
    return m.reply(`📌 Ejemplo de uso:\n${(prefix || '.') + command} nina feast`);
  }

  // Reacción de espera
  await conn.sendMessage(m.chat, {
    react: {
      text: '⏱',
      key: m.key,
    },
  });

  // Codifica la búsqueda para la URL
  const query = encodeURIComponent(args.join(' '));
  const url = `https://zenz.biz.id/search/spotify?query=${query}`;

  try {
    // Llama a la API de Zenz
    const res = await fetch(url);
    const json = await res.json();

    // Verifica si hay resultados
    if (!json.status || !json.result || json.result.length === 0) {
      return m.reply('❌ No encontré la canción que estás buscando.');
    }

    const data = json.result[0];

    // Arma el mensaje con los datos de la canción
    const caption = `🎵 *Título:* ${data.title}
🎤 *Artista:* ${data.artist}
💿 *Álbum:* ${data.album}
🔗 *Enlace:* ${data.url}`;

    // Muestra la portada del álbum y la información
    await conn.sendMessage(m.chat, {
      image: { url: data.cover },
      caption
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key,
      },
    });

  } catch (e) {
    console.error(e);
    m.reply('⚠️ Ocurrió un error al buscar la canción.');
  }
};

// Información de ayuda del comando
handler.help = ['sspotify <nombre de la canción>'];
handler.tags = ['busqueda'];
handler.command = ['spotify', 'sspotify', 'spotiti']

export default handler;