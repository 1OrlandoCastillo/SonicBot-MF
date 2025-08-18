// Guardamos partidas activas
let partidas = {}

const comando4vs4 = async (m, { conn, args }) => {
    if (args.length < 2) {
        return conn.sendMessage(m.chat, { text: 'Debes poner la hora y el país. Ej: .4vs4 21 MX' }, { quoted: m })
    }

    const horaRegex = /^([01]?\d|2[0-3]):?([0-5]\d)?(hr)?$/i
    if (!horaRegex.test(args[0])) {
        return conn.sendMessage(m.chat, { text: 'Formato incorrecto. Usa 21, 21:30 o 21hr.' }, { quoted: m })
    }

    let hora = args[0].replace('hr', ':00')
    const pais = args[1].toUpperCase()
    const diferenciasHorarias = { MX: 0, CO: 1, CL: 2, AR: 3 }
    if (!(pais in diferenciasHorarias)) {
        return conn.sendMessage(m.chat, { text: 'País no válido. Usa MX, CO, CL o AR.' }, { quoted: m })
    }

    const horaBase = parseInt(hora.split(':')[0])
    const minBase = parseInt(hora.split(':')[1])

    const format = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    let horarios = []
    for (let i = 0; i < 2; i++) {
        horarios.push(format((horaBase + i) % 24, minBase))
    }

    const plantilla = (jugadores = [], suplentes = [], horarios = [], pais = '') => `
ㅤㅤ4 𝗩𝗘𝗥𝗦𝗨𝗦 4
╭───────────────╮
┊ ⏱️ 𝗛𝗢𝗥𝗔𝗥𝗜𝗢
${horarios.map(h => `┊ • ${h} ${pais}`).join('\n')}
┊ » 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 👑
${jugadores.map(j => `┊ ⚜️ ➤ ${j}`).join('\n') || '┊ ⚜️ ➤ '}
┊
┊ » 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:
${suplentes.map(s => `┊ ⚜️ ➤ ${s}`).join('\n') || '┊ ⚜️ ➤ '}
╰───────────────╯

❤️ = Escuadra/Jugador | 👍 = Suplente
• Lista activa por 5 minutos
`.trim()

    let msg = await conn.sendMessage(m.chat, { text: plantilla([], [], horarios, pais) }, { quoted: m })

    partidas[msg.key.id] = { chat: m.chat, jugadores: [], suplentes: [], horarios, pais }

    setTimeout(() => delete partidas[msg.key.id], 5 * 60 * 1000)
}

comando4vs4.help = ['4vs4']
comando4vs4.tags = ['freefire']
comando4vs4.command = /^(4vs4|vs4)$/i
export default comando4vs4

// 📌 EVENTO DE REACCIONES
export function setupReactions(conn) {
    conn.ev.on('messages.update', async updates => {
        for (let { key, update: upd } of updates) {
            if (!upd.reactions) continue

            for (let reaction of upd.reactions) {
                const msgId = reaction.key?.id
                if (!msgId || !(msgId in partidas)) continue

                const user = `@${reaction.key.participant.split('@')[0]}`
                const data = partidas[msgId]

                // ❤️ = Jugador / Escuadra
                if (reaction.text === '❤️') {
                    if (data.jugadores.includes(user)) return
                    if (data.jugadores.length >= 4) {
                        await conn.sendMessage(data.chat, { text: `${user} ⚠️ Ya hay 4 jugadores.`, mentions: [reaction.key.participant] })
                        return
                    }
                    data.jugadores.push(user)
                    data.suplentes = data.suplentes.filter(u => u !== user)

                // 👍 = Suplente
                } else if (reaction.text === '👍🏻' || reaction.text === '👍') {
                    if (data.suplentes.includes(user)) return
                    if (data.suplentes.length >= 4) {
                        await conn.sendMessage(data.chat, { text: `${user} ⚠️ Ya hay 4 suplentes.`, mentions: [reaction.key.participant] })
                        return
                    }
                    data.suplentes.push(user)
                    data.jugadores = data.jugadores.filter(u => u !== user)

                } else continue

                // Plantilla actualizada
                const plantilla = (jugadores = [], suplentes = [], horarios = [], pais = '') => `
ㅤㅤ4 𝗩𝗘𝗥𝗦𝗨𝗦 4
╭───────────────╮
┊ ⏱️ 𝗛𝗢𝗥𝗔𝗥𝗜𝗢
${horarios.map(h => `┊ • ${h} ${pais}`).join('\n')}
┊ » 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 👑
${jugadores.map(j => `┊ ⚜️ ➤ ${j}`).join('\n') || '┊ ⚜️ ➤ '}
┊
┊ » 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:
${suplentes.map(s => `┊ ⚜️ ➤ ${s}`).join('\n') || '┊ ⚜️ ➤ '}
╰───────────────╯

❤️ = Escuadra/Jugador | 👍 = Suplente
• Lista activa por 5 minutos
`.trim()

                // Editar mensaje original
                try {
                    await conn.sendMessage(data.chat, {
                        text: plantilla(data.jugadores, data.suplentes, data.horarios, data.pais),
                        mentions: [...data.jugadores, ...data.suplentes].map(u => u.replace('@', '') + '@s.whatsapp.net'),
                        edit: msgId
                    })
                } catch (err) {
                    console.error('Error al actualizar mensaje 4vs4:', err)
                }
            }
        }
    })
}