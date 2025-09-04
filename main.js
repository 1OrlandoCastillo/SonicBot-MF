process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import { readdirSync, statSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import yargs from 'yargs'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import pino from 'pino'
import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'
import readline from 'readline'
import NodeCache from 'node-cache'
import qrcode from 'qrcode-terminal'

import makeWASocket, {
  proto,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser
} from '@whiskeysockets/baileys'

import { protoType, serialize } from './lib/simple.js'

// --- Variables y setup inicial ---
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

// --- API Helper ---
global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        })
      )
    : '')

global.timestamp = { start: new Date() }

const __dirname = global.__dirname(import.meta.url)

// --- Yargs y Prefijo ---
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
)

// --- Base de datos ---
global.db = new Low(new JSONFile(`storage/databases/database.json`))
global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise(resolve =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this)
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
        }
      }, 1000)
    )
  }
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    botGroups: {},
    antiImg: {},
    ...(global.db.data || {}),
  }
  global.db.chain = lodash.chain(global.db.data)
}

// --- Autenticación ---
global.authFile = `sessions`
const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
const { version } = await fetchLatestBaileysVersion()

// --- Readline Helper ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise(resolve => rl.question(texto, resolve))

// --- Logger ---
const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({ class: 'client' })
logger.level = 'fatal'

// --- Opciones de conexión ---
const connectionOptions = {
  version,
  logger,
  printQRInTerminal: false,
  auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: { patch: false, snapshot: false },
  getMessage: async (key) => {
    if (!global.store) return null
    const jid = jidNormalizedUser(key.remoteJid)
    const msg = await global.store.loadMessage(jid, key.id)
    return msg?.message || ''
  },
}

// --- Conexión principal ---
global.conn = makeWASocket(connectionOptions)

// --- Función para limpiar archivos temporales ---
function clearTmp() {
  const tmpDirs = [join(__dirname, 'tmp'), join(__dirname, 'serbot')]
  tmpDirs.forEach(tmpDir => {
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })
    const files = existsSync(tmpDir) ? readdirSync(tmpDir).map(f => join(tmpDir, f)) : []
    files.forEach(file => {
      try {
        const stats = statSync(file)
        if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3) {
          unlinkSync(file)
        }
      } catch (err) {
        console.error(`❌ Error eliminando archivo ${file}:`, err.message)
      }
    })
  })
}
setInterval(() => {
  if (global.stopped === 'close' || !conn || !conn.user) return
  clearTmp()
}, 180000)

// --- Reconexión de sub-bots ---
global.reconnectSubBots = async function() {
  if (!global.conns || !Array.isArray(global.conns)) global.conns = []

  const serbotDir = join(__dirname, 'Serbot')
  if (!existsSync(serbotDir)) mkdirSync(serbotDir, { recursive: true })

  const subBotFolders = readdirSync(serbotDir).filter(folder => {
    const folderPath = join(serbotDir, folder)
    return statSync(folderPath).isDirectory() && existsSync(join(folderPath, 'creds.json'))
  })

  for (const folder of subBotFolders) {
    try {
      const botPath = join(serbotDir, folder)
      const credsPath = join(botPath, 'creds.json')

      if (!existsSync(credsPath)) continue

      const isAlreadyConnected = global.conns.some(conn => conn.user?.jid?.includes(folder))
      if (isAlreadyConnected) continue

      const serbotModule = await import('./plugins/serbot-serbot.js')
      if (serbotModule.AYBot) {
        await serbotModule.AYBot({
          pathAYBot: botPath,
          m: null,
          conn: global.conn,
          args: [],
          usedPrefix: '.',
          command: 'qr',
          fromCommand: false
        })
      }
      await new Promise(r => setTimeout(r, 2000))
    } catch (error) {
      console.log(chalk.red(`❌ Error reconectando sub-bot ${folder}:`, error.message))
    }
  }
}

process.on('uncaughtException', console.error)