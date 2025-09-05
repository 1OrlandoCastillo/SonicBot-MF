process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'
import readline from 'readline'
import NodeCache from 'node-cache'

const { proto } = (await import('@whiskeysockets/baileys')).default
const {
  DisconnectReason,
  useMultiFileAuthState,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC
} = await import('@whiskeysockets/baileys')

const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

// Funciones globales de paths
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
};

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

// API helper
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '');

global.timestamp = { start: new Date }
const __dirname = global.__dirname(import.meta.url)

// Yargs y prefijos
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

// Base de datos
// ⚠️ Asegúrate de definir cloudDBAdapter si usarás URLs remotas
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`))
global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(async function () {
    if (!global.db.READ) {
      clearInterval(this)
      resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
    }
  }, 1000))
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
    ...(global.db.data || {})
  }
  global.db.chain = chain(global.db.data)
}
await loadDatabase()

// Estado de autenticación
global.authFile = `sessions`
const { state, saveState, saveCreds } = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache()
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botnumber

// Opciones de conexión
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion
if (methodCodeQR) opcion = '1'

if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
  do {
    opcion = await question('Seleccione una opción:\n1. Con código QR\n2. Con código de texto de 8 dígitos\n---> ')
    if (!/^[1-2]$/.test(opcion)) console.log('Por favor, seleccione solo 1 o 2.\n')
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${authFile}/creds.json`))
}

// Silencia console.info
console.info = () => {}

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' || methodCodeQR,
  mobile: MethodMobile,
  browser: ['AdriBot MD', 'Safari', '2.0.0'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async (clave) => {
    let jid = jidNormalizedUser(clave.remoteJid)
    let msg = await store.loadMessage(jid, clave.id)
    return msg?.message || ""
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version
}

global.conn = makeWASocket(connectionOptions)
global.stopped = false

// Funciones de limpieza
function clearTmp() {
  const tmpDirs = [join(__dirname, './tmp')]
  tmpDirs.forEach(dir => {
    readdirSync(dir).forEach(file => {
      const filePath = join(dir, file)
      const stats = statSync(filePath)
      if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) unlinkSync(filePath)
    })
  })
}

function purgeSession() {
  let prekey = []
  let directorio = readdirSync("./sessions")
  let filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'))
  prekey = [...prekey, ...filesFolderPreKeys]
  filesFolderPreKeys.forEach(file => unlinkSync(`./sessions/${file}`))
}

function purgeSessionSB() {
  try {
    let listaDirectorios = readdirSync('./serbot/')
    listaDirectorios.forEach(directorio => {
      if (statSync(`./serbot/${directorio}`).isDirectory()) {
        readdirSync(`./serbot/${directorio}`).filter(f => f.startsWith('pre-key-')).forEach(file => {
          unlinkSync(`./serbot/${directorio}/${file}`)
        })
      }
    })
  } catch (err) {
    console.log(chalk.bold.red(`Algo salió mal durante la eliminación, archivos no eliminados`))
  }
}

function purgeOldFiles() {
  const directories = ['./sessions/', './serbot/']
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  directories.forEach(dir => {
    readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file)
      const stats = statSync(filePath)
      if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
        unlinkSync(filePath)
      }
    })
  })
}

// Función de actualización de conexión
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) await global.reloadHandler(true).catch(console.error)

  if (qr != 0 && qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) console.log(chalk.yellow('Escanea el código QR.'))
  }

  if (connection == 'open') console.log(chalk.yellow('Conectado correctamente.'))
  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (reason == 405) {
    fs.unlinkSync("./sessions/creds.json")
    console.log(chalk.bold.redBright(`Conexión reemplazada, reiniciando...`))
    process.send('reset')
  }
}

// Carga y recarga de plugins
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
await filesInit()

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true)
    const err = syntaxerror(readFileSync(dir), filename, { sourceType: 'module', allowAwaitOutsideFunction: true })
    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
        global.plugins[filename] = module.default || module
      } catch (e) {
        conn.logger.error(`Error plugin - '${filename}'\n${format(e)}`)
      }
    }
  }
}

watch(pluginFolder, global.reload)
await global.reloadHandler()

// Quick test de dependencias
async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map(p => new Promise(resolve => {
    p.on('close', (code) => resolve(code !== 127))
    p.on('error', () => resolve(false))
  })))
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
  Object.freeze(global.support)
}
await _quickTest()

// Intervalos de limpieza
setInterval(() => { if (!stopped && conn?.user) clearTmp() }, 180000)
setInterval(() => { if (!stopped && conn?.user) purgeSession() }, 1000 * 60 * 60)
setInterval(() => { if (!stopped && conn?.user) purgeSessionSB() }, 1000 * 60 * 60)
setInterval(() => { if (!stopped && conn?.user) purgeOldFiles() }, 1000 * 60 * 60)

process.on('uncaughtException', console.error)