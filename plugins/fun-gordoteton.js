let handler = async (m, { conn, args }) => {
    // Verificar si se menciona a un usuario
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return conn.sendMessage(m.chat, { text: "⚠️ Debes mencionar a un usuario. Usa el formato: .gordoteton @usuario" }, { quoted: m });
    }

    // Obtener el ID del usuario mencionado
    let userMentioned = m.mentionedJid[0];

    // Generar un porcentaje aleatorio entre 1 y 100
    let porcentaje = Math.floor(Math.random() * 100) + 1;

    // Obtener el nombre del usuario mencionado (puede ser asíncrono)
    let nombre = await conn.getName(userMentioned);

    // Mensaje que se enviará
    const mensaje = `🤣 ¡${nombre} tiene un ${porcentaje}% de ser gordoteton! ¡No te lo tomes a mal!`;

    // Enviar el mensaje al chat
    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
}
handler.help = ['gordoteton @usuario'];
handler.tags = ['diversión'];
handler.command = ['gordoteton'];

export default handler;