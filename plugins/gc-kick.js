var handler = async (m, { conn, participants, usedPrefix, command }) => {
    return conn.reply(m.chat, '🌠 *Este comando está restringido por mi creador hasta el próximo aviso*', m);
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = /^(kick|echar|_|sacar|ban|-)$/i;
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;