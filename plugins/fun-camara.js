const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { usedPrefix, command, text, conn }) => {
    let mentionedJid = m.mentionedJid[0];
    if (!mentionedJid) return conn.reply(m.chat, `⚠️ Debes mencionar a alguien.\nEjemplo: ${usedPrefix + command} @usuario`, m);

    let user = mentionedJid.replace(/@s.whatsapp.net/g, '');
    let hacker = m.pushName || "Anónimo";

    const pasos = [
        "*📸 Activando cámara frontal del dispositivo...*",
        "■□□□□□□□ 10% [Iniciando conexión segura...]",
        "■■□□□□□□ 25% [Obteniendo permisos del sistema...]",
        "■■■□□□□□ 40% [Accediendo al hardware de la cámara...]",
        "■■■■□□□ 55% [Encendiendo cámara y ajustando enfoque...]",
        "■■■■■□□ 70% [Grabando video en tiempo real...]",
        "■■■■■■□ 85% [Aplicando filtros de rastreo facial...]",
        "■■■■■■■ 95% [Compilando evidencia visual...]",
        "✅ *100% Completado* ✅",
        "📤 *Subiendo video a servidor privado...*",
        "📦 *Archivo cifrado exitosamente.*",
        "☠️ *El video ha sido enviado a mi creador.*",
        "🔗 https://servidor-oculto.com/video/espia.mp4"
    ];

    // Enviar primer mensaje
    let msg = await conn.sendMessage(m.chat, { text: pasos[0] }, { quoted: m });
    let key = msg.key;

    // Detectar si la librería soporta edición
    let soportaEdicion = typeof conn.relayMessage === "function";

    for (let i = 1; i < pasos.length; i++) {
        await delay(1700);
        if (soportaEdicion) {
            // Edita el mismo mensaje
            await conn.relayMessage(m.chat, {
                protocolMessage: {
                    key,
                    type: 14,
                    editedMessage: { conversation: pasos[i] }
                }
            }, {});
        } else {
            // Si no soporta edición → manda mensajes normales
            await conn.sendMessage(m.chat, { text: pasos[i] }, { quoted: m });
        }
    }

    await delay(2000);
    let finalText = `🎥 *${user} tu cámara fue hackeada con éxito.*\n\n✅ Evidencia enviada a *${hacker}* para su uso privado. 😈`;

    if (soportaEdicion) {
        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key,
                type: 14,
                editedMessage: { conversation: finalText }
            }
        }, {});
    } else {
        await conn.sendMessage(m.chat, { text: finalText }, { quoted: m });
    }
};

handler.help = ['camara @usuario', 'activarcamara @usuario'];
handler.tags = ['diversion'];
handler.command = ['camara', 'activarcamara', 'espia'];

export default handler;