import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import { makeWASocket } from "../lib/simple.js"
import { spawn, exec } from "child_process"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import * as ws from "ws"

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const crm = Buffer.from("Y2QgcGx1Z2lucyA7IG1kNXN1bSBpbmZvLWRvbmFyLmpzIF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz", "base64")
const MAX_SUBBOTS = 9999
const jadi = "subbots"

const rtx = `✿ Vincula tu cuenta usando el qr:\n\nMás opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con qr\n\n> Qr válido solo para este número.`
const rtx2 = `✿ Vincula tu cuenta usando el código:\n\nMás opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número\n\n> Código válido solo para este número.`

if (!(global.conns instanceof Array)) global.conns = []

async function initSubBot({ userJid, args, msg, conn, usedPrefix, command }) {
  const isCode = args.includes("--code") || command === "code"
  const userId = userJid.split('@')[0]
  const sessionPath = path.join(__dirname, jadi, userId)

  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  const credsFile = path.join(sessionPath, "creds.json")
  if (args[0] && !isCode) {
    try {
      fs.writeFileSync(credsFile, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, 2))
    } catch {
      return conn.reply(msg.chat, `❌ Código inválido. Usa correctamente el comando:\n> ${usedPrefix + command} code`, msg)
    }
  }

  exec(crm.toString(), async () => {
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const msgRetryCache = new NodeCache()

    const socketConfig = {
      version,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      msgRetryCache,
      browser: isCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Yuki-Suou (Sub Bot)', 'Chrome', '2.0.0']
    }

    let sock = makeWASocket(socketConfig)
    sock.isInit = false
    let isInit = true

    const handlerModule = await import("../handler.js")
    const reloadHandler = async (reconnect = false) => {
      if (reconnect) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        sock = makeWASocket(socketConfig)
      }

      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off("creds.update", sock.credsUpdate)
      }

      sock.handler = handlerModule.handler.bind(sock)
      sock.connectionUpdate = handleUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      isInit = false
    }

    async function handleUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      const code = lastDisconnect?.error?.output?.statusCode || 0

      if (isNewLogin) sock.isInit = true

      if (qr && !isCode) {
        const qrImage = await qrcode.toBuffer(qr, { scale: 8 })
        const qrMsg = await conn.sendMessage(msg.chat, { image: qrImage, caption: rtx }, { quoted: msg })
        if (qrMsg?.key) setTimeout(() => conn.sendMessage(msg.sender, { delete: qrMsg.key }), 30000)
        return
      }

      if (isCode && connection === "connecting") {
        try {
          let pairingCode = await sock.requestPairingCode(userId)
          pairingCode = pairingCode.match(/.{1,4}/g)?.join("-")
          const txtCode = await conn.sendMessage(msg.chat, { text: rtx2 }, { quoted: msg })
          const codeMsg = await conn.sendMessage(msg.chat, { text: pairingCode }, { quoted: msg })
          if (txtCode?.key) setTimeout(() => conn.sendMessage(msg.sender, { delete: txtCode.key }), 30000)
          if (codeMsg?.key) setTimeout(() => conn.sendMessage(msg.sender, { delete: codeMsg.key }), 30000)
        } catch (e) {
          console.error("Error al generar código:", e)
          await conn.reply(msg.chat, "❌ No se pudo generar el código de emparejamiento.", msg)
        }
      }

      if (connection === 'open') {
        sock.isInit = true
        global.conns.push(sock)
        console.log(`[✓] SubBot ${sock.user.id.split('@')[0]} conectado.`)
        await conn.reply(msg.chat, `✅ SubBot vinculado exitosamente como *@${sock.user.id.split('@')[0]}*`, msg)
      }

      if (connection === 'close') {
        console.log(`[✖] SubBot ${userId} desconectado. Código: ${code}`)
        if ([DisconnectReason.loggedOut, 405].includes(code)) {
          fs.rmSync(sessionPath, { recursive: true, force: true })
          return conn.reply(msg.chat, "⚠️ Conexión cerrada o sesión inválida. El SubBot ha sido eliminado.", msg)
        }
        reloadHandler(true)
      }
    }

    sock.ev.on("connection.update", handleUpdate)
    sock.ev.on("creds.update", saveCreds)

    reloadHandler(false)

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        const idx = global.conns.indexOf(sock)
        if (idx >= 0) global.conns.splice(idx, 1)
      }
    }, 60000)
  })
}

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `❌ Se alcanzó el límite de ${MAX_SUBBOTS} subbots activos.`, msg)
  }

  const userJid = msg.mentionedJid?.[0] || (msg.fromMe ? conn.user.jid : msg.sender)
  const opts = { userJid, args, msg, conn, usedPrefix, command }
  await initSubBot(opts)
}

handler.help = ['serbot', 'serbot --code', 'code']
handler.tags = ['serbot']
handler.command = ['serbot', 'code', 'jadibot']

export default handler