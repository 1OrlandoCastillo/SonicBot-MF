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
👍 = Suplente
`.trim();

    let sentMsg = await conn.sendMessage(m.chat, { text: message }, { quoted: m });

    partidas[sentMsg.key.id] = {
        chat: m.chat,
        jugadores: [],
        suplentes: [],
        msgId: sentMsg.key.id
    };
};

// --- Escuchar actualizaciones de mensajes ---
export function setupReactions(conn) {

    const corazon = ["❤️", "❤", "🧡"];
    const pulgar = ["👍", "👍🏻", "👍🏽"];

    conn.ev.on("messages.update", async (updates) => {
        for (let update of updates) {
            if (!update.update?.reaction) continue;

            const reaction = update.update.reaction;
            const msgId = reaction.key.id;
            const chatId = reaction.key.remoteJid;
            const user = update.key.participant || update.key.remoteJid;

            // Normalizar emoji
            const rawEmoji = reaction?.text;
            if (!rawEmoji) continue;
            const emoji = rawEmoji.trim();

            if (!partidas[msgId]) continue;
            let partida = partidas[msgId];

            const isRemove = reaction.remove || false;

            if (isRemove) {
                // Quitar usuario si elimina su reacción
                partida.jugadores = partida.jugadores.filter(u => u !== user);
                partida.suplentes = partida.suplentes.filter(u => u !== user);
            } else {
                // Limpiar duplicados antes de agregar
                partida.jugadores = partida.jugadores.filter(u => u !== user);
                partida.suplentes = partida.suplentes.filter(u => u !== user);

                if (corazon.some(e => emoji.startsWith(e))) {
                    if (partida.jugadores.length < 4) partida.jugadores.push(user);
                } else if (pulgar.some(e => emoji.startsWith(e))) {
                    if (partida.suplentes.length < 2) partida.suplentes.push(user);
                }
            }

            // Generar lista actualizada
            const texto = `
*4 𝐕𝐄𝐑𝐒𝐔𝐒 4* (Actualizado)

𝗝𝗨𝗚𝗔𝗗𝗢𝗥𝗘𝗦
${partida.jugadores.map((p, i) => `${i===0?'👑':'🥷🏻'} ┇ @${p.split('@')[0]}`).join('\n') || "Vacante"}

𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦
${partida.suplentes.map(p => `🥷🏻 ┇ @${p.split('@')[0]}`).join('\n') || "Vacante"}
            `.trim();

            // Editar el mensaje original en lugar de enviar uno nuevo
            await conn.sendMessage(chatId, {
                text: texto,
                mentions: [...partida.jugadores, ...partida.suplentes],
                edit: partida.msgId
            });
        }
    });
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(4vs4|vs4)$/i
export default handler