let toM = a => '@' + a.split('@')[0]

function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function handler(m, { conn, groupMetadata }) {
  let ps = groupMetadata.participants.map(v => v.id)

  const steps = 10
  // Enviar mensaje inicial vacío para barra
  let sentMsg = await conn.reply(m.chat, `⌛ Buscando persona... [□□□□□□□□□□] 0%`, m)

  for (let i = 1; i <= steps; i++) {
    let percent = i * 10
    let progressBar = '■'.repeat(i) + '□'.repeat(steps - i)
    // Editar el mensaje enviado para actualizar barra y porcentaje
    await conn.sendMessage(m.chat, { 
      text: `⌛ Buscando persona... [${progressBar}] ${percent}%`
    }, { quoted: sentMsg })

    await new Promise(r => setTimeout(r, 400))
  }

  let a = getRandomFromArray(ps)
  let b
  do {
    b = getRandomFromArray(ps)
  } while (b === a)

  let c
  do {
    c = getRandomFromArray(ps)
  } while (c === a || c === b)

  m.reply(`*Hey!!! ${toM(a)}, ${toM(b)} y ${toM(c)} han pensado en hacer un trio? ustedes 3 hacen un buen trio 😳😏*`, null, {
    mentions: [a, b, c],
  })
}