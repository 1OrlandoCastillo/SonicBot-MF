console.log('⧉ Inicializando SonicBot-ProMax...')

import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Mostrar título con CFonts
cfonts.say('SonicBot-ProMax', {
  font: 'block',
  align: 'center',
  gradient: ['cyan', 'blue']
})

cfonts.say('El mejor bot de WhatsApp', {
  font: 'simple',
  align: 'center',
  gradient: ['blue', 'white']
})

// Importar y ejecutar el main.js directamente
import joinPath from 'path'
import './main.js'