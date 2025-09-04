console.log('⧉ Inicializando SonicBot-ProMax...')

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { watchFile, unwatchFile } from 'fs'
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

// Función para recargar main.js
async function launchMain() {
  try {
    // Eliminamos el cache para recargar completamente
    const mainPath = join(__dirname, 'main.js')
    delete (await import.meta.resolve(mainPath))
    unwatchFile(mainPath)
    watchFile(mainPath, () => {
      console.log('🔄 main.js modificado, recargando...')
      launchMain()
    })

    // Importar main.js
    await import(`./main.js?update=${Date.now()}`)
    console.log('✅ main.js cargado correctamente')

  } catch (error) {
    console.error('❌ Error cargando main.js:', error)
  }
}

// Iniciar el bot
launchMain()