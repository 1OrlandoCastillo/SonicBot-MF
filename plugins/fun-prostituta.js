let comentarios = [
    // … aquí van los 120+ comentarios groseros y basados del ejemplo anterior
];

let handler = async (m, { conn, command, text }) => {
    if (!text) throw `*Ingrese el @ o el nombre de la persona que desee calcular su porcentaje de ${command.replace('how', '')}*`;

    // Generar porcentaje hasta 1,200%
    const porcentaje = Math.floor(Math.random() * 1201); // 0 a 1200
    const tema = command.replace('how', '').toUpperCase();

    if (comentarios.length === 0) {
        comentarios = ["¡Se acabaron las frases! 😅"];
    }

    // Elegir un comentario aleatorio sin repetir
    const index = Math.floor(Math.random() * comentarios.length);
    const comentario = comentarios.splice(index, 1)[0];

    const mensaje = `
_*${text}* es *${porcentaje}%* ${tema}. *${comentario}*_
`.trim();

    conn.reply(
        m.chat,
        mensaje,
        m,
        m.mentionedJid ? { contextInfo: { mentionedJid: m.mentionedJid } } : {}
    );
};

handler.command = /^(prostituta|prostituto)/i;
handler.fail = null;
module.exports = handler;