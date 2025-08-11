let toM = a => '@' + a.split('@')[0]

function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function handler(m, { conn, groupMetadata }) {
  let ps = groupMetadata.participants.map(v => v.id)

  // Enviar mensaje inicial de búsqueda
  await conn.reply(m.chat, `⌛ Buscando personas...`, m)

  // Esperar 4 segundos simulando barra
  await new Promise(r => setTimeout(r, 4000))

  // Seleccionar personas sin repetir
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