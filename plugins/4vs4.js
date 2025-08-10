const { DateTime } = require('luxon')

let baseTimeUTC = null

const zonas = {
  MX: 'America/Mexico_City',
  CO: 'America/Bogota',
  PE: 'America/Lima',
  CL: 'America/Santiago',
  AR: 'America/Argentina/Buenos_Aires'
}

function parseHoraUsuario(horaStr, zonaStr) {
  const zona = zonas[zonaStr.toUpperCase()]
  if (!zona) throw new Error('Zona horaria inválida')

  let dt = DateTime.fromFormat(horaStr.toLowerCase(), 'h:mm a', { zone: zona })
  if (!dt.isValid) dt = DateTime.fromFormat(horaStr, 'H:mm', { zone: zona })
  if (!dt.isValid) throw new Error('Hora inválida')

  const now = DateTime.now().setZone(zona)
  dt = dt.set({ year: now.year, month: now.month, day: now.day })

  return dt.toUTC()
}

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

const handler = async (m, { conn, command, args }) => {
  if (command.toLowerCase() === 'partido') {
    if (args.length < 2) return m.reply('Uso: .partido <hora> <zona>\nEjemplo: .partido 8:00 am MX')

    const zonaStr = args[args.length - 1]
    const horaStr = args.slice(0, args.length - 1).join(' ')

    try {
      baseTimeUTC = parseHoraUsuario(horaStr, zonaStr)
      // Solo confirmamos que se actualizó sin mostrar las horas
      return m.reply('✅ Hora base ajustada correctamente. Al mostrar la lista, las horas serán actualizadas automáticamente.')
    } catch (e) {
      return m.reply('Error: ' + e.message)
    }
  }
  
  // Aquí va tu código para manejar lista o lo que necesites, usando baseTimeUTC para mostrar horas dinámicas

  // Ejemplo de enviar lista:
  // const listaMsg = await conn.sendMessage(m.chat, {
  //   text: generarEmbedConMentions(escuadra, suplentes).text
  // }, { quoted: m })

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

  return {
    text: `ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
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

• Lista Activa Por 5 Minutos`,
    mentions
  }
}