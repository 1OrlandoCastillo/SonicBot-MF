// 🔥 Guardamos partidas activas
let partidas = {}

const comando4vs4 = async (m, { conn, args }) => {
    if (args.length < 2) return conn.sendMessage(m.chat, { text: 'Debes poner la hora y el país. Ej: .4vs4 21 MX' }, { quoted: m })

    // Validar y formatear hora
    let hora = args[0].replace('hr', ':00')
    if (!hora.includes(':')) hora += ':00'

    const pais = args[1].toUpperCase()
    const diferenciasHorarias = { MX: 0, CO: 1, CL: 2, AR: 3 }
    if (!(pais in diferenciasHorarias)) return conn.sendMessage(m.chat, { text: 'País no válido. Usa MX, CO, CL o AR.' }, { quoted: m })

    const horaBase = parseInt(hora.split(':')[0])
    const minBase = parseInt(hora.split(':')[1])
    const format = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

    let horarios = []
    for (let i = 0; i < 2; i++) horarios.push(format((horaBase + i) % 24, minBase))

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

    // Mandamos mensaje inicial
    let msg = await conn.sendMessage(m.chat, { text: plantilla() }, { quoted: m })

    // Guardamos en memoria
    partidas[msg.key.id] = {
        chat: m.chat,
        id: msg.key.id,
        horarios,
        pais,
        jugadores: [],
        suplentes: []
    }

    // Borrar en 5 minutos
    setTimeout(() => delete partidas[msg.key.id], 5 * 60 * 1000)
}

comando4vs4.help = ['4vs4']
comando4vs4.tags = ['freefire']
comando4vs4.command = /^(4vs4|vs4)$/i
export default comando4vs4


// 📌 Evento de reacciones
export function setupReactions(conn) {
    conn.ev.on('messages.reaction', async reaction => {
        try {
            const id = reaction.key?.id
            if (!id || !(id in partidas)) return

            let data = partidas[id]
            let emoji = reaction.text

            // Identificar usuario que reaccionó
            let user = `@${reaction.key.participant.split('@')[0]}`

            // ❤️ = jugador, 👍 = suplente
            if (emoji === '❤️') {
                if (!data.jugadores.includes(user)) data.jugadores.push(user)
                data.suplentes = data.suplentes.filter(u => u !== user)
            } else if (emoji === '👍') {
                if (!data.suplentes.includes(user)) data.suplentes.push(user)
                data.jugadores = data.jugadores.filter(u => u !== user)
            } else return

            // Plantilla actualizada
            const plantilla = (jugadores = [], suplentes = []) => `
ㅤㅤ4 𝗩𝗘𝗥𝗦𝗨𝗦 4
╭───────────────╮
┊ ⏱️ 𝗛𝗢𝗥𝗔𝗥𝗜𝗢
┊ • ${data.horarios[0]} ${data.pais}
┊ • ${data.horarios[1]} ${data.pais}
┊ » 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 👑
${jugadores.map(j => `┊ ⚜️ ➤ ${j}`).join('\n') || '┊ ⚜️ ➤ '}
┊
┊ » 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:
${suplentes.map(s => `┊ ⚜️ ➤ ${s}`).join('\n') || '┊ ⚜️ ➤ '}
╰───────────────╯
`.trim()

            // Editamos mensaje y mencionamos a los usuarios
            await conn.sendMessage(data.chat, {
                edit: id, // editar mensaje original
                text: plantilla(data.jugadores, data.suplentes),
                mentions: [...data.jugadores, ...data.suplentes].map(u => u.replace('@', '') + '@s.whatsapp.net')
            })

        } catch (e) {
            console.error('Error en reacción:', e)
        }
    })
}