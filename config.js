import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'


global.owner = [
  ['5212731590195', 'Withe444', true],
  ['50493732693', 'Ado', true], 
]


global.mods = []
global.prems = []

global.jadi = 'Sesiones/Subbots'
global.Sesion = 'Sesiones/Principal'
global.dbname = 'database.json'

global.packname = 'SonicBot'
global.namebot = 'SonicBot-MF'
global.author = 'Withe444'


global.namecanal = 'SonicBot-MF Official'
global.canal = 'https://whatsapp.com/channel/0029Vb3oShrICVfiTWhDHM13'
global.idcanal = '120363411154070926@newsletter'

global.ch = {
ch1: '120363411154070926@newsletter',
}

global.multiplier = 69 
global.maxwarn = '2'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
