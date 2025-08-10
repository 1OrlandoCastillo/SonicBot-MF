let baseHora = null; // Guardamos la hora base como { h, m }
let baseZona = null; // Zona base, ej: "MX"

const offsets = {
  MX: -6, // UTC-6 México
  CO: -5, // UTC-5 Colombia
  PE: -5, // UTC-5 Perú
  CL: -4, // UTC-4 Chile
  AR: -3  // UTC-3 Argentina
}

function parseHoraSimple(horaStr) {
  // horaStr: "7:30 am" o "19:41"
  let parts = horaStr.toLowerCase().split(' ');
  let time = parts[0];
  let ampm = parts[1]; // puede ser undefined si es 24h

  let [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) throw new Error('Hora inválida');

  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;

  return { h, m };
}

function mostrarHorasSimple(h, m, zonaBase) {
  if (!offsets[zonaBase]) throw new Error('Zona base inválida');
  let baseOffset = offsets[zonaBase];

  let lines = [];
  for (const [code, offset] of Object.entries(offsets)) {
    let diff = offset - baseOffset;
    let hour = h + diff;

    if (hour < 0) hour += 24;
    if (hour >= 24) hour -= 24;

    let ampm = hour >= 12 ? 'pm' : 'am';
    let hour12 = hour % 12 || 12;
    let timeStr = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;

    const pais = {
      MX: 'MÉXICO 🇲🇽',
      CO: 'COLOMBIA 🇨🇴',
      PE: 'PERÚ 🇵🇪',
      CL: 'CHILE 🇨🇱',
      AR: 'ARGENTINA 🇦🇷'
    }[code];

    lines.push(`• ${timeStr} ${pais}`);
  }
  return lines.join('\n');
}

// En tu handler
const handler = async (m, { conn, command, args }) => {
  if (command.toLowerCase() === 'hora') {
    if (args.length < 2) return m.reply('Uso: !hora <hora> <zona>\nEjemplo: !hora "7:30 am" MX');

    const zonaStr = args[args.length -1].toUpperCase();
    const horaStr = args.slice(0, args.length -1).join(' ');

    try {
      baseHora = parseHoraSimple(horaStr);
      baseZona = zonaStr;
      const mensajeHoras = mostrarHorasSimple(baseHora.h, baseHora.m, baseZona);
      return m.reply(`✅ Horarios ajustados:\n${mensajeHoras}`);
    } catch (e) {
      return m.reply('Error: ' + e.message);
    }
  }

  // Enviar lista usando baseHora y baseZona
  const listaMsg = await conn.sendMessage(m.chat, {
    text: generarEmbedConMentions(escuadra, suplentes).text
  }, { quoted: m });
}

// En la función que genera el mensaje
function generarEmbedConMentions(escuadra, suplentes) {
  const mentions = [];

  function formatUser(u, isLeader = false) {
    mentions.push(u.jid);
    const icon = isLeader ? '👑' : '⚜️';
    return `┊ ${icon} ➤ @${u.nombre}`;
  }

  const escuadraText = escuadra.length
    ? escuadra.map((u, i) => formatUser(u, i === 0)).join('\n')
    : `┊ 👑 ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤`;

  const suplentesText = suplentes.length
    ? suplentes.map(u => formatUser(u)).join('\n')
    : `┊ ⚜️ ➤ \n┊ ⚜️ ➤`;

  let horasTexto = '• 5:00am MÉXICO 🇲🇽\n• 6:00am COLOMBIA 🇨🇴\n• 6:00am PERÚ 🇵🇪\n• 7:00am CHILE 🇨🇱\n• 8:00am ARGENTINA 🇦🇷';
  if (baseHora && baseZona) {
    horasTexto = mostrarHorasSimple(baseHora.h, baseHora.m, baseZona);
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

• Lista Activa Por 5 Minutos`;

  return { text, mentions };
}