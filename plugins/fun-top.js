let user = a => '@' + a.split('@')[0]  // Esto ya limpia todo después de @

function handler(m, { groupMetadata, conn, text }) {
  if (!text) return conn.reply(m.chat, `⚡ Por favor, ingrese un texto para hacer un Top 10 *texto*.`, m)

  // Lista de participantes sin duplicados
  let ps = [...new Set(groupMetadata.participants.map(v => v.id))]

  // Mezclar lista aleatoriamente
  let shuffled = ps.sort(() => 0.5 - Math.random())

  // Tomar los primeros 10 (o menos si no hay tantos miembros)
  let top10 = shuffled.slice(0, 10)

  // Elegir un emoji aleatorio
  let x = pickRandom(['🤓','😅','😂','😳','😎','🥵','😱','🤑','🙄','💩','🍑','🤨','🥴','🔥','👇🏻','😔','👀','🌚'])

  // Construir mensaje sin que aparezcan * en los nombres
  let top = `*${x} Top 10 ${text} ${x}*\n\n` +
    top10.map((u, i) => `${i + 1}. ${user(u)}`).join('\n')  // <-- sin asteriscos alrededor

  m.reply(top, null, { mentions: top10 })
}

handler.help = ['top *<texto>*']
handler.command = ['top']
handler.tags = ['fun']
handler.group = true
handler.register = false

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}