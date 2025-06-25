import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🫆 *Adonix IA* 🤖\n\nUsa:\n${usedPrefix + command} [tu pregunta]\n\nEjemplo:\n${usedPrefix + command} haz un código JS que sume dos números`);
  }

  try {
    await m.react('🕒');

    const apiURL = `https://theadonix-api.vercel.app/api/adonix?q=${encodeURIComponent(text)}`;
    const res = await fetch(apiURL);
    const data = await res.json();

    // Si devuelve imagen
    if (data.imagen_generada) {
      await conn.sendMessage(m.chat, {
        image: { url: data.imagen_generada },
        caption: `💎 *Adonix IA* generó esta imagen:\n\n> 📍 _${data.pregunta}_\n${data.mensaje || ''}`,
      }, { quoted: m });
      await m.react('✅');
      return;
    }

    // Si devuelve respuesta tipo texto
    if (data.respuesta && typeof data.respuesta === 'string') {
      const [mensaje, ...codigo] = data.respuesta.split(/```(?:javascript|js|html|)/i);
      let respuestaFinal = `👤 *Adonix IA =*\n\n${mensaje.trim()}`;

      if (codigo.length > 0) {
        respuestaFinal += `\n\n🌳 *Codigo =*\n\`\`\`js\n${codigo.join('```').trim().slice(0, 3900)}\n\`\`\``;
      }

      await m.reply(respuestaFinal);
      await m.react('✅');
      return;
    }

    // Si no trae ni imagen ni texto válido
    await m.react('❌');
    return m.reply('❌ No se pudo procesar la respuesta de Adonix IA.');

  } catch (e) {
    console.error('[ERROR ADONIX IA]', e);
    await m.react('❌');
    return m.reply(`❌ Error al usar Adonix IA:\n\n${e.message}`);
  }
};

handler.help = ['adonix <pregunta>'];
handler.tags = ['ia', 'inteligencia'];
handler.command = ['adonix', 'ai', 'adonixia'];

export default handler;
