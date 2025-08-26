let handler = async (m, { usedPrefix, command, text, conn }) => {
    let mentionedJid = m.mentionedJid[0] || text;
    if (!mentionedJid) return conn.reply(m.chat, `⚠️ Menciona a alguien para asustarlo.\nEjemplo: ${usedPrefix + command} @usuario`, m);

    let user = `@${mentionedJid.replace(/@s.whatsapp.net/g, '')}`;
    let hacker = m.pushName || "Anónimo";

    const progreso = [
        "*🕒 Iniciando hackeo a la cuenta de " + user + "...*",
        "■□□□□□ 10% [Escaneando vulnerabilidades...]",
        "■■□□□□ 25% [Conectando con el servidor secreto...]",
        "■■■□□□ 40% [Accediendo a la base de datos de WhatsApp...]",
        "■■■■□□ 55% [Extrayendo credenciales cifradas...]",
        "■■■■■□ 75% [Descargando conversaciones privadas...]",
        "■■■■■■ 90% [Instalando puerta trasera...]",
        "✅ *100% Completado* ✅",
        "⚠️ *ALERTA DE SEGURIDAD* ⚠️",
        "☠️ *Sistema comprometido.*",
        "📡 *Interceptando mensajes en tiempo real...*",
        "🛑 *Acceso root obtenido. Eliminando historial...*",
        "💀 *Datos personales enviados a la Dark Web.*",
        "🚨 *Instalando spyware para monitoreo permanente.*",
        "✅ *Hackeo completado con éxito por " + hacker + ".*"
    ];

    // Envía el primer mensaje
    let { key } = await conn.sendMessage(m.chat, { text: progreso[0], mentions: [mentionedJid] }, { quoted: m });

    // Edita el mensaje original con los siguientes pasos
    for (let i = 1; i < progreso.length; i++) {
        await delay(1800); // tiempo entre ediciones
        try {
            await conn.sendMessage(m.chat, { text: progreso[i], edit: key, mentions: [mentionedJid] });
        } catch (e) {
            console.error("Error editando mensaje:", e);
            break; // si falla la edición, sale del bucle
        }
    }

    await delay(2000);
    await conn.sendMessage(m.chat, { 
        text: `⚠️ *ATENCIÓN ${user}* ⚠️\n\nTus datos han sido enviados a un servidor remoto. Contacta a ${hacker} para recuperar el control... o dile adiós a tu privacidad 😈`,
        mentions: [mentionedJid], 
        edit: key
    });
};

handler.help = ['asustar @usuario', 'hackear @usuario'];
handler.tags = ['diversion'];
handler.command = ['asustar', 'hackear'];

export default handler;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));