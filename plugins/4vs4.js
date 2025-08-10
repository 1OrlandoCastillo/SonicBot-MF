let baseHora = null  // { h: número, m: número }
let baseZona = null  // 'MX', 'CO', etc.

const zonas = {
  MX: -6,
  CO: -5,
  PE: -5,
  CL: -4,
  AR: -3
}

// Función para parsear hora sencilla, acepta formato "7:30 am", "19:41", "8 am", etc.
function parseHoraSimple(horaStr) {
  horaStr = horaStr.trim().toLowerCase()
  let h, m = 0
  const ampmMatch = horaStr.match(/(am|pm)$/)
  const tieneAmPm = !!ampmMatch

  // Quitar am/pm para parsear números
  let horaSolo = horaStr.replace(/(am|pm)$/, '').trim()

  // Partir por ":"
  const partes = horaSolo.split(':')
  if (partes.length === 1) {
    h = parseInt(partes[0])
    m = 0
  } else if (partes.length === 2) {
    h = parseInt(partes[0])
    m = parseInt(partes[1])
  } else {
    throw new Error('Formato de hora inválido')
  }

  if (isNaN(h) || isNaN(m)) throw new Error('Hora o minutos inválidos')

  if (tieneAmPm) {
    const ampm = ampmMatch[0]
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
  }

  if (h < 0 || h > 23) throw new Error('Hora fuera de rango')
  if (m < 0 || m > 59) throw new Error('Minutos fuera de rango')

  return { h, m }
}

// Función para convertir la hora base a las otras zonas (simple offset en horas)
function mostrarHorasSimple(h, m, zonaOrigen) {
  if (!(zonaOrigen in zonas)) throw new Error('Zona horaria inválida')

  const offsetOrigen = zonas[zonaOrigen]
  const lines = []

  for (const [code, offset] of Object.entries(zonas)) {
    // Diferencia horaria con zona origen
    let horaZona = h + (offset - offsetOrigen)
    let minutosZona = m

    // Ajustar horas que pasen 0-23
    if (horaZona < 0) horaZona += 24
    if (horaZona >= 24) horaZona -= 24

    // Formatear a 12h con am/pm
    let ampm = 'am'
    let displayH = horaZona
    if (displayH === 0) displayH = 12
    else if (displayH >= 12) {
      ampm = 'pm'
      if (displayH > 12) displayH -= 12
    }
    const minStr = minutosZona.toString().padStart(2, '0')
    const horaFormateada = `${displayH}:${minStr} ${ampm}`

    const paises = {
      MX: 'MÉXICO 🇲🇽',
      CO: 'COLOMBIA 🇨🇴',
      PE: 'PERÚ 🇵🇪',
      CL: 'CHILE 🇨🇱',
      AR: 'ARGENTINA 🇦🇷'
    }
    lines.push(`• ${horaFormateada} ${paises[code]}`)
  }

  return lines.join('\n')
}

// El handler principal:
const handler = async (m, { conn, command, args }) => {
  if (command.toLowerCase() === 'partido') {
    if (args.length < 2) return m.reply('Uso: .partido <hora> <zona>\nEjemplo: .partido "7:30 am" MX')

    const zonaStr = args[args.length -1].toUpperCase()
    const horaStr = args.slice(0, args.length -1).join(' ')

    try {
      baseHora = parseHoraSimple(horaStr)
      baseZona = zonaStr
      const mensajeHoras = mostrarHorasSimple(baseHora.h, baseHora.m, baseZona)
      return m.reply(`✅ Horarios ajustados:\n${mensajeHoras}`)
    } catch (e) {
      return m.reply('Error: ' + e.message)
    }
  }

  // El resto de tu código que use baseHora y baseZona para mostrar horas dinámicas
  // Por ejemplo, en generarEmbedConMentions

  // Aquí ejemplo mínimo para mostrar mensaje (añade tu lógica completa):
  const escuadra = []  // Debes mantener o adaptar según tu código original
  const suplentes = []

  const listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbedConMentions(escuadra, suplentes).text
  }, { quoted: m })
}

// Función que genera el mensaje con las horas:
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

  let horasTexto = '• 5:00 am MÉXICO 🇲🇽\n• 6:00 am COLOMBIA 🇨🇴\n• 6:00 am PERÚ 🇵🇪\n• 7:00 am CHILE 🇨🇱\n• 8:00 am ARGENTINA 🇦🇷'
  if (baseHora && baseZona) {
    horasTexto = mostrarHorasSimple(baseHora.h, baseHora.m, baseZona)
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