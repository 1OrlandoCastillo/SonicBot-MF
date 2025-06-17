import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'


global.owner = [
  ['5212731590195', 'Withe444', true],
]


global.mods = []
global.prems = []

global.libreria = 'Baileys'
global.baileys = 'V 6.7.16' 
global.vs = '2.2.0'
global.nameqr = 'YukiBot-MD'
global.namebot = '✿◟Yυƙι-Sυσυ-Bσƚ◞✿'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 
global.yukiJadibts = true

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