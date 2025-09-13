let handler = async (m, { conn }) => {
  // Filtra plugins que tengan 'help' y 'tags'
  let plugins = Object.values(global.plugins).filter(v => v.help && v.tags);

  // Total de funciones
  let totalf = plugins.length;

  // Agrupar funciones por categoría (tags)
  let categorias = {};
  plugins.forEach(p => {
    p.tags.forEach(tag => {
      if (!categorias[tag]) categorias[tag] = [];
      categorias[tag].push(p.help[0]); // Tomamos el primer nombre de help
    });
  });

  // Construir mensaje bonito
  let mensaje = `✅ 𝖳𝖮𝖳𝖠𝖫 𝖣𝖤 𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 SONICBOT-MF: ${totalf}\n\n`;
  for (let tag in categorias) {
    mensaje += `*📂 ${tag.toUpperCase()}*\n`;
    categorias[tag].forEach(cmd => {
      mensaje += `  ✨ ${cmd}\n`;
    });
    mensaje += `\n`;
  }

  // Enviar mensaje
  conn.reply(m.chat, mensaje.trim(), m);
};

handler.help = ['totalfunciones'];
handler.tags = ['main'];
handler.command = ['totalfunciones', 'comandos', 'funciones'];

export default handler;