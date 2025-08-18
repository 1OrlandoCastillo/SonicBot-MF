// Guardamos partidas activas en memoria
let partidas = {}

const handler = async (m, { conn, args }) => {
    if (args.length < 2) {
        conn.reply(m.chat, 'Debes proporcionar la hora y el país.', m);
        return;
    }

    const horaUsuario = args[0];
    const pais = args[1].toUpperCase();

    const diferenciasHorarias = { MX: 0, CO: 1, CL: 2, AR: 3 };
    if (!(pais in diferenciasHorarias)) {
        conn.reply(m.chat, 'País no válido. Usa MX, CO, CL o AR.', m);
        return;
    }

    const message = `
*4 𝐕𝐄𝐑𝐒𝐔𝐒 4*

𝗥𝗘𝗔𝗖𝗖𝗜𝗢𝗡𝗔 👇
❤️ = Jugador
👍🏻 = Suplente

𝗝𝗨𝗚𝗔𝗗𝗢𝗥𝗘𝗦
Vacante
Vacante
Vacante
Vacante

𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦
Vacante
Vacante
`.trim();

    let sentMsg = await conn.sendMessage(m.chat, { text: message }, { quoted: m });

    partidas[sentMsg.key.id] = {
        chat: m.chat,
        jugadores: [],
        suplentes: [],
        msgId: sentMsg.key.id,
        completa: false
    };
};

// --- Escuchar reacciones ---
export function setupReactions(conn) {
    conn.ev.on("messages.reaction", async ({ reaction }) => {
        if (!reaction) return;

        const msgId = reaction.key.id;
        const chatId = reaction.key.remoteJid;
        const user = reaction.key.participant || reaction.key.remoteJid;
        const emoji = reaction.text?.trim();
        if (!emoji) return;

        if (!partidas[msgId]) return;
        const partida = partidas[msgId];

        if (partida.completa) return; // Bloquear si ya completa

        const isRemove = reaction.remove || false;

        if (isRemove) {
            // Quitar usuario si elimina su reacción
            partida.jugadores = partida.jugadores.filter(u => u !== user);
            partida.suplentes = partida.suplentes.filter(u => u !== user);
            partida.completa = false; // desbloquear si alguien se quita
        } else {
            // Limpiar duplicados
            partida.jugadores = partida.jugadores.filter(u => u !== user);
            partida.suplentes = partida.suplentes.filter(u => u !== user);

            // Solo aceptar ❤️ y 👍🏻
            if (emoji === "❤️") {
                if (partida.jugadores.length < 4) partida.jugadores.push(user);
            } else if (emoji === "👍🏻") {
                if (partida.suplentes.length < 2) partida.suplentes.push(user);
            } else {
                return; // ignorar otros emojis
            }
        }

        // Construir lista con vacantes
        const jugadoresTexto = [];
        for (let i = 0; i < 4; i++) {
            if (partida.jugadores[i]) {
                jugadoresTexto.push(i === 0 ? '👑 ┇ @' + partida.jugadores[i].split('@')[0] : '🥷🏻 ┇ @' + partida.jugadores[i].split('@')[0]);
            } else {
                jugadoresTexto.push("Vacante");
            }
        }

        const suplentesTexto = [];
        for (let i = 0; i < 2; i++) {
            if (partida.suplentes[i]) {
                suplentesTexto.push("🥷🏻 ┇ @" + partida.suplentes[i].split('@')[0]);
            } else {
                suplentesTexto.push("Vacante");
            }
        }

        // Verificar si la partida está completa
        if (partida.jugadores.length === 4 && partida.suplentes.length === 2) {
            partida.completa = true;
        }

        const texto = `
*4 𝐕𝐄𝐑𝐒𝐔𝐒 4*${partida.completa ? " ✅ Partida completa" : " (Actualizado)"}

𝗝𝗨𝗚𝗔𝗗𝗢𝗥𝗘𝗦
${jugadoresTexto.join('\n')}

𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦
${suplentesTexto.join('\n')}
        `.trim();

        // Editar el mensaje original
        await conn.sendMessage(chatId, {
            text: texto,
            mentions: [...partida.jugadores, ...partida.suplentes],
            edit: partida.msgId
        });
    });
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(4vs4|vs4)$/i
export default handler