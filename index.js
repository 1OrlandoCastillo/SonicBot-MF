console.log('⧉ Inicializando Sonic Bot...')

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

// 🎨 Mensajes iniciales
cfonts.say('Sonic Bot', {
  font: 'block',
  align: 'center',
  gradient: ['cyan', 'blue']
})

cfonts.say('WhatsApp Multi-Device', {
  font: 'simple',
  align: 'center',
  gradient: ['blue', 'white']
})

let isWorking = false

async function launch(scripts) {
  if (isWorking) return
  isWorking = true

  for (const script of scripts) {
    try {
      const scriptPath = join(__dirname, script)
      const args = [scriptPath, ...process.argv.slice(2)]

      console.log(`🚀 Iniciando ${script}...`)

      setupMaster({
        exec: scriptPath,
        args: args.slice(1),
      })

      const child = fork()

      child.on('exit', (code, signal) => {
        console.log(`⚠️ Script ${script} finalizó con código ${code} (signal: ${signal})`)
        isWorking = false

        if (code !== 0) {
          console.log(`🔄 Reiniciando ${script}...`)
          launch(scripts)
        }
      })

      // Hot reload: reinicia si el archivo cambia
      watchFile(scriptPath, () => {
        unwatchFile(scriptPath)
        console.log(`♻️ Archivo ${script} actualizado, reiniciando...`)
        launch(scripts)
      })
    } catch (err) {
      console.error(`❌ Error al intentar iniciar ${script}:`, err)
      isWorking = false
    }
  }
}

// 🟢 Iniciar main.js
launch(['main.js'])