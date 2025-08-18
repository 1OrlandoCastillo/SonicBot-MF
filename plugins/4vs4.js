let partidas = {} // guardamos temporalmente las partidas activas

const handler = async (m, { conn, args }) => {
    if (args.length < 2) {
        conn.reply(m.chat, 'Debes poner la hora (HH:MM) y el país (MX, CO, CL, AR).', m)
        return
    }

    const horaRegex = /^([01]?\d|2[0-3]):?([0-5]\d)?(hr)?$/i
    if (!horaRegex.test(args[0])) {
        conn.reply(m.chat, 'Formato incorrecto. Usa HH:MM en 24h o por ejemplo 21hr.', m)
        return
    }

    let hora = args[0].replace('hr', ':00')
    const pais = args[1].toUpperCase()

    const diferenciasHorarias = { MX: 0, CO: 1, CL: 2, AR: 3 }
    if (!(pais in diferenciasHorarias)) {
        conn.reply(m.chat, 'País no válido. Usa MX, CO, CL o AR.', m)
        return
    }

    const horaBase = parseInt(hora.split(':')[0])
    const minBase = parseInt(hora.split(':')[1])

    const format = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    let horarios = []
    for (let i = 0; i < 2; i++) {
        horarios.push(format((horaBase + i) % 24, minBase))
    }

    const plantilla = (jugadores = [], suplentes = []) => `
ㅤㅤ4 𝗩𝗘𝗥𝗦𝗨𝗦 4
╭───────────────╮
┊ ⏱️ 𝗛𝗢𝗥𝗔𝗥𝗜𝗢
┊ • ${horarios[0]} ${pais}
┊ • ${horarios[1]} ${pais}
┊ » 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 👑
${jugadores.map(j => `┊ ⚜️ ➤ ${j}`).join('\n') || '┊ ⚜️ ➤ '}
┊
┊ » 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:
${suplentes.map(s => `┊ ⚜️ ➤ ${s}`).join('\n') || '┊ ⚜️ ➤ '}
╰───────────────╯

❤️ = Participar | 👍 = Suplente
• Lista activa por 5 minutos
`.trim()

    let msg = await conn.sendMessage(m.chat, { text: plantilla() }, { quoted: m })

    // guardamos esta partida en memoria
    partidas[msg.key.id] = { chat: m.chat, jugadores: [], suplentes: [] }

    // después de 5 minutos se elimina
    setTimeout(() => delete partidas[msg.key.id], 5 * 60 * 1000)
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(4vs4|vs4)$/i
export default handler

// Escuchar reacciones
export async function handlerReaction({ m, conn }) {
    try {
        if (!m.key || !m.key.id) return
        let id = m.key.id
        if (!(id in partidas)) return

        let user = `@${m.participant.split('@')[0]}`
        let data = partidas[id]

        if (m.reaction === '❤️') {
            if (!data.jugadores.includes(user)) data.jugadores.push(user)
            data.suplentes = data.suplentes.filter(u => u !== user)
        } else if (m.reaction === '👍') {
            if (!data.suplentes.includes(user)) data.suplentes.push(user)
            data.jugadores = data.jugadores.filter(u => u !== user)
        } else return

        await conn.sendMessage(data.chat, {
            edit: { id: id, fromMe: false }, // editar mensaje original
            text: plantilla(data.jugadores, data.suplentes),
            mentions: [...data.jugadores, ...data.suplentes].map(u => u.replace('@', '') + '@s.whatsapp.net')
        })
    } catch (e) {
        console.error(e)
    }
}