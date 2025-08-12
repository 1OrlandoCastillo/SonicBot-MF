import fetch from 'node-fetch';

const handler = async (m, {conn, command, usedPrefix}) => {
  // Quitamos la validación de modohorny para que funcione siempre, sin importar grupo o configuración

  conn.reply(m.chat, `[❗️] Enviando el *${command}*`, m);

  switch (command) {
    case 'pack':
      {
        const url = pack[Math.floor(Math.random() * pack.length)];
        await conn.sendMessage(m.chat, { image: { url }, caption: `_✐ Pack_` }, { quoted: m });
      }
      break;
    case 'pack2':
      {
        const url2 = packgirl[Math.floor(Math.random() * packgirl.length)];
        await conn.sendMessage(m.chat, { image: { url: url2 }, caption: `_✐ Pack 2_` }, { quoted: m });
      }
      break;
    case 'pack3':
      {
        const url3 = packmen[Math.floor(Math.random() * packmen.length)];
        await conn.sendMessage(m.chat, { image: { url: url3 }, caption: `_✐ Pack 3_` }, { quoted: m });
      }
      break;
    case 'videoxxx':
    case 'vídeoxxx':
      {
        const url4 = videosxxxc[Math.floor(Math.random() * videosxxxc.length)];
        await conn.sendMessage(m.chat, { video: { url: url4 }, caption: `*✐ ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ*` }, { quoted: m });
      }
      break;
    case 'videoxxxlesbi':
    case 'videolesbixxx':
    case 'pornolesbivid':
    case 'pornolesbianavid':
    case 'pornolesbiv':
    case 'pornolesbianav':
    case 'pornolesv':
      {
        const url5 = videosxxxc2[Math.floor(Math.random() * videosxxxc2.length)];
        await conn.sendMessage(m.chat, { video: { url: url5 }, caption: `*✐ ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ*` }, { quoted: m });
      }
      break;
    default:
      await conn.reply(m.chat, 'Comando no reconocido.', m);
  }
};

handler.command = ['pack','pack2','pack3','videoxxx','vídeoxxx','videoxxxlesbi','videolesbixxx','pornolesbivid','pornolesbianavid','pornolesbiv','pornolesbianav','pornolesv'];

// No se requiere registro para usar estos comandos
handler.register = false;

// Opcional: que funcione tanto en grupos como en privado
handler.group = false;

export default handler;

// Arrays globales con URLs aquí, igual que en tu código
global.pack = [
  // ... URLs de pack
];

global.packgirl = [
  // ... URLs de packgirl
];

global.packmen = [
  // ... URLs de packmen
];

global.videosxxxc = [
  // ... URLs de videosxxxc
];

global.videosxxxc2 = [
  // ... URLs de videosxxxc2
];