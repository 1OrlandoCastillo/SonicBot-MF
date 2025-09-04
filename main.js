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

// --- Inicialización global ---
protoType()
serialize()

global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
  rmPrefix ? (/file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString()
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true))
global.__require = (dir = import.meta.url) => createRequire(dir)

// --- Variables y setup ---
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
global.timestamp = { start: new Date() }

// --- Base de datos ---
const dbPath = join(global.__dirname(import.meta.url), 'storage/databases')
if (!existsSync(dbPath)) mkdirSync(dbPath, { recursive: true })
global.db = new Low(new JSONFile(join(dbPath, 'database.json')))
global.loadDatabase = async function loadDatabase() {
  try {
    await global.db.read()
    global.db.data = global.db.data || {
      users: {},
      chats: {},
      stats: {},
      msgs: {},
      sticker: {},
      settings: {},
      botGroups: {},
      antiImg: {}
    }
    global.db.chain = lodash.chain(global.db.data)
  } catch (e) {
    console.error('❌ Error cargando DB:', e)
  }
}
await global.loadDatabase()

// --- Autenticación ---
global.authFile = join(global.__dirname(import.meta.url), 'sessions')
const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
const { version } = await fetchLatestBaileysVersion()

// --- Readline helper ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise(resolve => rl.question(texto, resolve))

// --- Logger ---
const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({ class: 'client' })
logger.level = 'fatal'

// --- Conexión Baileys ---
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
global.conn = makeWASocket(connectionOptions)

// --- Eventos Baileys ---
conn.ev.on('connection.update', update => {
  const { connection, lastDisconnect, qr } = update
  if (connection === 'close') {
    console.log(chalk.red('❌ Desconectado:'), lastDisconnect?.error?.output?.statusCode || '')
  } else if (connection === 'open') {
    console.log(chalk.green('✅ Conectado como'), conn.user?.name || conn.user?.jid)
  }
  if (qr) qrcode.generate(qr, { small: true })
})

conn.ev.on('messages.upsert', async m => {
  try {
    console.log('Mensaje recibido:', JSON.stringify(m, null, 2))
    // Aquí puedes llamar a tu handler de mensajes
  } catch (e) {
    console.error('Error procesando mensaje:', e)
  }
})

// --- Limpieza temporal ---
function clearTmp() {
  const tmpDirs = [join(global.__dirname(import.meta.url), 'tmp'), join(global.__dirname(import.meta.url), 'serbot')]
  tmpDirs.forEach(tmpDir => {
    mkdirSync(tmpDir, { recursive: true })
    readdirSync(tmpDir).forEach(file => {
      const filePath = join(tmpDir, file)
      try {
        const stats = statSync(filePath)
        if (stats.isFile() && Date.now() - stats.mtimeMs >= 180000) unlinkSync(filePath)
      } catch (err) {
        console.error(`❌ Error eliminando archivo ${filePath}:`, err.message)
      }
    })
  })
}
setInterval(() => {
  if (global.stopped === 'close' || !conn || !conn.user) return
  clearTmp()
}, 180000)

// --- Reconexión de sub-bots ---
global.reconnectSubBots = async function () {
  if (!global.conns) global.conns = []

  const serbotDir = join(global.__dirname(import.meta.url), 'Serbot')
  mkdirSync(serbotDir, { recursive: true })

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

// --- Captura global de errores ---
process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)