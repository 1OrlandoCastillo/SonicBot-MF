let handler = async (m, { conn }) => {
    try {
        // Verificar si se menciona a alguien
        if (!m.mentionedJid || m.mentionedJid.length === 0) {
            return conn.reply(m.chat, "⚠️ ¡Debes mencionar a alguien! Usa el formato: .sintetas @usuario", m);
        }

        let userMentioned = m.mentionedJid[0];
        let porcentaje = Math.floor(Math.random() * 100) + 1;
        let numero = userMentioned.split('@')[0];

        let comentarios = [
            `😱 @${numero} tiene un ${porcentaje}% de estar sin tetas 😬`,
            `😂 Atención: @${numero} está ${porcentaje}% plana, nivel madera 🪵`,
            `📏 @${numero} alcanza un ${porcentaje}% en el ranking de tabla surf 🏄‍♀️`,
            `🤣 Confirmado: @${numero} posee ${porcentaje}% de pecho inexistente 🚫`
        ];

        let mensaje = comentarios[Math.floor(Math.random() * comentarios.length)];

        await conn.sendMessage(m.chat, {
            text: mensaje,
            mentions: [userMentioned]
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, '⚠️ Ocurrió un error al calcular el porcentaje sin tetas 😢', m);
    }
}

handler.help = ['sintetas @usuario'];
handler.tags = ['diversion'];
handler.command = ['sintetas'];

export default handler;