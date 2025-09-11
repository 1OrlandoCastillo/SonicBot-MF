console.log('⧉ Inicializando Anya...')

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

// Mensajes iniciales con CFonts
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
    const scriptPath = join(__dirname, script)
    const args = [scriptPath, ...process.argv.slice(2)]

    setupMaster({
      exec: scriptPath,
      args: args.slice(1),
    })

    const child = fork()

    child.on('exit', (code) => {
      console.log(`⚠️ Script ${script} finalizó con código ${code}`)
      isWorking = false

      // Reiniciar script solo si no fue finalización normal
      if (code !== 0) {
        console.log(`🔄 Reiniciando ${script}...`)
        launch(scripts)
      }
    })

    // Hot reload: si el archivo cambia, reinicia el script
    watchFile(scriptPath, () => {
      unwatchFile(scriptPath)
      console.log(`♻️ Archivo ${script} actualizado, reiniciando...`)
      launch(scripts)
    })
  }
}

// Iniciar main.js
launch(['main.js'])