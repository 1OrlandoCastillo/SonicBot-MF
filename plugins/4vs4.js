let partidas = {}

const handler = async (m, { conn, args }) => {
    if (args.length < 2) {
        conn.reply(m.chat, 'Debes proporcionar la hora y el país.', m);
        return;
    }

    // --- Horas ---
    let horaUsuario = args[0]
    const pais = args[1].toUpperCase()

    const diferenciasHorarias = { MX: 0, CO: 1, CL: 2, AR: 3 }
    if (!(pais in diferenciasHorarias)) {
        conn.reply(m.chat, 'País no válido. Usa MX, CO, CL o AR.', m)
        return
    }

    const [hora, minutos] = horaUsuario.split(':').map(n => parseInt(n))
    const diferenciaHoraria = diferenciasHorarias[pais]

    const horasEnPais = []
    for (let i = 0; i < 2; i++) {
        const horaActual = new Date()
        horaActual.setHours(hora + i)
        horaActual.setMinutes(minutos)
        horaActual.setSeconds(0)

        const horaEnPais = new Date(horaActual.getTime() + (3600000 * diferenciaHoraria))
        horasEnPais.push(horaEnPais)
    }

    const formatTime = (date) => date.toLocaleTimeString('es', { hour12: false, hour: '2-digit', minute: '2-digit' })
    const hora1 = formatTime(horasEnPais[0])
    const hora2 = formatTime(horasEnPais[1])

    // --- Mensaje inicial ---
    const message = `
ㅤㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭───────────────╮
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
┊ • ${hora1}
┊ • ${hora2}
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\` 👑
┊ ⚜️ ➤ 
┊ ⚜️ ➤ 
┊ ⚜️ ➤ 
┊ ⚜️ ➤ 
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\` 
┊ ⚜️ ➤ 
┊ ⚜️ ➤ 
╰───────────────╯

❤️ = Participar | 👍 = Suplente
• Lista activa por 5 minutos
`.trim()

    let sentMsg = await conn.sendMessage(m.chat, { text: message }, { quoted: m })

    // Guardar partida
    partidas[sentMsg.key.id] = {
        chat: m.chat,
        jugadores: [],
        suplentes: [],
        timeout: setTimeout(() => {
            delete partidas[sentMsg.key.id]
            conn.sendMessage(m.chat, { text: "⏱️ La lista se cerró automáticamente (5 minutos)" })
        }, 5 * 60 * 1000) // 5 minutos
    }
}

// --- Reacciones ---
export function setupReactions(conn) {
    conn.ev.on("messages.update", async (updates) => {
        for (let update of updates) {
            if (!update.update?.reaction) continue

            let reaction = update.update.reaction
            let msgId = reaction.key.id
            let chatId = reaction.key.remoteJid
            let user = update.key.participant || update.key.remoteJid
            let emoji = reaction.text

            if (!partidas[msgId]) continue
            let partida = partidas[msgId]

            // Eliminar duplicados
            partida.jugadores = partida.jugadores.filter(u => u !== user)
            partida.suplentes = partida.suplentes.filter(u => u !== user)

            if (emoji === "❤️") {
                if (partida.jugadores.length < 4) partida.jugadores.push(user)
            } else if (emoji === "👍" || emoji === "👍🏻") {
                if (partida.suplentes.length < 2) partida.suplentes.push(user)
            }

            // Actualizar mensaje
            let texto = `
ㅤㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭───────────────╮
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
┊ • ${new Date().toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit', hour12:false})}
┊ • ${new Date(Date.now()+3600000).toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit', hour12:false})}
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\` 👑
${partida.jugadores.map(p => `┊ ⚜️ ➤ @${p.split('@')[0]}`).join('\n') || "┊ ⚜️ ➤ Vacante\n┊ ⚜️ ➤ Vacante\n┊ ⚜️ ➤ Vacante\n┊ ⚜️ ➤ Vacante"}
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\` 
${partida.suplentes.map(p => `┊ ⚜️ ➤ @${p.split('@')[0]}`).join('\n') || "┊ ⚜️ ➤ Vacante\n┊ ⚜️ ➤ Vacante"}
╰───────────────╯

❤️ = Participar | 👍 = Suplente
• Lista activa por 5 minutos
            `.trim()

            await conn.sendMessage(chatId, { text: texto, mentions: [...partida.jugadores, ...partida.suplentes] })
        }
    })
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(4vs4|vs4)$/i
export default handler