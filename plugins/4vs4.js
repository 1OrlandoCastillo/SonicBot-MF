let baseTimeUTC = null // no lo usaremos aquí pero lo dejo para referencia

const zonas = {
  MX: 'America/Mexico_City',
  CO: 'America/Bogota'
}

// Texto fijo con horas (solo México y Colombia)
const horasFijas = '• 5:00am MÉXICO 🇲🇽\n• 6:00am COLOMBIA 🇨🇴'

// En la función que genera el mensaje (ejemplo)
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

  const horasTexto = horasFijas

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