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

    // guardar en memoria
    partidas[msg.key.id] = { chat: m.chat, jugadores: [], suplentes: [] }

    // borrar en 5 min
    setTimeout(() => delete partidas[msg.key.id], 5 * 60 * 1000)
}

comando4vs4.help = ['4vs4']
comando4vs4.tags = ['freefire']
comando4vs4.command = /^(4vs4|vs4)$/i
export default comando4vs4


// 📌 EVENTO DE REACCIONES
export function setupReactions(conn) {
    conn.ev.on('messages.update', async update => {
        for (let { key, update: upd } of update) {
            if (!upd.reactions) continue
            for (let reaction of upd.reactions) {
                let id = reaction.key?.id
                if (!id || !(id in partidas)) continue

                let user = `@${reaction.key.participant.split('@')[0]}`
                let data = partidas[id]

                if (reaction.text === '❤️') {
                    if (!data.jugadores.includes(user)) data.jugadores.push(user)
                    data.suplentes = data.suplentes.filter(u => u !== user)
                } else if (reaction.text === '👍') {
                    if (!data.suplentes.includes(user)) data.suplentes.push(user)
                    data.jugadores = data.jugadores.filter(u => u !== user)
                } else continue

                // re-editar mensaje
                const plantilla = (jugadores = [], suplentes = []) => `
ㅤㅤ4 𝗩𝗘𝗥𝗦𝗨𝗦 4
╭───────────────╮
┊ ⏱️ 𝗛𝗢𝗥𝗔𝗥𝗜𝗢
┊ • ...
┊ » 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 👑
${jugadores.map(j => `┊ ⚜️ ➤ ${j}`).join('\n') || '┊ ⚜️ ➤ '}
┊
┊ » 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:
${suplentes.map(s => `┊ ⚜️ ➤ ${s}`).join('\n') || '┊ ⚜️ ➤ '}
╰───────────────╯
`.trim()

                await conn.sendMessage(data.chat, {
                    edit: id,
                    text: plantilla(data.jugadores, data.suplentes),
                    mentions: [...data.jugadores, ...data.suplentes].map(u => u.replace('@', '') + '@s.whatsapp.net')
                })
            }
        }
    })
}