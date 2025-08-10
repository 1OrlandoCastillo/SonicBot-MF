// Definición de zonas horarias con offset en horas (sin DLS)
const zonas = {
  MX: -6,  // Ciudad de México UTC-6
  CO: -5,  // Colombia UTC-5
  PE: -5,  // Perú UTC-5
  CL: -4,  // Chile UTC-4
  AR: -3   // Argentina UTC-3
}

// Variables globales para la hora base UTC y listas (simula tus datos)
let baseTimeUTC = null
let escuadra = []  // lista de jugadores activos
let suplentes = [] // lista de suplentes

function parseHoraUsuario(horaStr) {
  horaStr = horaStr.trim().toLowerCase()
  let ampm = null
  if (horaStr.endsWith('am') || horaStr.endsWith('pm')) {
    ampm = horaStr.slice(-2)
    horaStr = horaStr.slice(0, -2).trim()
  }
  let parts = horaStr.split(':')
  let hora = 0
  let minuto = 0

  if (parts.length === 1) {
    hora = parseInt(parts[0])
  } else if (parts.length === 2) {
    hora = parseInt(parts[0])
    minuto = parseInt(parts[1])
  } else {
    throw new Error('Formato de hora inválido')
  }

  if (isNaN(hora) || isNaN(minuto)) throw new Error('Hora inválida')

  if (ampm) {
    if (hora < 1 || hora > 12) throw new Error('Hora inválida en formato 12h')
    if (ampm === 'pm' && hora !== 12) hora += 12
    if (ampm === 'am' && hora === 12) hora = 0
  } else {
    if (hora < 0 || hora > 23) throw new Error('Hora inválida en formato 24h')
  }

  return { hora, minuto }
}

function convertirAHoraUTC(hora, minuto, zonaOffset) {
  let now = new Date()
  let dateLocal = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hora, minuto))
  let utcMs = dateLocal.getTime() + (zonaOffset * 60 * 60 * 1000)
  return new Date(utcMs)
}

function mostrarHorasDesdeUTC(utcDate) {
  const paises = {
    MX: 'MÉXICO 🇲🇽',
    CO: 'COLOMBIA 🇨🇴',
    PE: 'PERÚ 🇵🇪',
    CL: 'CHILE 🇨🇱',
    AR: 'ARGENTINA 🇦🇷'
  }
  const lines = []
  for (const [code, offset] of Object.entries(zonas)) {
    let localMs = utcDate.getTime() + (offset * 60 * 60 * 1000)
    let localDate = new Date(localMs)

    let h = localDate.getUTCHours()
    let m = localDate.getUTCMinutes()
    let ampm = h >= 12 ? 'pm' : 'am'
    let hora12 = h % 12
    if (hora12 === 0) hora12 = 12
    let minutoStr = m < 10 ? '0' + m : m
    lines.push(`• ${hora12}:${minutoStr} ${ampm} ${paises[code]}`)
  }
  return lines.join('\n')
}

function generarEmbedConMentions(escuadra, suplentes) {
  const mentions = []

  function formatUser(u, isLeader = false) {
    mentions.push(u.jid)
    const icon = isLeader ? '👑' : '⚜️'
    return `┊ ${icon} ➤ @${u.nombre}`
  }

  const escuadraText = escuadra.length
    ? escuadra.map((u, i) => formatUser(u, i === 0)).join('\n')
    : `┊ 👑 ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤`

  const suplentesText = suplentes.length
    ? suplentes.map(u => formatUser(u)).join('\n')
    : `┊ ⚜️ ➤ \n┊ ⚜️ ➤`

  let horasTexto = '• 5:00am MÉXICO 🇲🇽\n• 6:00am COLOMBIA 🇨🇴\n• 6:00am PERÚ 🇵🇪\n• 7:00am CHILE 🇨🇱\n• 8:00am ARGENTINA 🇦🇷'
  if (baseTimeUTC) {
    horasTexto = mostrarHorasDesdeUTC(baseTimeUTC)
  }

  const text = `ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭─────────────╮
┊ \`𝗠𝗢𝗗𝗢:\` \`\`\`CLK\`\`\`
┊
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
${horasTexto}
┊
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\`
${escuadraText}
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\`
${suplentesText}
╰─────────────╯

❤️ = Participar | 👍 = Suplente

• Lista Activa Por 5 Minutos`

  return { text, mentions }
}

const handler = async (m, { conn, command, args }) => {
  if (command.toLowerCase() === 'partido') {
    if (args.length < 2) return m.reply('Uso: .partido <hora> <zona>\nEjemplo: .partido "7:30 am" MX')

    const zonaStr = args[args.length - 1].toUpperCase()
    const horaStr = args.slice(0, args.length - 1).join(' ')

    if (!zonas[zonaStr]) return m.reply('Zona inválida. Usa: MX, CO, PE, CL, AR')

    try {
      const { hora, minuto } = parseHoraUsuario(horaStr)
      baseTimeUTC = convertirAHoraUTC(hora, minuto, zonas[zonaStr])

      const mensajeHoras = mostrarHorasDesdeUTC(baseTimeUTC)
      await m.reply(`✅ Horarios ajustados:\n${mensajeHoras}`)
    } catch (e) {
      return m.reply('Error: ' + e.message)
    }
  } else {
    // Aquí manejas otras acciones de tu bot, por ejemplo mostrar la lista con las horas actualizadas
    if (!baseTimeUTC) {
      return m.reply('Primero usa el comando .partido para fijar la hora.')
    }

    // Envías la lista con las horas usando baseTimeUTC
    const listaMsg = await conn.sendMessage(m.chat, {
      text: generarEmbedConMentions(escuadra, suplentes).text
    }, { quoted: m })
  }
}

export default handler