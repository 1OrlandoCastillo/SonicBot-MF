let handler = async (m, { conn }) => {
  const opciones = ['Anillos de Oro', 'Anillos de Plata', 'Anillos de Bronce', 'No Ganaste']
  const probabilidades = [0.2, 0.3, 0.4, 0.1]

  const resultado = getRandomOption(opciones, probabilidades)
  const mensaje = `¡La ruleta está girando!...\n\n¡Y el resultado es...\n\n${resultado}`

  if (resultado === 'Anillos de Oro') {
    m.reply(`${mensaje}\n\n¡Felicidades! Ganaste 100 anillos de oro`)
  } else if (resultado === 'Anillos de Plata') {
    m.reply(`${mensaje}\n\n¡Buen trabajo! Ganaste 50 anillos de plata`)
  } else if (resultado === 'Anillos de Bronce') {
    m.reply(`${mensaje}\n\n¡No está mal! Ganaste 20 anillos de bronce`)
  } else {
    m.reply(`${mensaje}\n\n¡Mejor suerte la próxima vez!`)
  }
}

function getRandomOption(opciones, probabilidades) {
  const random = Math.random()
  let acumulado = 0
  for (let i = 0; i < opciones.length; i++) {
    acumulado += probabilidades[i]
    if (random < acumulado) {
      return opciones[i]
    }
  }
}

handler.help = ['sonic']
handler.tags = ['games']
handler.command = ['sonic']

export default handler