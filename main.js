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
import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'
import readline from 'readline'
import NodeCache from 'node-cache'
import qrcode from 'qrcode-terminal'

// ✅ Import correcto de Baileys
const baileys = await import('@whiskeysockets/baileys')
const { proto, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, jidNormalizedUser } = baileys

// Funciones locales
import { makeWASocket, protoType, serialize } from './lib/simple.js'

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

// CFonts
import cfonts from 'cfonts'
cfonts.say('SonicBot-ProMax', { font: 'block', align: 'center', gradient: ['cyan', 'blue'] })
cfonts.say('El mejor bot de WhatsApp', { font: 'simple', align: 'center', gradient: ['blue', 'white'] })

// Inicializar prototipos y serialización
protoType()
serialize()

// Funciones globales
global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
  rmPrefix ? (/file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString()
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true))
global.__require = (dir = import.meta.url) => createRequire(dir)

// Database
global.db = new Low(new JSONFile(`storage/databases/database.json`))
global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this)
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
        }
      }, 1000)
    )
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, botGroups: {}, antiImg: {},
    ...(global.db.data || {}),
  }
  global.db.chain = lodash.chain(global.db.data)
}

// Auth
global.authFile = `sessions`
const { state, saveCreds } = await useMultiFileAuthState(global.authFile)

// Version Baileys
const { version } = await fetchLatestBaileysVersion()

// Readline para login manual
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolve) => rl.question(texto, resolve))

// Logger
const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({ class: 'client' })
logger.level = 'fatal'

// Conexión principal
const connectionOptions = {
  version,
  logger,
  printQRInTerminal: false,
  auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnclientect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: { patch: false, snapshot: false },
  getMessage: async (key) => {
    const jid = jidNormalizedUser(key.remoteJid)
    const msg = await store.loadMessage(jid, key.id)
    return msg?.message || ''
  },
}

global.conn = makeWASocket(connectionOptions)

// Función de login manual
async function handleLogin() {
  if (conn.authState.creds.registered) {
    console.log(chalk.green('Sesión ya está registrada.'))
    return
  }

  let loginMethod = (await question(chalk.green('Escribe "qr" para escanear QR o "code" para código 8 dígitos:\n'))).toLowerCase().trim()

  if (loginMethod === 'code') {
    let phoneNumber = (await question(chalk.blue('Número de WhatsApp (ej: 521XXXXXXXXXX):\n'))).replace(/\D/g, '')
    if (phoneNumber.startsWith('52') && phoneNumber.length === 12) phoneNumber = `521${phoneNumber.slice(2)}`
    else if (phoneNumber.startsWith('0')) phoneNumber = phoneNumber.replace(/^0/, '')

    if (typeof conn.requestPairingCode === 'function') {
      try {
        if (conn.ws.readyState === ws.OPEN) {
          let code = await conn.requestPairingCode(phoneNumber)
          code = code?.match(/.{1,4}/g)?.join('-') || code
          console.log(chalk.cyan('Tu código de emparejamiento es:', code))
        } else console.log(chalk.red('Conexión no abierta, intenta nuevamente.'))
      } catch (e) { console.log(chalk.red('Error al solicitar emparejamiento:'), e.message || e) }
    } else console.log(chalk.red('Versión de Baileys no soporta emparejamiento por código.'))
  } else {
    console.log(chalk.yellow('Generando código QR, escanéalo con WhatsApp...'))
    conn.ev.on('connection.update', ({ qr }) => { if (qr) qrcode.generate(qr, { small: true }) })
  }
}

await handleLogin()

// Resto de tu código: reconexión de sub-bots, tmp, reloadHandler, plugins
// Se mantiene exactamente igual que tu archivo original, solo con proto importado correctamente