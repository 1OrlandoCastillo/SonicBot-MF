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
import qrcode from 'qrcode-terminal'
import { spawn, exec } from 'child_process'

// Baileys ESM
import baileys from '@whiskeysockets/baileys'
const {
  proto,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = baileys

// Node Version Check
if (parseInt(process.versions.node.split('.')[0]) < 18) {
  console.log(chalk.red('Necesitas Node.js 18 o superior para ejecutar este bot.'))
  process.exit(1)
}

protoType()
serialize()

// Global helpers
global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
  rmPrefix ? (/file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString()

global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true))
global.__require = (dir = import.meta.url) => createRequire(dir)

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        }),
      )
    : '')

global.timestamp = { start: new Date() }
const __dirname = global.__dirname(import.meta.url)

// Options yargs
global.opts = yargs(process.argv.slice(2)).exitProcess(false).parse()
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

// Base de datos
global.db = new Low(new JSONFile(`storage/databases/database.json`))
global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise(resolve => setInterval(async function () {
    if (!global.db.READ) {
      clearInterval(this)
      resolve(global.db.data ?? global.loadDatabase())
    }
  }, 1000))
  if (global.db.data) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, botGroups: {}, antiImg: {},
    ...(global.db.data || {}),
  }
  global.db.chain = lodash.chain(global.db.data)
}

// Autenticación
global.authFile = 'sessions'
const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
const { version } = await fetchLatestBaileysVersion()

// Readline
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise(resolve => rl.question(text, resolve))

// Logger
const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({ class: 'client' })
logger.level = 'fatal'

// Opciones de conexión
const connectionOptions = {
  version,
  logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: { patch: false, snapshot: false },
  getMessage: async (key) => {
    try {
      const jid = jidNormalizedUser(key.remoteJid)
      if (global.store?.loadMessage) return (await global.store.loadMessage(jid, key.id))?.message ?? null
      return null
    } catch { return null }
  },
}

// Socket principal
global.conn = makeWASocket(connectionOptions)

// Login QR / code
async function handleLogin() {
  if (conn.authState?.creds?.registered) return console.log(chalk.green('Sesión ya registrada.'))

  let method = (await question(chalk.green('¿Cómo deseas iniciar sesión? "qr" o "code":\n'))).trim().toLowerCase()

  if (method === 'code') {
    let phone = (await question(chalk.blue('Número WhatsApp (ej: 521XXXXXXXXXX):\n'))).replace(/\D/g, '')
    if (phone.startsWith('52')) phone = `521${phone.slice(2)}`
    else if (phone.startsWith('0')) phone = phone.replace(/^0/, '')

    if (typeof conn.requestPairingCode === 'function') {
      try {
        if (conn.ws?.readyState === ws.OPEN) {
          let code = await conn.requestPairingCode(phone)
          console.log(chalk.cyan('Código de emparejamiento:', code?.match(/.{1,4}/g)?.join('-') || code))
        } else console.log(chalk.red('Conexión no abierta.'))
      } catch (e) {
        console.log(chalk.red('Error al solicitar código:', e?.message))
      }
    } else console.log(chalk.red('Tu versión de Baileys no soporta emparejamiento por código.'))
  } else {
    console.log(chalk.yellow('Escanea el código QR:'))
    conn.ev.on('connection.update', ({ qr }) => { if (qr) qrcode.generate(qr, { small: true }) })
  }
}

await handleLogin()

// Limpieza de tmp
function clearTmp() {
  const tmpFolders = [join(__dirname, 'tmp')]
  for (const dir of tmpFolders) {
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir)) {
      const filePath = join(dir, file)
      const stats = statSync(filePath)
      if (stats.isFile() && Date.now() - stats.mtimeMs > 3 * 60 * 1000) unlinkSync(filePath)
    }
  }
}
setInterval(() => { if (!conn || !conn.user || global.stopped === 'close') return; clearTmp() }, 180000)

// Export handler
let handler = await import('./handler.js')
global.reloadHandler = async function (restartConn = false) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`)
    if (Handler) handler = Handler
  } catch (e) { console.error(e) }

  if (restartConn) {
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions)
  }

  conn.handler = handler.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
}

// Plugins
const pluginFolder = join(__dirname, 'plugins/index')
const pluginFilter = (file) => /\.js$/.test(file)
global.plugins = {}
async function filesInit() {
  for (const file of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const mod = await import(join(pluginFolder, file))
      let plugin = mod.default || mod
      if (typeof plugin === 'function') plugin = { handler: plugin, command: plugin.command || [], tags: plugin.tags || [], help: plugin.help || [], disabled: false }
      if (plugin.command && typeof plugin.command === 'string') plugin.command = [plugin.command]
      global.plugins[file] = plugin
    } catch (e) { conn.logger.error(`Error plugin ${file}:`, e); delete global.plugins[file] }
  }
}
await filesInit()

// Reload plugins on change
global.reload = async