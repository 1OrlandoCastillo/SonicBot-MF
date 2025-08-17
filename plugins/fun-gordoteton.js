let handler = async (m, { conn }) => {
    try {
        // Verificar si se menciona a un usuario
        if (!m.mentionedJid || m.mentionedJid.length === 0) {
            return conn.sendMessage(
                m.chat, 
                { text: "⚠️ ¡Debes mencionar a alguien! Usa el formato: .gordoteton @usuario" }, 
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
            `🤣 @${numero} tiene un ${porcentaje}% de ser gordoteton! 😜 ¡Qué ternurita!`,
            `💖 Cuidado! @${numero} es ${porcentaje}% adorable y gordoteton 😍`,
            `🍩 ¡Wow! @${numero} tiene un ${porcentaje}% de nivel máximo de gordoteton cute 💕`,
            `😆 ¡Atención! @${numero} posee un ${porcentaje}% de ternura gordoteton 🐷✨`
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
        m.reply('⚠️ Ocurrió un error al calcular el gordoteton 😢');
    }
}

handler.help = ['gordoteton @usuario'];
handler.tags = ['diversión'];
handler.command = ['gordoteton'];

export default handler;