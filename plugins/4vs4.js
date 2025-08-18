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
ㅤㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭───────────────╮
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
┊ • ${horaUsuario}
┊ • ${pais}
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\` 👑
┊ ⚜️ ➤ Vacante
┊ ⚜️ ➤ Vacante
┊ ⚜️ ➤ Vacante
┊ ⚜️ ➤ Vacante
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\` 
┊ ⚜️ ➤ Vacante
┊ ⚜️ ➤ Vacante
╰───────────────╯

❤️ = Participar | 👍🏻 = Suplente
• Lista activa por 5 minutos
`.trim();

    let sentMsg = await conn.sendMessage(m.chat, { text: message }, { quoted: m });

    partidas[sentMsg.key.id] = {
        chat: m.chat,
        jugadores: [],
        suplentes: [],
        msgId: sentMsg.key.id,
        completa: false,
        horaUsuario,
        pais
    };

    setTimeout(() => delete partidas[sentMsg.key.id], 5 * 60 * 1000);
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

        if (partida.completa) return;

        const isRemove = reaction.remove || false;

        if (isRemove) {
            partida.jugadores = partida.jugadores.filter(u => u !== user);
            partida.suplentes = partida.suplentes.filter(u => u !== user);
            partida.completa = false;
        } else {
            partida.jugadores = partida.jugadores.filter(u => u !== user);
            partida.suplentes = partida.suplentes.filter(u => u !== user);

            if (emoji === "❤️") {
                if (partida.jugadores.length < 4) partida.jugadores.push(user);
            } else if (emoji === "👍🏻") {
                if (partida.suplentes.length < 2) partida.suplentes.push(user);
            } else return;
        }

        // Construir plantilla actualizada con 👑 para el primer jugador
        const escuadraTexto = ['┊ » `𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔` 👑'];
        for (let i = 0; i < 4; i++) {
            if (partida.jugadores[i]) {
                const icono = i === 0 ? '👑' : '⚜️';
                escuadraTexto.push(`┊ ${icono} ➤ @${partida.jugadores[i].split('@')[0]}`);
            } else {
                escuadraTexto.push('┊ ⚜️ ➤ Vacante');
            }
        }

        const suplentesTexto = ['┊ » `𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:`'];
        for (let i = 0; i < 2; i++) {
            suplentesTexto.push('┊ ⚜️ ➤ ' + (partida.suplentes[i] ? '@' + partida.suplentes[i].split('@')[0] : 'Vacante'));
        }

        if (partida.jugadores.length === 4 && partida.suplentes.length === 2) {
            partida.completa = true;
        }

        const texto = `
ㅤㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭───────────────╮
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
┊ • ${partida.horaUsuario}
┊ • ${partida.pais}
${escuadraTexto.join('\n')}
${suplentesTexto.join('\n')}
╰───────────────╯

❤️ = Participar | 👍🏻 = Suplente
• Lista activa por 5 minutos
${partida.completa ? "\n✅ Partida completa" : ""}
        `.trim();

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