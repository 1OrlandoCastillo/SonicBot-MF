// Respuestas fijas (puedes agregar más si quieres)
const respuestas = [
  "Alguien quiere sus servicios? xd",
  "Nivel máximo alcanzado 😏",
  "Demasiado OP para este mundo 🔥",
  "Puro caos concentrado 😈",
  "Directo y letal, punto 🤬",
  "Todo lo que toca lo rompe 💥"
];

const handler = async (m, { conn, command, text }) => {
    // Detectar usuario mencionado o texto
    let target = text || (m.mentionedJid && m.mentionedJid[0]) || '';
    if (!target) throw `*Ingrese el @ o el nombre de la persona que desee calcular su porcentaje de ${command.replace('how', '')}*`;

    // Si hay mención, formatear correctamente
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = '@' + m.mentionedJid[0].split('@')[0];
    }

    const porcentaje = Math.floor(Math.random() * 501); // 0 a 500
    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
    const tema = command.replace('how', '').toUpperCase();

    const mensaje = `
_*${target}* es *${porcentaje}%* ${tema}. *${respuesta}*_
`.trim();

    await conn.reply(
        m.chat,
        mensaje,
        m,
        m.mentionedJid ? { contextInfo: { mentionedJid: m.mentionedJid } } : {}
    );
};

// Compatible con todos los Baylers y bots de plugins
export default {
    handler,
    command: /^(prostituta|prostituto)/i,
    fail: null
};