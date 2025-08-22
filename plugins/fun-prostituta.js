// Arrays globales para no repetir comentarios
let insultos = comentariosTotales.slice(0, 40);
let based = comentariosTotales.slice(40, 80);
let elogios = comentariosTotales.slice(80);

const handler = async (m, { conn, command, text }) => {
    // Tomar el primer usuario mencionado si existe
    let target = text || (m.mentionedJid && m.mentionedJid[0]) || '';
    if (!target) throw `*Ingrese el @ o el nombre de la persona que desee calcular su porcentaje de ${command.replace('how', '')}*`;

    const porcentaje = Math.floor(Math.random() * 1201); // 0 a 1200
    const tema = command.replace('how', '').toUpperCase();

    let arrayComentarios;
    if (porcentaje <= 399) arrayComentarios = insultos;
    else if (porcentaje <= 799) arrayComentarios = based;
    else arrayComentarios = elogios;

    if (arrayComentarios.length === 0) arrayComentarios = ["¡Se acabaron las frases! 😅"];

    // Elegir comentario aleatorio y eliminarlo para no repetir
    const index = Math.floor(Math.random() * arrayComentarios.length);
    const comentario = arrayComentarios.splice(index, 1)[0];

    // Formatear target si es mención
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = '@' + m.mentionedJid[0].split('@')[0];
    }

    const mensaje = `
_*${target}* es *${porcentaje}%* ${tema}. *${comentario}*_
`.trim();

    await conn.reply(
        m.chat,
        mensaje,
        m,
        m.mentionedJid ? { contextInfo: { mentionedJid: m.mentionedJid } } : {}
    );
};

export default {
    handler,
    command: /^(prostituta|prostituto)/i,
    fail: null
};