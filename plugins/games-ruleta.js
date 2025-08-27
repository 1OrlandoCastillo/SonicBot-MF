let cooldowns = {}
let handler = async (m, { conn, text, command, usedPrefix }) => {
  let tiempoEspera = 5
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    m.reply(`Ya has iniciado una apuesta recientemente, espera *⏱ ${tiempoRestante}* para apostar nuevamente.`)
    return
  }

  if (!text || !['rojo', 'negro'].includes(text.toLowerCase())) {
    return conn.reply(m.chat, 'Elige un color ( *Rojo o Negro* ) para apostar en la ruleta.\n\n`» Ejemplo :`\n' + `> *${usedPrefix + command}* rojo`, m)
  }

  cooldowns[m.sender] = Date.now()

  let ruleta = ['🔴', '⚫️']
  let resultado = ruleta[Math.floor(Math.random() * ruleta.length)]

  // Primer mensaje
  let mensaje = '🌸 La ruleta está girando... 🔄'
  let msg = await conn.reply(m.chat, mensaje, m)

  // Espera 3 segundos simulando "giro"
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Resultado
  mensaje = `🌺 La ruleta se detuvo en... ${resultado}`

  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { limit: 0 }

  if ((text.toLowerCase() === 'rojo' && resultado === '🔴') || (text.toLowerCase() === 'negro' && resultado === '⚫️')) {
    global.db.data.users[m.sender].limit += 1000
    mensaje += `\n\n🌸 Acabas de ganar *1000 Coins*`
  } else {
    global.db.data.users[m.sender].limit -= 500
    mensaje += `\n\n🌺 Acabas de perder *500 Coins*`
  }

  // Edita el mismo mensaje con el resultado
  await conn.sendMessage(m.chat, { text: mensaje }, { edit: msg.key })
}

handler.help = ['ruleta']
handler.tags = ['games']
handler.command = ['ruleta']

export default handler

function segundosAHMS(segundos) {
  return `${segundos} segundos`
}