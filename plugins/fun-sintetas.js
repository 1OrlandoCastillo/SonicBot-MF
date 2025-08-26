let handler = async (m, { conn }) => {
    try {
        // Verificar si se menciona a un usuario
        if (!m.mentionedJid || m.mentionedJid.length === 0) {
            return conn.sendMessage(
                m.chat, 
                { text: "⚠️ ¡Debes mencionar a alguien! Usa el formato: .sintetas @usuario" }, 
                { quoted: m }
            );
        }

        // Obtener el ID del usuario mencionado
        let userMentioned = m.mentionedJid[0];

        // Generar un porcentaje aleatorio entre 1 y 100
        let porcentaje = Math.floor(Math.random() * 100) + 1;

        // Obtener el número de teléfono (sin @s.whatsapp.net)
        let numero = userMentioned.split('@')[0];

        // Mensajes divertidos según el porcentaje
        let comentarios = [
            `😱 @${numero} tiene un ${porcentaje}% de estar sin tetas 😬`,
            `😂 Atención: @${numero} está ${porcentaje}% plana, nivel madera 🪵`,
            `📏 @${numero} alcanza un ${porcentaje}% en el ranking de tabla surf 🏄‍♀️`,
            `🤣 Confirmado: @${numero} posee ${porcentaje}% de pecho inexistente 🚫`
        ];

        // Seleccionar un mensaje aleatorio
        const mensaje = comentarios[Math.floor(Math.random() * comentarios.length)];

        // Enviar el mensaje al chat mencionando al usuario
        await conn.sendMessage(
            m.chat, 
            { text: mensaje, mentions: [userMentioned] }, 
            { quoted: m }
        );

    } catch (e) {
        console.error(e);
        m.reply('⚠️ Ocurrió un error al calcular el porcentaje sin tetas 😢');
    }
}

handler.help = ['sintetas @usuario'];
handler.tags = ['diversion'];
handler.command = ['sintetas'];

export default handler;