import axios from 'axios';
import fetch from 'node-fetch';

const handler = async (m, { command, conn, usedPrefix }) => {
  try {
    let url;
    switch(command) {
      case 'nsfwloli':
        {
          const res = await axios.get('https://raw.githubusercontent.com/Sinombre913/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json');
          url = res.data[Math.floor(Math.random() * res.data.length)];
        }
        break;

      case 'nsfwfoot':
        {
          const res = await axios.get('https://raw.githubusercontent.com/Sinombre913/TheMystic-Bot-MD/master/src/JSON/nsfwfoot.json');
          url = res.data[Math.floor(Math.random() * res.data.length)];
        }
        break;

      case 'trapito':
        {
          const res = await fetch('https://api.waifu.pics/nsfw/trap');
          const json = await res.json();
          url = json.url;
        }
        break;

      // Agrega más comandos aquí siguiendo el mismo patrón...

      default:
        return conn.reply(m.chat, 'Comando no reconocido.', m);
    }

    await conn.sendMessage(
      m.chat,
      { image: { url }, caption: `_${command}_`.trim() },
      { quoted: m }
    );
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, 'Ocurrió un error al procesar el comando.', m);
  }
};

handler.help = ['nsfwloli', 'nsfwfoot', 'trapito'];
handler.tags = ['nsfw'];
handler.command = ['nsfwloli', 'nsfwfoot', 'trapito'];
handler.register = false; // No requiere registro
handler.group = false;    // Funciona en grupos y privados

export default handler;