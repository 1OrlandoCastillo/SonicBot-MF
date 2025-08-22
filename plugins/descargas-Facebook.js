import { igdl } from 'ruhend-scraper';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, '*`《★》Ingresa el link del vídeo a descargar`*', m);
  }

  await m.react('🕒');
  let res;
  try {
    res = await igdl(args[0]);
  } catch {
    await m.react('❌');
    return conn.reply(m.chat, '*`Error al obtener datos. Verifica el enlace.`*', m);
  }

  let result = res.data;
  if (!result || result.length === 0) {
    await m.react('❌');
    return conn.reply(m.chat, '*`No se encontraron resultados.`*', m);
  }

  let data;
  try {
    data = result.find(i => i.resolution && i.resolution.includes("720")) 
         || result.find(i => i.resolution && i.resolution.includes("360"));
  } catch {
    await m.react('❌');
    return conn.reply(m.chat, '*`Error al procesar los datos.`*', m);
  }

  if (!data || !data.url) {
    await m.react('❌');
    return conn.reply(m.chat, '*`No se encontró una resolución adecuada.`*', m);
  }

  await m.react('✅');
  let video = data.url;

  try {
    await conn.sendMessage(m.chat, { 
      video: { url: video }, 
      caption: '《★》 *Descargado Con Exito ✓*', 
      fileName: 'fb.mp4', 
      mimetype: 'video/mp4' 
    }, { quoted: m });
  } catch (error) {
    await m.react('❌');
    return conn.reply(m.chat, `*Error al enviar el video.*\n> ${error.message}`, m);
  }
};

handler.help = ['fb *<link>*'];
handler.tags = ['descargas'];
handler.command = /^(fb|facebook|fbdl)$/i;
handler.estrellas = 5;

export default handler;