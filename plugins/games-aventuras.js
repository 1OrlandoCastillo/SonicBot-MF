let handler = async (m, { conn }) => {
  const jugador = {
    nombre: 'Aventurero',
    salud: 100,
    fuerza: 10,
    oro: 0,
    inventario: []
  }

  const enemigos = [
    { nombre: 'Goblin', salud: 20, fuerza: 5 },
    { nombre: 'Orco', salud: 50, fuerza: 10 },
    { nombre: 'Dragón', salud: 100, fuerza: 20 }
  ]

  const lugares = [
    { nombre: 'Bosque', descripcion: 'Un bosque oscuro y misterioso' },
    { nombre: 'Montaña', descripcion: 'Una montaña alta y peligrosa' },
    { nombre: 'Cueva', descripcion: 'Una cueva oscura y llena de peligros' }
  ]

  let juego = true
  while (juego) {
    const accion = await conn.waitForMessage(m.chat, m => m.text, { maxAttempts: 1 })
    const comando = accion.text.toLowerCase()

    if (comando === 'explorar') {
      const lugar = lugares[Math.floor(Math.random() * lugares.length)]
      m.reply(`Estás en ${lugar.nombre}. ${lugar.descripcion}`)
      const enemigo = enemigos[Math.floor(Math.random() * enemigos.length)]
      if (Math.random() < 0.5) {
        m.reply(`Un ${enemigo.nombre} te ataca!`)
        const batalla = await batallaJugadorEnemigo(jugador, enemigo)
        if (batalla) {
          m.reply(`Ganaste la batalla!`)
        } else {
          m.reply(`Perdiste la batalla...`)
          juego = false
        }
      }
    } else if (comando === 'inventario') {
      m.reply(`Inventario: ${jugador.inventario.join(', ')}`)
    } else if (comando === 'salud') {
      m.reply(`Salud: ${jugador.salud}`)
    } else if (comando === 'fuerza') {
      m.reply(`Fuerza: ${jugador.fuerza}`)
    } else if (comando === 'oro') {
      m.reply(`Oro: ${jugador.oro}`)
    } else if (comando === 'salir') {
      juego = false
    } else {
      m.reply(`Comando no reconocido`)
    }
  }
}

async function batallaJugadorEnemigo(jugador, enemigo) {
  while (jugador.salud > 0 && enemigo.salud > 0) {
    const accion = await conn.waitForMessage(m.chat, m => m.text, { maxAttempts: 1 })
    const comando = accion.text.toLowerCase()

    if (comando === 'atacar') {
      enemigo.salud -= jugador.fuerza
      m.reply(`Atacaste al ${enemigo.nombre} por ${jugador.fuerza} de daño`)
    } else if (comando === 'defender') {
      jugador.salud += 10
      m.reply(`Te defendiste y recuperaste 10 de salud`)
    }

    if (enemigo.salud > 0) {
      jugador.salud -= enemigo.fuerza
      m.reply(`El ${enemigo.nombre} te atacó por ${enemigo.fuerza} de daño`)
    }
  }

  return jugador.salud > 0
}

handler.help = ['aventuras']
handler.tags = ['ganes]
handler.command = ['aventuras']

export default handler