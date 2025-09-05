process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch } from 'fs'
import yargs from 'yargs'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'
import readline from 'readline'
import NodeCache from 'node-cache'
import qrcode from 'qrcode-terminal'
import { spawn } from 'child_process'

const { proto } = (await import('@whiskeysockets/baileys')).default
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser
} = await import('@whiskeysockets/baileys')

protoType()
serialize()

// ---------- GLOBALS ----------
global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
  rmPrefix ? (/^file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString()
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true))
global.__require = (dir = import.meta.url) => createRequire(dir)

global.timestamp = { start: new Date() }

global.opts = yargs(process.argv.slice(2)).exitProcess(false).parse()
global.prefix = new RegExp(
  '^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']'
)

// ---------- DATABASE ----------
global.db = new Low(new JSONFile('storage/databases/database.json'))
global.loadDatabase = async () => {
  await global.db.read().catch(console.error)
  global.db.data ||= { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, botGroups: {}, antiImg: {} }
  global.db.chain = lodash.chain(global.db.data)
}

// ---------- AUTH ----------
global.authFile = 'sessions'
const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
const { version } = await fetchLatestBaileysVersion()

// ---------- LOGGER ----------
const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
}).child({ class: 'client' })
logger.level = 'fatal'

// ---------- SOCKET CONNECTION ----------
const connectionOptions = {
  version,
  logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnconnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: { patch: false, snapshot: false },
  getMessage: async (key) => global.store?.loadMessage(jidNormalizedUser(key.remoteJid), key.id) || ''
}

global.conn = makeWASocket(connectionOptions)
conn.isInit = false
conn.well = false

// ---------- LOGIN HANDLER ----------
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise(res => rl.question(texto, res))

async function handleLogin() {
  if (conn.authState.creds.registered) return console.log(chalk.green('Sesión ya está registrada.'))
  let loginMethod = (await question(chalk.green('Escribe "qr" para QR o "code" para usar código de 8 dígitos:\n'))).trim().toLowerCase()
  if (loginMethod === 'code') {
    let phoneNumber = (await question(chalk.blue('Número WhatsApp con código país (ej: 521XXXXXXXXXX):\n'))).replace(/\D/g, '')
    if (!phoneNumber.startsWith('521')) phoneNumber = phoneNumber.startsWith('52') ? `521${phoneNumber.slice(2)}` : phoneNumber
    if (typeof conn.requestPairingCode === 'function') {
      try {
        if (conn.ws.readyState === ws.OPEN) {
          let code = await conn.requestPairingCode(phoneNumber)
          code = code?.match(/.{1,4}/g)?.join('-') || code
          console.log(chalk.cyan('Código de emparejamiento:', code))
        } else console.log(chalk.red('Conexión no abierta.'))
      } catch (e) { console.log(chalk.red('Error solicitando código:'), e.message || e) }
    } else console.log(chalk.red('Versión de Baileys no soporta emparejamiento por código.'))
  } else {
    console.log(chalk.yellow('Generando QR...'))
    conn.ev.on('connection.update', ({ qr }) => qr && qrcode.generate(qr, { small: true }))
  }
}
await handleLogin()

// ---------- TEMP FILE CLEANER ----------
function clearTmp() {
  const tmp = [join(global.__dirname(), './tmp')]
  tmp.forEach(dir => readdirSync(dir).forEach(file => {
    const f = join(dir, file)
    const stats = statSync(f)
    if (stats.isFile() && Date.now() - stats.mtimeMs > 1000 * 60 * 3) unlinkSync(f)
  }))
}
setInterval(() => { if (conn && conn.user) clearTmp() }, 180000)

// ---------- CONNECTION UPDATE ----------
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true

  const code = lastDisconnect?.error?.output?.statusCode
  if (connection === 'open') console.log(chalk.yellow('Conectado correctamente.'))
  if (connection === 'close') {
    switch (code) {
      case DisconnectReason.badSession: return conn.logger.error('Sesión incorrecta, elimina la carpeta sessions y escanea nuevamente.')
      case DisconnectReason.connectionClosed:
      case DisconnectReason.connectionLost:
      case DisconnectReason.timedOut: return await global.reloadHandler(true).catch(console.error)
      case DisconnectReason.connectionReplaced: return conn.logger.error('Conexión reemplazada, cierra esta sesión primero.')
      case DisconnectReason.loggedOut: return conn.logger.error('Sesión cerrada, elimina la carpeta sessions y escanea nuevamente.')
      case DisconnectReason.restartRequired: return await global.reloadHandler(true).catch(console.error)
      default: return await global.reloadHandler(true).catch(console.error)
    }
  }
}
conn.ev.on('connection.update', connectionUpdate.bind(conn))
conn.ev.on('creds.update', saveCreds.bind(conn, true))

// ---------- PLUGINS ----------
const pluginFolder = join(global.__dirname(), './plugins/index')
const pluginFilter = (f) => /\.js$/.test(f)
global.plugins = {}

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = join(pluginFolder, filename)
      let plugin = (await import(file)).default || {}
      if (typeof plugin === 'function') plugin = { handler: plugin, command: plugin.command || [], tags: plugin.tags || [], help: plugin.help || [], disabled: false }
      if (typeof plugin.command === 'string') plugin.command = [plugin.command]
      global.plugins[filename] = plugin
    } catch (e) { conn.logger.error(`Error cargando plugin ${filename}:`, e); delete global.plugins[filename] }
  }
}
await filesInit()
watch(pluginFolder, async (_ev, filename) => { if (pluginFilter(filename)) await filesInit() })

// ---------- HANDLER ----------
let handler = await import('./handler.js')
global.reloadHandler = async (restartConn = false) => {
  const Handler = await import(`./handler.js?update=${Date.now()}`)
  handler = Handler
  if (restartConn) {
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions)
  }
  conn.handler = handler.handler.bind(conn)
  conn.ev.on('messages.upsert', conn.handler)
  conn.isInit = false
}

// ---------- SUB-BOTS ----------
global.reconnectSubBots = async function() {
  const serbotDir = './Serbot'
  if (!existsSync(serbotDir)) return console.log(chalk.yellow('No se encontró la carpeta Serbot'))
  const subBotFolders = readdirSync(serbotDir).filter(f => statSync(join(serbotDir, f)).isDirectory() && existsSync(join(serbotDir, f, 'creds.json')))
  if (!subBotFolders.length) return console.log(chalk.yellow('No se encontraron sub-bots'))
  for (const folder of subBotFolders) {
    const credsPath = join(serbotDir, folder, 'creds.json')
    if (!existsSync(credsPath)) continue
    const serbotModule = await import('./plugins/serbot-serbot.js')
    if (serbotModule.AYBot) await serbotModule.AYBot({ pathAYBot: join(serbotDir, folder), m: null, conn, args: [], usedPrefix: '.', command: 'qr', fromCommand: false })
  }
}

setTimeout(() => global.reconnectSubBots().catch(console.error), 10000)