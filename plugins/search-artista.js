const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*No se encontró ningún prefijo, por favor escriba un prefijo.*\n> *Ejemplo: ${usedPrefix + command} !*`;
  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-😊👍👾💬🔥').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
  conn.fakeReply(m.chat, `*Prefijo actualizado con éxito, prefijo actual: ${text}*`, '0@s.whatsapp.net', `✨ *NUEVO PREFIJO* ✨\n\n*Prefijo: ${text}*`);
};

handler.help = ['prefix'].map((v) => v + ' [prefix]');
handler.tags = ['owner'];
handler.command = ['prefix'];
handler.rowner = true;
export default handler;