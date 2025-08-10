import { DateTime } from 'luxon'

let baseTimeUTC = null // Guardamos la hora base en UTC

const zonas = {
  MX: 'America/Mexico_City',
  CO: 'America/Bogota',
  PE: 'America/Lima',
  CL: 'America/Santiago',
  AR: 'America/Argentina/Buenos_Aires'
}

// Función para convertir la hora que da el usuario a UTC
function parseHoraUsuario(horaStr, zonaStr) {
  const zona = zonas[zonaStr.toUpperCase()]
  if (!zona) throw new Error('Zona horaria inválida')

  // Si la hora contiene "am" o "pm" (ignorando mayúsculas), parsear formato 12h
  if (/am|pm/i.test(horaStr)) {
    const dt12 = DateTime.fromFormat(horaStr, 'h:mm a', { zone: zona })
    if (!dt12.isValid) throw new Error('Hora inválida en formato 12h')
    const now = DateTime.now().setZone(zona)
    return dt12.set({ year: now.year, month: now.month, day: now.day }).toUTC()
  } else {
    // Sino, asumir formato 24h (H:mm)
    const dt24 = DateTime.fromFormat(horaStr, 'H:mm', { zone: zona })
    if (!dt24.isValid) throw new Error('Hora inválida en formato 24h')
    const now = DateTime.now().setZone(zona)
    return dt24.set({ year: now.year, month: now.month, day: now.day }).toUTC()
  }
}

// Función para mostrar la hora en cada zona desde base UTC
function mostrarHorasDesdeUTC(utcTime) {
  const lines = []
  for (const [code, zone] of Object.entries(zonas)) {
    const dt = utcTime.setZone(zone)
    const horaFormateada = dt.toFormat('h:mm a')
    const pais = {
      MX: 'MÉXICO 🇲🇽',
      CO: 'COLOMBIA 🇨🇴',
      PE: 'PERÚ 🇵🇪',
      CL: 'CHILE 🇨🇱',
      AR: 'ARGENTINA 🇦🇷'
    }[code]
    lines.push(`• ${horaFormateada} ${pais}`)
  }
  return lines.join('\n')
}

// En el handler:
const handler = async (m, { conn, command, args }) => {
  if (command.toLowerCase() === 'hora') {
    if (args.length < 2) return m.reply('Uso: !hora <hora> <zona>\nEjemplo: !hora "7:30 am" MX')
    
    // Unimos todos menos el último para la hora (por si ponen "7:30 am")
    const zonaStr = args[args.length -1]
    const horaStr = args.slice(0, args.length -1).join(' ')

    try {
      baseTimeUTC = parseHoraUsuario(horaStr, zonaStr)
      const mensajeHoras = mostrarHorasDesdeUTC(baseTimeUTC)
      return m.reply(`✅ Horarios ajustados:\n${mensajeHoras}`)
    } catch (e) {
      return m.reply('Error: ' + e.message)
    }
  }

  // ... resto del código de lista usando baseTimeUTC para mostrar las horas dinámicas
  
  // Cuando generes el embed, si baseTimeUTC existe, muestra las horas, si no muestra texto default
  const listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbedConMentions(escuadra, suplentes).text
  }, { quoted: m })

  // ...
}

// En la función que genera el mensaje, usamos baseTimeUTC para armar el texto de horas

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