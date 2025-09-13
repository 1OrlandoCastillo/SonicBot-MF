let handler = async (m, { conn }) => {
  // Filtra plugins que tengan 'help' y 'tags'
  let plugins = Object.values(global.plugins).filter(v => v.help && v.tags);

  // Total de funciones
  let totalf = plugins.length;

  // Construir mensaje simple
  let mensaje = `✅ 𝖳𝖮𝖳𝖠𝖫 𝖣𝖤 𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 SONICBOT-MF: ${totalf}`;

  // Enviar mensaje
  conn.reply(m.chat, mensaje, m);
};

handler.help = ['totalfunciones'];
handler.tags = ['main'];
handler.command = ['totalfunciones', 'comandos', 'funciones'];

export default handler;