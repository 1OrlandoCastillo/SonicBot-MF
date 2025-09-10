console.log('⧉ Inicializando Anya...')

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import cluster from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

// Banner bonito con cfonts
cfonts.say('Kiyomi\nUchiha', {
  font: 'block',
  align: 'center',
  gradient: ['cyan', 'blue']
})

cfonts.say('WhatsApp Multi-Bot Engine', {
  font: 'simple',
  align: 'center',
  gradient: ['blue', 'white']
})

let isWorking = false

async function launch(scripts) {
  if (isWorking) return
  isWorking = true

  for (const script of scripts) {
    const args = [join(__dirname, script), ...process.argv.slice(2)]

    // configuración del cluster
    cluster.setupMaster({
      exec: args[0],
      args: args.slice(1),
    })

    let child = cluster.fork()

    child.on('exit', (code) => {
      isWorking = false
      console.log(`❌ El proceso ${script} salió con código ${code}. Reiniciando...`)
      if (code === 0) return

      watchFile(args[0], () => {
        unwatchFile(args[0])
        launch(scripts)
      })

      launch(scripts)
    })
  }
}

// Lanzar el bot principal
launch(['main.js'])