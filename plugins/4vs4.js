// Listas en memoria para guardar anotados
const escuadra = [];
const suplente = [];

const handler = async (m, { conn, args }) => {
  if (args.length < 2) {
    conn.reply(m.chat, '𝘋𝘦𝘣𝘦𝘴 𝘱𝘳𝘰𝘱𝘰𝘳𝘤𝘪𝘰𝘯𝘢𝘳 𝘭𝘢 𝘩𝘰𝘳𝘢 (𝘏𝘏:𝘔𝘔) 𝘺 𝘦𝘭 𝘱𝘢𝘪́𝘴 (𝘔𝘟, 𝘊𝘖, 𝘊𝘓, 𝘈𝘙).', m);
    return;
  }

  const horaRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
  if (!horaRegex.test(args[0])) {
    conn.reply(m.chat, '𝘍𝘰𝘳𝘮𝘢𝘵𝘰 𝘥𝘦 𝘩𝘰𝘳𝘢 𝘪𝘯𝘤𝘰𝘳𝘳𝘦𝘤𝘵𝘰. 𝘋𝘦𝘣𝘦 𝘴𝘦𝘳 𝘏𝘏:𝘔𝘔 𝘦𝘯 𝘧𝘰𝘳𝘮𝘢𝘵𝘰 𝘥𝘦 24 𝘩𝘰𝘳𝘢𝘴.', m);
    return;
  }

  const horaUsuario = args[0];
  const pais = args[1].toUpperCase();

  const diferenciasHorarias = {
    MX: 0,
    CO: 1,
    CL: 2,
    AR: 3
  };

  if (!(pais in diferenciasHorarias)) {
    conn.reply(m.chat, 'País no válido. Usa MX para México, CO para Colombia, CL para Chile o AR para Argentina.', m);
    return;
  }

  const diferenciaHoraria = diferenciasHorarias[pais];

  const hora = parseInt(horaUsuario.split(':')[0], 10);
  const minutos = parseInt(horaUsuario.split(':')[1], 10);

  const horasEnPais = [];
  for (let i = 0; i < 4; i++) {
    const horaActual = new Date();
    horaActual.setHours(hora + i);
    horaActual.setMinutes(minutos);
    horaActual.setSeconds(0);
    horaActual.setMilliseconds(0);

    const horaEnPais = new Date(horaActual.getTime() - (3600000 * diferenciaHoraria));
    horasEnPais.push(horaEnPais);
  }

  const formatTime = (date) => date.toLocaleTimeString('es', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const horaActual = formatTime(new Date());

  const message = `
*4 𝐕𝐄𝐑𝐒𝐔𝐒 4*

🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : ${formatTime(horasEnPais[0])}
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${formatTime(horasEnPais[1])}
🇨🇱 𝐂𝐇𝐈𝐋𝐄 : ${formatTime(horasEnPais[2])}
🇦🇷 𝐀𝐑𝐆𝐄𝐍𝐓𝐈𝐍𝐀 : ${formatTime(horasEnPais[3])}

𝐇𝐎𝐑𝐀 𝐀𝐂𝐓𝐔𝐀𝐋 𝐄𝐍 𝐌𝐄𝐗𝐈𝐂𝐎🇲🇽 : ${horaActual}

𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔

👑 ┇ 
🥷🏻 ┇  
🥷🏻 ┇ 
🥷🏻 ┇ 


ㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄:
🥷🏻 ┇ 
🥷🏻 ┇
`.trim();

  const buttons = [
    { buttonId: 'escuadra', buttonText: { displayText: 'Escuadra' }, type: 1 },
    { buttonId: 'suplente', buttonText: { displayText: 'Suplente' }, type: 1 }
  ];

  await conn.sendMessage(m.chat, { text: message, buttons, headerType: 1 }, { quoted: m });
};

handler.onButton = async (m, { conn }) => {
  const id = m.buttonId;
  const userId = m.sender;
  const userName = m.pushName || 'Usuario';

  if (id === 'escuadra') {
    if (!escuadra.includes(userId)) {
      escuadra.push(userId);
      await conn.sendMessage(m.chat, `✅ ${userName} anotado en Escuadra.`, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, `⚠️ ${userName}, ya estás anotado en Escuadra.`, { quoted: m });
    }
  } else if (id === 'suplente') {
    if (!suplente.includes(userId)) {
      suplente.push(userId);
      await conn.sendMessage(m.chat, `✅ ${userName} anotado en Suplente.`, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, `⚠️ ${userName}, ya estás anotado en Suplente.`, { quoted: m });
    }
  }
};

handler.command = /^(4vs4|vs4)$/i;
export default handler;