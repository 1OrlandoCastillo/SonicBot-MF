import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['5212731590195', 'White', true],
  ['12543120750', 'adri', true],
]


global.ownerLid = [
  ['5212731590195', 'White', true],
  ['5212731590195', 'White', true],
  ['5212731590195', 'White2', true],


]

global.sessions = 'Sessions'
global.bot = 'Serbot' 
global.AFBots = true

global.packname = 'LOVELLOUD'
global.namebot = 'SonicBot'
global.author = 'White'


global.canal = 'https://whatsapp.com/channel/0029Vb3oShrICVfiTWhDHM13'

global.ch = {
ch1: '120363411154070926@newsletter',
}

global.mods = []
global.prems = []

global.multiplier = 69 
global.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
