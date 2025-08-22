import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// ------------------ Dueño ------------------
global.ownerNumber = '5212731590195@s.whatsapp.net'; // Tu número completo
global.owner = [
  ['5212731590195', 'White444', true],
];

// Mods y Premiums
global.mods = [];
global.prems = [];

// Información del bot
global.libreria = 'Baileys';
global.baileys = 'V 6.7.16';
global.vs = '2.2.0';
global.nameqr = 'YukiBot-MD';
global.namebot = '✿◟Yυƙι-Sυσυ-Bσƚ◞✿';
global.sessions = 'Sessions';
global.jadi = 'JadiBots';
global.yukiJadibts = true;

// Stickers
global.packname = 'SonicBot';
global.namebot = 'SonicBot-MF';
global.author = 'White444';

// Canal oficial
global.namecanal = 'SonicBot-MF Official';
global.canal = 'https://whatsapp.com/channel/0029Vb3oShrICVfiTWhDHM13';
global.idcanal = '120363411154070926@newsletter';

global.ch = {
  ch1: '120363411154070926@newsletter',
};

// Configuración adicional
global.multiplier = 69;
global.maxwarn = '2';

// ------------------ Auto reload seguro ------------------
let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.greenBright("✔️  Config.js actualizado"));
  
  try {
    import(`${file}?update=${Date.now()}`);
  } catch (err) {
    console.log(chalk.redBright("❌ Error al recargar config.js"), err);
  }
});
