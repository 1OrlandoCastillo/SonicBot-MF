const { WAConnection, MessageMedia } = require('@whiskeysockets/baileys');

const handler = async (m, { conn, usedPrefix }) => {
  const embed = generarEmbed([], []);
  const message = await conn.sendMessage(m.chat, { text: embed }, { quoted: m });
  await conn.react(message.key, '❤️');
  await conn.react(message.key, '👍');

  const escuadra = [];
  const suplentes = [];

  conn.on('message', async (msg) => {
    if (msg.type === 'reaction' && msg.key.fromMe) {
      const nombre = await conn.getName(msg.key.from);
      if (msg.reaction === '❤️') {
        escuadra.push(nombre);
        console.log(`¡${nombre} se ha unido a la escuadra!`);
      } else if (msg.reaction === '👍') {
        suplentes.push(nombre);
        console.log(`¡${nombre} se ha convertido en suplente!`);
      }
      await actualizarLista(m, conn, escuadra, suplentes);
    }
  });

  setTimeout(() => {
    console.log('La lista ha expirado.');
    console.log(`Escuadra: ${escuadra.join(', ')}`);
    console.log(`Suplentes: ${suplentes.join(', ')}`);
  }, 300000);
};

async function actualizarLista(m, conn, escuadra, suplentes) {
  const embed = generarEmbed(escuadra, suplentes);
  await conn.sendMessage(m.chat, { text: embed }, { quoted: m });
}

function generarEmbed(escuadra, suplentes) {
  return `╭─────────────╮
┊ `𝗠𝗢𝗗𝗢:` ```CLK```
┊ 
┊ ⏱️ `𝗛𝗢𝗥𝗔𝗥𝗜𝗢`
┊ • 5:00am MÉXICO 
┊ • 6:00am COLOMBIA 
┊ 
┊ » `𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔`
┊ ${escuadra.map((nombre) => `┊ ${nombre}`).join('\n')}
┊ 
┊ » `𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:`
┊ ${suplentes.map((nombre) => `┊ ${nombre}`).join('\n')}
┊ 
╰─────────────╯
❤️ = Participar | 👍 = Suplente
• Lista Activa Por 5 Minutos`;
}

handler.help = ['partido']
handler.tags = ['partido']
handler.group = true

export default handler