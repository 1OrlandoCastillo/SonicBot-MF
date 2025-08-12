import axios from 'axios';
import fetch from 'node-fetch';

const handler = async (m, { command, conn, usedPrefix }) => {
  try {
    // Lista de comandos NSFW que manejas (para validación si quieres agregar)
    const nsfwCommands = [
      'nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero',
      'nsfwfemdom', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2',
      'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito',
      'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'
    ];

    // Validar que el comando sea uno de los permitidos (opcional)
    if (!nsfwCommands.includes(command)) {
      return conn.reply(m.chat, `❌ Comando no reconocido: ${command}`, m);
    }

    // URLS con JSON para comandos que usan repositorios externos
    const repoBase = 'https://raw.githubusercontent.com/Sinombre913/TheMystic-Bot-MD/master/src/JSON';

    // Función para obtener una URL random desde JSON
    async function getRandomUrlFromJson(jsonUrl) {
      const response = await axios.get(jsonUrl);
      const data = response.data;
      return data[Math.floor(Math.random() * data.length)];
    }

    // Manejo específico por comando
    if (command === 'trapito') {
      // Usando API externa para este comando
      const res = await fetch('https://api.waifu.pics/nsfw/trap');
      const json = await res.json();
      return conn.sendMessage(m.chat, { image: { url: json.url }, caption: `_${command}_` }, { quoted: m });
    }

    if (command === 'yaoi') {
      const res = await fetch('https://nekobot.xyz/api/image?type=yaoi');
      const json = await res.json();
      return conn.sendMessage(m.chat, { image: { url: json.message }, caption: `_${command}_` }, { quoted: m });
    }

    if (command === 'yaoi2') {
      const res = await fetch('https://purrbot.site/api/img/nsfw/yaoi/gif');
      const json = await res.json();
      return conn.sendMessage(m.chat, { image: { url: json.link }, caption: `_${command}_` }, { quoted: m });
    }

    if (command === 'yuri2') {
      const resError = await axios.get(`${repoBase}/yuri.json`);
      const res = await fetch('https://purrbot.site/api/img/nsfw/yuri/gif');
      const json = await res.json();
      let url = json.link;
      if (!url) url = resError.data[Math.floor(Math.random() * resError.data.length)];
      return conn.sendMessage(m.chat, { image: { url }, caption: `_${command}_` }, { quoted: m });
    }

    // Para el resto de comandos que usan JSON estático
    const jsonMap = {
      nsfwloli: `${repoBase}/nsfwloli.json`,
      nsfwfoot: `${repoBase}/nsfwfoot.json`,
      nsfwass: `${repoBase}/nsfwass.json`,
      nsfwbdsm: `${repoBase}/nsfwbdsm.json`,
      nsfwcum: `${repoBase}/nsfwcum.json`,
      nsfwero: `${repoBase}/nsfwero.json`,
      nsfwfemdom: `${repoBase}/nsfwfemdom.json`,
      nsfwglass: `${repoBase}/nsfwglass.json`,
      nsfworgy: `${repoBase}/nsfworgy.json`,
      hentai: `${repoBase}/hentai.json`,
      panties: `${repoBase}/panties.json`,
      porno: `${repoBase}/porno.json`,
      pechos: `${repoBase}/pechos.json`,
      yuri: `${repoBase}/yuri.json`,
      ecchi: `${repoBase}/ecchi.json`,
      furro: `${repoBase}/furro.json`,
      imagenlesbians: `${repoBase}/imagenlesbians.json`,
      tetas: `${repoBase}/tetas.json`,
      booty: `${repoBase}/booty.json`,
      // agrega más si quieres
    };

    if (jsonMap[command]) {
      const url = await getRandomUrlFromJson(jsonMap[command]);
      return conn.sendMessage(m.chat, { image: { url }, caption: `_${command}_` }, { quoted: m });
    }

    // Caso randomxxx: elige una JSON random de una lista y envía una imagen random de ahí
    if (command === 'randomxxx') {
      const randomJsonList = [
        `${repoBase}/tetas.json`,
        `${repoBase}/booty.json`,
        `${repoBase}/imagenlesbians.json`,
        `${repoBase}/panties.json`,
        `${repoBase}/porno.json`,
      ];
      const chosenJson = randomJsonList[Math.floor(Math.random() * randomJsonList.length)];
      const url = await getRandomUrlFromJson(chosenJson);
      return conn.sendMessage(m.chat, { image: { url }, caption: `_${command}_` }, { quoted: m });
    }

    // Si el comando no está manejado arriba, enviar un mensaje por defecto
    return conn.reply(m.chat, `❌ El comando ${command} no está implementado aún.`, m);

  } catch (error) {
    console.error(error);
    return conn.reply(m.chat, '❌ Ocurrió un error al procesar tu solicitud.', m);
  }
};

// Ajustes para que funcione sin registro ni solo grupo:
handler.register = false;  // No requiere registro
handler.group = false;     // Funciona en grupos y privados
handler.tags = ['nsfw'];
handler.help = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];
handler.command = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];

export default handler;