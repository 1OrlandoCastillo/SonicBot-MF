// qc-basic.js
const axios = require('axios');
const { writeExifImg } = require('../libs/fuctions'); // ajusta la ruta según tu proyecto

const handler = async (msg, { conn, args }) => {
  try {
    const chatId = msg.key.remoteJid;

    // Texto que va en el quote
    const content = args.join(' ').trim();
    if (!content) {
      return conn.sendMessage(chatId, {
        text: '✏️ Usa el comando así:\n.qc [texto]'
      }, { quoted: msg });
    }

    // Avatar por defecto (puedes usar la del remitente si quieres)
    let avatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
    try { avatar = await conn.profilePictureUrl(msg.key.participant || chatId, 'image'); } catch {}

    // Preparar datos del quote
    const quoteData = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#000000', // fondo negro básico
      width: 600,
      height: 900,
      scale: 3,
      messages: [{
        entities: [],
        avatar: true,
        from: { id: 1, name: msg.pushName || 'Usuario', photo: { url: avatar } },
        text: content,
        replyMessage: {}
      }]
    };

    // Llamada al generador de quote
    const { data } = await axios.post(
      'https://bot.lyo.su/quote/generate',
      quoteData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Convertir a sticker
    const stickerBuf = Buffer.from(data.result.image, 'base64');
    const sticker = await writeExifImg(stickerBuf, {
      packname: 'Bot Básico',
      author: 'Adribot 💻'
    });

    // Enviar sticker
    await conn.sendMessage(chatId, { sticker: { url: sticker } }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en qc básico:', e);
    await conn.sendMessage(msg.key.remoteJid, { text: '❌ Error al generar el sticker.' }, { quoted: msg });
  }
};

handler.command = ['qc'];
module.exports = handler;