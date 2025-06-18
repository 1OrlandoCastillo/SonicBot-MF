let handler = async (m, { conn, text }) => {
  let id = text ? text : m.chat;
  let chat = global.db.data.chats[m.chat];

  chat.welcome = false;
  try {
    await conn.reply(id, `🚩 *SonicBot* abandona el grupo. ¡Fue genial estar aquí! 👋`);
    await conn.groupLeave(id);
    delete global.db.data.chats[m.chat];
  } catch (e) {
    await m.reply('❌ Ocurrió un error al intentar salir del grupo.');
  }
};

handler.command = /^(salir|leavegc|salirdelgrupo|leave)$/i;
handler.group = true;
handler.prems = true;
export default handler;