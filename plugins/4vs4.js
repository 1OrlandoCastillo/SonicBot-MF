let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) {
    let fecha = new Date();
    let horaMexico = fecha.toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' });
    let horaColombia = fecha.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    return m.reply(`
 𝟒 𝐕𝐄𝐑𝐒𝐔𝐒 𝟒 ⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
 • 🇲🇽 𝐌𝐄𝐑𝐈𝐃𝐀 : ${horaMexico} 
 • 🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${horaColombia}
 ➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: 
 ➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒: 
 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1 👑 
 ┇ 🥷🏻 ┇ 🥷🏻 ┇ 🥷🏻 ┇ 
 ㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒: 
 🥷🏻 ┇ 🥷🏻 ┇ 
`);
  }
};

handler.help = ['4vs4'];
handler.tags = ['freefire'];
handler.command = /^(vs4|4vs4|masc4)$/i;
handler.group = true;
handler.admin = true;

export default handler;