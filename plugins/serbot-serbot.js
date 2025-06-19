const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = await import("@whiskeysockets/baileys")
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "✿ *Vincula tu cuenta usando el qr:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con qr*\n\n> *Qr válido solo para este número.*"
let rtx2 = "✿ *Vincula tu cuenta usando el código:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const yukiJBOptions = {}
if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
  if (subBots.length >= 20) return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathYukiJadiBot = path.join(`./${jadi}/`, id)
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

  yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot
  yukiJBOptions.m = m
  yukiJBOptions.conn = conn
  yukiJBOptions.args = args
  yukiJBOptions.usedPrefix = usedPrefix
  yukiJBOptions.command = command
  yukiJBOptions.fromCommand = true

  await yukiJadiBot(yukiJBOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}
handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options
  if (command === 'code') {
    command = 'qr'; args.unshift('code')
  }
  const mcode = args.some(arg => /(--code|code)/.test(arg?.trim()))
  let txtCode, codeBot, txtQR

  if (mcode) args = args.map(a => a.replace(/^--code$|^code$/, "").trim()).filter(Boolean)

  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  try {
    if (args[0]) fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
  } catch {
    conn.reply(m.chat, `❌ Usa correctamente el comando » ${usedPrefix + command} code`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async () => {
    let { version } = await fetchLatestBaileysVersion()
    const msgRetry = m => {}
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

    const connectionOptions = {
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetry,
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Yuki-Suou', 'Chrome', '2.0.0'],
      version,
      generateHighQualityLinkPreview: true,
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false

    const creloadHandler = async (restart = false) => {
      let handler = await import(`../handler.js?update=${Date.now()}`).then(m => m?.default || m).catch(console.error)
      if (!handler?.handler) return

      if (restart) {
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
    }

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (qr && !mcode) {
        txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx }, { quoted: m })
        if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
      }
      if (qr && mcode) {
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")
        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(secret)
        if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
        if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode || 0
      if (connection === 'close') {
        switch (reason) {
          case DisconnectReason.loggedOut:
          case 401: case 405: case 440:
            console.log(chalk.red(`🟥 Sesión cerrada (${path.basename(pathYukiJadiBot)}), eliminando datos...`))
            fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })
            break
          case 408:
          case 428:
          case 500:
          case 515:
            console.log(chalk.yellow(`🔄 Reintentando conexión (${path.basename(pathYukiJadiBot)})...`))
            await creloadHandler(true)
            break
          default:
            await creloadHandler(true)
        }
      }

      if (connection === 'open') {
        const name = sock.authState.creds.me?.name || 'Anónimo'
        const jid = sock.authState.creds.me?.jid || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`
        console.log(chalk.green(`🟢 ${name} conectado como SubBot: +${path.basename(pathYukiJadiBot)}`))
        global.conns.push(sock)
        await joinChannels(sock)
      }
    }

    await creloadHandler(false)

    // Revisión periódica para reconexión infinita
    setInterval(async () => {
      if (!sock.user || sock.ws.readyState === ws.CLOSED) {
        console.log(chalk.gray(`[SubBot:${path.basename(pathYukiJadiBot)}] Socket cerrado. Reintentando...`))
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions)
        await creloadHandler(true)
      }
    }, 60 * 1000)
  })
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => { })
  }
}