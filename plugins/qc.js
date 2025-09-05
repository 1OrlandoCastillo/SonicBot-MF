// handler-quote.js
const axios = require('axios');
const { writeExifImg } = require('../libs/fuctions'); // ajusta la ruta según tu proyecto

// Mapa de códigos de país a banderas
const flagMap = [
  ['598', '🇺🇾'], ['595', '🇵🇾'], ['593', '🇪🇨'], ['591', '🇧🇴'],
  ['590', '🇧🇶'], ['509', '🇭🇹'], ['507', '🇵🇦'], ['506', '🇨🇷'],
  ['505', '🇳🇮'], ['504', '🇭🇳'], ['503', '🇸🇻'], ['502', '🇬🇹'],
  ['501', '🇧🇿'], ['599', '🇨🇼'], ['597', '🇸🇷'], ['596', '🇬🇫'],
  ['594', '🇬🇫'], ['592', '🇬🇾'], ['590', '🇬🇵'], ['549', '🇦🇷'],
  ['58', '🇻🇪'], ['57', '🇨🇴'], ['56', '🇨🇱'], ['55', '🇧🇷'],
  ['54', '🇦🇷'], ['53', '🇨🇺'], ['52', '🇲🇽'], ['51', '🇵🇪'],
  ['34', '🇪🇸'], ['1', '🇺🇸']
];

// Función para mostrar número con bandera
function numberWithFlag(num) {
  const clean = num.replace(/[^0-9]/g, '');
  for (const [code, flag] of flagMap) {
    if (clean.startsWith(code)) return `${num} ${flag}`;
  }
  return num;
}

// Extraer nombre de mensaje citado
const quotedPush = q => (q?.pushName || q?.sender?.pushName || '');

// Función modular para obtener nombre bonito
async function niceName(jid, conn, chatId, qPush, fallback = '') {
  if (qPush && qPush.trim() && !/^\d+$/.test(qPush)) return qPush;
  if (chatId.endsWith('@g.us')) {
    try {
      const meta = await conn.groupMetadata(chatId);
      const p = meta.participants.find(p => p.id === jid);
      const n = p?.notify || p?.name;
      if (n && n.trim() && !/^\d+$/.test(n)) return n;
    } catch {}
  }
  try {
    const g = await conn.getName(jid);
    if (g && g.trim() && !/^\d+$/.test(g) && !g.includes('@')) return g;
  } catch {}
  const c = conn.contacts?.[jid];
  if (c?.notify && !/^\d+$/.test(c.notify)) return c.notify;
  if (c?.name && !/^\d+$/.test(c.name)) return c.name;
  if (fallback && fallback.trim() && !/^\d+$/.test(fallback)) return fallback;
  return numberWithFlag(jid.split('@')[0]);
}

// Colores disponibles para quote
const colors = {
  rojo: '#FF0000', azul: '#0000FF', morado: '#800080', verde: '#008000',
  amarillo: '#FFFF00', naranja: '#FFA500', celeste: '#00FFFF',
  rosado: '#FFC0CB', negro: '#000000'
};

// Handler principal para comando "qc"
const handler = async (msg, { conn, args }) => {
  try {
    const chatId = msg.key.remoteJid;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    let targetJid = msg.key.participant || chatId;
    let textQuoted = '';
    let fallbackPN = msg.pushName || '';
    let qPushName = '';

    if (quoted && ctx?.participant) {
      targetJid = ctx.participant;
      textQuoted = quoted.conversation || quoted.extendedTextMessage?.text || '';
      qPushName = quotedPush(quoted);
      fallbackPN = '';
    }

    const contentFull = args.join(' ').trim();

    if (!contentFull && !textQuoted) {
      return conn.sendMessage(chatId, {
        text: `✏️ Usa qc así:\n\n*• qc [texto]*\n*• qc [color] [texto]*\n\nColores disponibles:\nrojo, azul, morado, verde, amarillo, naranja, celeste, rosado, negro`
      }, { quoted: msg });
    }

    const firstWord = contentFull.split(' ')[0].toLowerCase();
    const bgColor = colors[firstWord] || colors['negro'];

    let content = colors[firstWord] ? contentFull.split(' ').slice(1).join(' ').trim() : contentFull;
    if (!content) content = textQuoted || ' ';

    const plain = content.replace(/@[\d\-]+/g, '');
    const displayName = await niceName(targetJid, conn, chatId, qPushName, fallbackPN);

    let avatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
    try { avatar = await conn.profilePictureUrl(targetJid, 'image'); } catch {}

    await conn.sendMessage(chatId, { react: { text: '🎨', key: msg.key } });

    const quoteData = {
      type: 'quote', format: 'png', backgroundColor: bgColor,
      width: 600, height: 900, scale: 3,
      messages: [{
        entities: [],
        avatar: true,
        from: { id: 1, name: displayName, photo: { url: avatar } },
        text: plain,
        replyMessage: {}
      }]
    };

    const { data } = await axios.post(
      'https://bot.lyo.su/quote/generate',
      quoteData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const stickerBuf = Buffer.from(data.result.image, 'base64');
    const sticker = await writeExifImg(stickerBuf, { packname: 'Adri 2.0 Bot', author: 'Adribot 💻' });

    await conn.sendMessage(chatId, { sticker: { url: sticker } }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error('❌ Error en qc:', e);
    await conn.sendMessage(msg.key.remoteJid, { text: '❌ Error al generar el sticker.' }, { quoted: msg });
  }
};

handler.command = ['qc'];
module.exports = handler;