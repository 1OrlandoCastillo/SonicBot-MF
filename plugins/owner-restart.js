const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {
  if (!process.send) throw '*『✦』Reiniciar: node starcore.js*\n*『✦』Reiniciar: node index.js*'

  await conn.sendMessage(m.chat, { text: `🗂️ Cargando...` }, { quoted: m })
  await delay(1000)
  await conn.sendMessage(m.chat, { text: `📦 Cargando...` }, { quoted: m })
  await delay(1000)
  await conn.sendMessage(m.chat, { text: `♻️ Cargando...` }, { quoted: m })
  await delay(1000)
  await conn.sendMessage(m.chat, { text: `*『⛏️』Comenzar reinicio completo...*` }, { quoted: m })

  process.send('reset')
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar']
handler.rowner = true

export default handler