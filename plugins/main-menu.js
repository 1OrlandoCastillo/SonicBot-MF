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

// Comandos default que siempre se muestran si no existen en plugins
const defaultCommands = {
  fun: ['.manco', '.juego', '.chiste'],
  main: [],
  search: [],
  game: [],
  serbot: [],
  rpg: [],
  rg: [],
  sticker: [],
  img: [],
  group: [],
  nable: [],
  premium: [],
  downloader: [],
  tools: [],
  nsfw: [],
  cmd: [],
  owner: [],
  audio: [],
  advanced: []
};

const defaultMenu = {
  before: `
╭───「 %botname 」───╮
│ %tipo
│ Fecha: %date
│ Hora: %time
╰─────────────────╯
%readmore`.trimStart(),

  header: '🌟 %category',
  body: '│ %cmd',
  footer: '─────────────────',
  after: '✨ ¡Diviértete usando %botname!',
};

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const name = await conn.getName(m.sender);

    const d = new Date(Date.now() + 3600000);
    const locale = 'es';
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' });

    // Obtener plugins activos
    const help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help.filter(Boolean) : [plugin.help].filter(Boolean),
        tags: Array.isArray(plugin.tags) ? plugin.tags.filter(Boolean) : ['otros'],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium
      }));

    // Todos los tags (plugins + defaults)
    const allTags = new Set([...Object.keys(defaultCommands), ...help.flatMap(p => p.tags)]);
    let dynamicTags = {};
    for (let t of allTags) {
      if (!t || t === 'undefined') continue;
      dynamicTags[t] = tags[t] || t.charAt(0).toUpperCase() + t.slice(1);
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

    const tipo = botActual === '+5491125856641'.replace(/\D/g, '') ? '🤖 Principal Bot' : '🛠️ Sub Bot';
    const menuConfig = conn.menu || defaultMenu;

    const _text = [
      menuConfig.before
        .replace(/%botname/g, nombreBot)
        .replace(/%tipo/g, tipo)
        .replace(/%date/g, date)
        .replace(/%time/g, time)
        .replace(/%readmore/g, readMore),
      ...sortedTags.map(tag => {
        // Comandos de plugin
        const pluginCommands = help
          .filter(menu => menu.tags?.includes(tag))
          .map(menu => menu.help.map(helpText => ({
            cmd: menu.prefix ? helpText : `${_p}${helpText}`,
            limit: menu.limit ? '⭐' : '',
            premium: menu.premium ? '💎' : ''
          })))
          .flat()
          .filter(Boolean);

        // Comandos default que no existen aún
        const defaultCmds = (defaultCommands[tag] || [])
          .filter(defCmd => !pluginCommands.some(c => c.cmd === `${_p}${defCmd}`))
          .map(defCmd => ({ cmd: `${_p}${defCmd}`, limit: '', premium: '' }));

        const allCommands = [...pluginCommands, ...defaultCmds];

        if (!allCommands.length) return '';

        // Separar comandos normales, limit y premium para mejor visual
        const normal = allCommands.filter(c => !c.limit && !c.premium).map(c => `│ ${c.cmd}`);
        const limited = allCommands.filter(c => c.limit).map(c => `│ ${c.cmd} ${c.limit}`);
        const premium = allCommands.filter(c => c.premium).map(c => `│ ${c.cmd} ${c.premium}`);

        return [
          menuConfig.header.replace(/%category/g, dynamicTags[tag]),
          ...normal,
          ...limited,
          ...premium,
          menuConfig.footer
        ].join('\n');
      }).filter(Boolean),
      menuConfig.after.replace(/%botname/g, nombreBot)
    ].join('\n');

    await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', _text.trim(), m, null);

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