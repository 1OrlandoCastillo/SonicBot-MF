let handler = async (m, { usedPrefix, command, text, conn }) => {
    let mentionedJid = m.mentionedJid[0] || text;
    if (!mentionedJid) return conn.reply(m.chat, `⚠️ Menciona a alguien.\nEjemplo: ${usedPrefix + command} @usuario`, m);

    let user = mentionedJid.replace(/@s.whatsapp.net/g, '');
    let hacker = m.pushName || "Anónimo";

    const pasos = [
        "*🖼 Escaneando galería del dispositivo...*",
        "■□□□□□□□ 15% [Obteniendo permisos...]",
        "■■□□□□□□ 30% [Analizando almacenamiento...]",
        "■■■□□□□□ 50% [Extrayendo imágenes privadas...]",
        "■■■■□□□ 70% [Compilando álbum secreto...]",
        "■■■■■□□ 85% [Cifrando archivos para envío...]",
        "✅ *100% Completado* ✅",
        "☠️ *Las fotos fueron enviadas a mi creador.*",
        "🔗 https://servidor-oculto.com/imagenes/espia.zip"
    ];

    const { key } = await conn.sendMessage(m.chat, { text: pasos[0] }, { quoted: m });

    for (let i = 1; i < pasos.length; i++) {
        await delay(1700);
        await conn.sendMessage(m.chat, { text: pasos[i], edit: key });
    }

    await delay(2000);
    await conn.sendMessage(m.chat, { 
        text: `📂 *${user}, tu galería fue robada con éxito.*\n✅ Evidencia enviada a *${hacker}*.`, 
        edit: key 
    });
};

handler.help = ['galeria @usuario'];
handler.tags = ['diversion'];
handler.command = ['galeria', 'robarfotos'];

export default handler;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));