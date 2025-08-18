// Guardamos partidas activas en memoria
let partidas = {}

const handler = async (m, { conn, args }) => {
    if (args.length < 2) {
        conn.reply(m.chat, 'Debes proporcionar la hora y el país.', m);
        return;
    }

    // --- aquí va tu lógica de horas como ya la tenías ---
    const horaUsuario = args[0];
    const pais = args[1].toUpperCase();

    const diferenciasHorarias = { MX: 0, CO: 1, CL: 2, AR: 3 };
    if (!(pais in diferenciasHorarias)) {
        conn.reply(m.chat, 'País no válido. Usa MX, CO, CL o AR.', m);
        return;
    }

    const [hora, minutos] = horaUsuario.split(':').map(n => parseInt(n));
    const diferenciaHoraria = diferenciasHorarias[pais];

    const horasEnPais = [];
    for (let i = 0; i < 4; i++) {
        const horaActual = new Date();
        horaActual.setHours(hora + i);
        horaActual.setMinutes(minutos);
        horaActual.setSeconds(0);
        horaActual.setMilliseconds(0);

        const horaEnPais = new Date(horaActual.getTime() + (3600000 * diferenciaHoraria));
        horasEnPais.push(horaEnPais);
    }

    const formatTime = (date) => date.toLocaleTimeString('es', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const horaActual = formatTime(new Date());

    const message = `
*4 𝐕𝐄𝐑𝐒𝐔𝐒 4*

🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : ${formatTime(horasEnPais[0])}
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${formatTime(horasEnPais[1])}
🇨🇱 𝐂𝐇𝐈𝐋𝐄 : ${formatTime(horasEnPais[2])}
🇦🇷 𝐀𝐑𝐆𝐄𝐍𝐓𝐈𝐍𝐀 : ${formatTime(horasEnPais[3])}

𝐇𝐎𝐑𝐀 𝐀𝐂𝐓𝐔𝐀𝐋 𝐄𝐍 𝐌𝐄𝐗𝐈𝐂𝐎🇲🇽 : ${horaActual}

𝗥𝗘𝗔𝗖𝗖𝗜𝗢𝗡𝗘𝗦
❤️ = Jugador
👍 = Suplente
`.trim();

    let sentMsg = await conn.sendMessage(m.chat, { text: message }, { quoted: m });

    // Guardamos la partida en memoria
    partidas[sentMsg.key.id] = {
        chat: m.chat,
        jugadores: [],
        suplentes: []
    };
};

// --- Escuchar reacciones ---
async function reaccionHandler(reaction, conn) {
    let msgId = reaction.key.id;
    let chatId = reaction.key.remoteJid;
    let user = reaction.participant;
    let emoji = reaction.text;

    if (partidas[msgId]) {
        let partida = partidas[msgId];

        // eliminar duplicados
        partida.jugadores = partida.jugadores.filter(u => u !== user);
        partida.suplentes = partida.suplentes.filter(u => u !== user);

        if (emoji === "❤️") {
            if (partida.jugadores.length < 4) partida.jugadores.push(user);
        } else if (emoji === "👍" || emoji === "👍🏻") {
            if (partida.suplentes.length < 2) partida.suplentes.push(user);
        }

        // generar texto actualizado
        let texto = `
*4 𝐕𝐄𝐑𝐒𝐔𝐒 4* (Actualizado)

𝗝𝗨𝗚𝗔𝗗𝗢𝗥𝗘𝗦
${partida.jugadores.map((p, i) => `${i==0?'👑':'🥷🏻'} ┇ @${p.split('@')[0]}`).join('\n') || "Vacante"}

𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦
${partida.suplentes.map(p => `🥷🏻 ┇ @${p.split('@')[0]}`).join('\n') || "Vacante"}
        `.trim();

        await conn.sendMessage(chatId, { text: texto, mentions: [...partida.jugadores, ...partida.suplentes] });
    }
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(4vs4|vs4)$/i
export default handler

// Vincular el listener
export async function before(m, { conn }) {
    conn.ev.on('messages.reaction', async (reaction) => {
        await reaccionHandler(reaction, conn);
    });
}