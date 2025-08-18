let user = a => '@' + a.split('@')[0]

function handler(m, { groupMetadata, conn, text }) {
  if (!text) return conn.reply(m.chat, `⚡ Por favor, ingrese un texto para hacer un Top 10 *texto*.`, m)

  // Lista de participantes
  let ps = groupMetadata.participants.map(v => v.id)

  // Mezclar lista aleatoriamente
  let shuffled = ps.sort(() => 0.5 - Math.random())

  // Tomar los primeros 10 (o menos si no hay tantos miembros)
  let top10 = shuffled.slice(0, 10)

  let k = Math.floor(Math.random() * 70)
  let x = pickRandom(['🤓','😅','😂','😳','😎','🥵','😱','🤑','🙄','💩','🍑','🤨','🥴','🔥','👇🏻','😔','👀','🌚'])
  let vn = `https://hansxd.nasihosting.com/sound/sound${k}.mp3`

  let top = `*${x} Top 10 ${text} ${x}*\n\n` +
    top10.map((u, i) => `*${i + 1}. ${user(u)}*`).join('\n')

  m.reply(top, null, { mentions: top10 })
}

handler.help = ['top *<texto>*']
handler.command = ['top']
handler.tags = ['fun']
handler.group = true
handler.register = true

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}