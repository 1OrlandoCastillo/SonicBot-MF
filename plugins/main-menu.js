import fs from 'fs';
import { join } from 'path';
import { xpRange } from '../lib/levelling.js';

const tags = {
  'main': '💡 Información',
  'search': '🔍 Búsqueda',
  'game': '🎮 Juegos',
  'serbot': '🤖 Sub-Bots',
  'rpg': '⚔️ RPG',
  'rg': '📝 Registro',
  'sticker': '🏷️ Stickers',
  'img': '🖼️ Imágenes',
  'group': '👥 Grupos',
  'nable': '🔧 On/Off',
  'premium': '💎 Premium',
  'downloader': '⬇️ Descargas',
  'tools': '🛠️ Herramientas',
  'fun': '🎉 Diversión',
  'nsfw': '🔞 NSFW',
  'cmd': '📂 Base de Datos',
  'owner': '👑 Creador',
  'audio': '🎵 Audios',
  'advanced': '🚀 Avanzado',
};

const defaultMenu = {
  before: `
╭───「 %botname 」───╮
│ Tipo: %tipo
│ Fecha: %date
│ Hora: %time
│ Nivel: %level
│ Experiencia: %exp/%maxexp
│ Usuarios: %totalreg
╰─────────────────╯
%readmore`.trimStart(),

  header: '🌟 %category',
  body: '│ 🎯 %cmd %islimit %isPremium',
  footer: '─────────────────',
  after: '✨ ¡Diviértete usando %botname!',
};

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender];
    const { min, xp, max } = xpRange(level, global.multiplier);
    const name = await conn.getName(m.sender);

    const d = new Date(Date.now() + 3600000);
    const locale = 'es';
    const week = d.toLocaleDateString(locale, { weekday: 'long' });
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' });

    const totalreg = Object.keys(global.db.data.users).length;

    const help = Object.values(global.plugins).filter(p => !p.disabled).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : ['otros'],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium
    }));

    // Generar dinámicamente los tags y ordenarlos
    let dynamicTags = {};
    for (let plugin of help) {
      for (let t of plugin.tags) {
        dynamicTags[t] = tags[t] || t.charAt(0).toUpperCase() + t.slice(1);
      }
    }
    const sortedTags = Object.keys(dynamicTags).sort((a, b) => dynamicTags[a].localeCompare(dynamicTags[b]));

    // Configuración del bot
    let nombreBot = global.namebot || 'Anya Forger';
    let imgBot = 'https://cdn.russellxz.click/1dec146c.jpeg';
    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '');
    const configPath = join('./Serbot', botActual, 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.name) nombreBot = config.name;
        if (config.img) imgBot = config.img;
      } catch (err) {}
    }

    const tipo = botActual === '+5491125856641'.replace(/\D/g, '') ? 'Principal Bot' : 'Sub Bot';
    const menuConfig = conn.menu || defaultMenu;

    const _text = [
      menuConfig.before,
      ...sortedTags.map(tag => {
        const comandos = help
          .filter(menu => menu.tags?.includes(tag))
          .map(menu => menu.help.map(helpText => {
            return {
              cmd: menu.prefix ? helpText : `${_p}${helpText}`,
              limit: menu.limit ? '⭐' : '',
              premium: menu.premium ? '💎' : ''
            };
          }))
          .flat()
          .sort((a, b) => a.cmd.localeCompare(b.cmd));

        return [
          menuConfig.header.replace(/%category/g, dynamicTags[tag]),
          comandos.map(c => menuConfig.body
            .replace(/%cmd/g, c.cmd)
            .replace(/%islimit/g, c.limit)
            .replace(/%isPremium/g, c.premium)
          ).join('\n'),
          menuConfig.footer
        ].join('\n');
      }),
      menuConfig.after
    ].join('\n');

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: '@' + m.sender.split('@')[0],
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      level,
      limit,
      name,
      week,
      date,
      time,
      totalreg,
      tipo,
      readmore: readMore,
      uptime: clockString(process.uptime() * 1000),
    };

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    );

    await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', text.trim(), m, null);

  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m);
    throw e;
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;

// Utilidades
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}