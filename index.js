import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import cluster from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { setupMaster, setupPrimary, fork } = cluster

console.log('⧉ Inicializando Anya...')

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
    const execPath = join(__dirname, script)
    const args = [execPath, ...process.argv.slice(2)]

    // Preferir setupPrimary si está disponible (Node >=16+), sino setupMaster
    const setupFn = setupPrimary || setupMaster
    try {
      setupFn({
        exec: args[0],
        args: args.slice(1)
      })
    } catch (e) {
      console.error('Error en setupMaster/setupPrimary:', e)
    }

    let child
    try {
      child = fork()
    } catch (e) {
      console.error(`Error al forkear ${execPath}:`, e)
      isWorking = false
      continue
    }

    child.on('exit', (code, signal) => {
      console.log(`Worker (${execPath}) exited with code=${code} signal=${signal}`)
      // permitir relanzar
      isWorking = false

      // Si salió con código 0, no relanzar inmediatamente
      if (code === 0) return

      // Reiniciar después de breve retardo para evitar bucles rápidos
      setTimeout(() => {
        try { unwatchFile(execPath) } catch {}
        try { launch(scripts) } catch (e) { console.error('Error relanzando scripts:', e) }
      }, 1000)

      // Vigilar cambios en el archivo para relanzar cuando se guarde
      try {
        watchFile(execPath, () => {
          try { unwatchFile(execPath) } catch {}
          try { launch(scripts) } catch (e) { console.error('Error relanzando desde watcher:', e) }
        })
      } catch (e) {
        console.error('Error setting watchFile:', e)
      }
    })
  }
}

launch(['main.js'])