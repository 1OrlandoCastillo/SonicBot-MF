let cooldowns = {}
let handler = async (m, { conn, text, usedPrefix, command }) => {
  let poin = 500
  let tiempoEspera = 5 * 1000
  let user = global.db.data.users[m.sender]

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera - Date.now()) / 1000))
    return conn.reply(m.chat, `🌺 Ya has iniciado una aventura recientemente, espera *⏱ ${tiempoRestante}* para iniciar otra aventura.`, m)
  }

  cooldowns[m.sender] = Date.now()

  let numeroAleatorio = Math.floor(Math.random() * 10) + 1
  let opciones = ["suma", "resta", "multiplica"]

  let operacion = opciones[Math.floor(Math.random() * opciones.length)]

  let resultado = 0

  switch (operacion) {
    case "suma":
      resultado = numeroAleatorio + 5
      break
    case "resta":
      resultado = numeroAleatorio - 3
      break
    case "multiplica":
      resultado = numeroAleatorio * 2
      break
  }

  conn.reply(m.chat, `⭐ Resuelve la siguiente operación: ${numeroAleatorio} ${getOperador(operacion)} ? = ${resultado}`, m)

  let respuesta = await conn.waitForMessage(m.chat, m => m.text, { maxAttempts: 1 })
  let numero = parseInt(respuesta.text)

  if (isNaN(numero)) {
    conn.reply(m.chat, `⭐ Ingresa un número válido.`, m)
    return
  }

  if (getNumeroOperacion(numeroAleatorio, operacion) === numero) {
    user.limit += poin
    conn.reply(m.chat, `🌸 ¡Felicidades! Resolviste la operación correctamente. Ganaste ${poin} estrellas.`, m)
  } else {
    user.limit -= poin
    conn.reply(m.chat, `💎 Lo siento, la respuesta correcta era ${getNumeroOperacion(numeroAleatorio, operacion)}. Perdiste ${poin} estrellas.`, m)
  }

  delete cooldowns[m.sender]
}

handler.help = ['aventura']
handler.tags = ['games']
handler.command = ['aventura']

export default handler

function getOperador(operacion) {
  switch (operacion) {
    case "suma":
      return "+"
    case "resta":
      return "-"
    case "multiplica":
      return "*"
  }
}

function getNumeroOperacion(numero, operacion) {
  switch (operacion) {
    case "suma":
      return numero + 5
    case "resta":
      return numero - 3
    case "multiplica":
      return numero * 2
  }
}

function segundosAHMS(segundos) {
  return `${segundos % 60} segundos`
}