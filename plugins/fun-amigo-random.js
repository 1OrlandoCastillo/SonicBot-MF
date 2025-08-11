let toM = a => '@' + a.split('@')[0]

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function handler(m, { groupMetadata, conn }) {
  const ps = groupMetadata.participants.map(v => v.id)
  const a = getRandom(ps)
  let b
  do {
    b = getRandom(ps)
  } while (b === a)
  
  // Envía mensajes de progreso: 10,20,...,100
  for (let progress = 10; progress <= 100; progress += 10) {
    await conn.sendMessage(m.chat, `${emoji} Buscando amistad... ${progress}%`, { quoted: m })
    await delay(1000) // espera 1 segundo entre cada mensaje
  }
  
  // Mensaje final con las menciones
  await m.reply(`${emoji} Vamos a hacer algunas amistades.\n\n*Oye ${toM(a)} hablale al privado a ${toM(b)} para que jueguen y se haga una amistad 🙆*\n\n*Las mejores amistades empiezan con un juego 😉.*`, null, {
    mentions: [a, b]
  })
}

handler.help = ['amistad']
handler.tags = ['fun']
handler.command = ['amigorandom', 'amistad']
handler.group = true
handler.register = false

export default handler