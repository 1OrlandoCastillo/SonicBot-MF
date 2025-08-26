let handler = async (m, { usedPrefix, command, text, conn }) => {
    let mentionedJid = m.mentionedJid[0] || text;
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

    const { key } = await conn.sendMessage(m.chat, { text: pasos[0] }, { quoted: m });

    for (let i = 1; i < pasos.length; i++) {
        await delay(1700);
        await conn.sendMessage(m.chat, { text: pasos[i], edit: key });
    }

    await delay(2000);
    await conn.sendMessage(m.chat, { 
        text: `🎥 *${user} tu cámara fue hackeada con éxito.*\n\n✅ Evidencia enviada a *${hacker}* para su uso privado. 😈`, 
        edit: key 
    });
};

handler.help = ['camara @usuario', 'activarcamara @usuario'];
handler.tags = ['diversion'];
handler.command = ['camara', 'activarcamara', 'espia'];

export default handler;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));