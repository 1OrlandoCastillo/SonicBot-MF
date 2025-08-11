const emoji = '🤖'

let toM = jid => '@' + jid.split('@')[0]

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function handler(m, { groupMetadata, conn }) {
  if (!groupMetadata) {
    return conn.sendMessage(m.chat, { text: 'Este comando solo funciona en grupos.' }, { quoted: m })
  }

  const participants = groupMetadata.participants.map(p => p.id)
  if (participants.length < 2) {
    return conn.sendMessage(m.chat, { text: 'No hay suficientes participantes para hacer amistades.' }, { quoted: m })
  }

  const userA = getRandom(participants)
  let userB
  do {
    userB = getRandom(participants)
  } while (userB === userA)

  await conn.sendMessage(m.chat, { text: `${emoji} Buscando amistad...` }, { quoted: m })

  await delay(3000)

  await conn.sendMessage(m.chat, {
    text: `${emoji} Vamos a hacer algunas amistades.\n\n*Oye ${toM(userA)} hablale al privado a ${toM(userB)} para que jueguen y se haga una amistad 🙆*\n\n*Las mejores amistades empiezan con un juego 😉.*`,
    mentions: [userA, userB]
  }, { quoted: m })
}

handler.help = ['amistad']
handler.tags = ['fun']
handler.command = ['amigorandom', 'amistad']
handler.group = true
handler.register = false

export default handler