import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    this.msgqueue = this.msgqueue || []
    if (!chatUpdate) return
    if (this.pushMessage) await this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return

        m.exp = 0
        m.estrellas = false

        try {
            let user = global.db.data.users[m.sender] || {}
            global.db.data.users[m.sender] = user

            if (!isNumber(user.exp)) user.exp = 0
            if (!isNumber(user.estrellas)) user.estrellas = 10
            if (!('muto' in user)) user.muto = false
            if (!('premium' in user)) user.premium = false
            if (!user.premium) user.premiumTime = 0
            if (!('registered' in user)) user.registered = false
            if (!user.registered) {
                if (!('name' in user)) user.name = m.name
                if (!isNumber(user.age)) user.age = -1
                if (!isNumber(user.warn)) user.warn = 0
                if (!isNumber(user.regTime)) user.regTime = -1
            }
            if (!isNumber(user.afk)) user.afk = -1
            if (!('afkReason' in user)) user.afkReason = ''
            if (!('language' in user)) user.language = 'es'
            if (!('banned' in user)) user.banned = false
            if (!('useDocument' in user)) user.useDocument = false
            if (!isNumber(user.level)) user.level = 0
            if (!isNumber(user.bank)) user.bank = 0

            let chat = global.db.data.chats[m.chat] || {}
            global.db.data.chats[m.chat] = chat
            if (!('isBanned' in chat)) chat.isBanned = false
            if (!('welcome' in chat)) chat.welcome = true
            if (!('audios' in chat)) chat.audios = false
            if (!('detect' in chat)) chat.detect = true
            if (!('antiLink' in chat)) chat.antiLink = false
            if (!('antiLink2' in chat)) chat.antiLink2 = false
            if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
            if (!('nsfw' in chat)) chat.nsfw = false
            if (!('autoAceptar' in chat)) chat.autoAceptar = false
            if (!('reaction' in chat)) chat.reaction = false
            if (!('simi' in chat)) chat.simi = false
            if (!('autolevelup' in chat)) chat.autolevelup = false
            if (!('antiBot2' in chat)) chat.antiBot2 = false
            if (!('antitoxic' in chat)) chat.antitoxic = false
            if (!('autoresponder' in chat)) chat.autoresponder = false
            if (!('antiver' in chat)) chat.antiver = false
            if (!('delete' in chat)) chat.delete = false
            if (!isNumber(chat.expired)) chat.expired = 0

            let settings = global.db.data.settings[this.user.jid] || {}
            global.db.data.settings[this.user.jid] = settings
            if (!('self' in settings)) settings.self = false
            if (!('restrict' in settings)) settings.restrict = false
            if (!('jadibotmd' in settings)) settings.jadibotmd = true
            if (!('autobio' in settings)) settings.autobio = true
            if (!('antiPrivate' in settings)) settings.antiPrivate = false
            if (!('autoread' in settings)) settings.autoread = false
            if (!('autoread2' in settings)) settings.autoread2 = false
            if (!('antiSpam' in settings)) settings.antiSpam = false

        } catch (e) {
            console.error(e)
        }

        if (!m.fromMe && opts?.self) return
        if (opts?.swonly && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        let _user = global.db.data?.users?.[m.sender]
        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)]
            .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isOwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user?.prem || isMods

        if (opts?.queque && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueue, time = 5000
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)

        // Aquí seguiría la lógica de plugins igual que en tu código original
        // Asegúrate de definir conn, opts, fake y rcanal en tu scope global

    } catch (e) {
        console.error(e)
    } finally {
        if (opts?.queque && m.text) {
            const quequeIndex = this.msgqueue.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueue.splice(quequeIndex, 1)
        }
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant } = message
        if (fromMe) return
        let msg = this.serializeM(this.loadMessage(id))
        let chat = global.db.data.chats[msg?.chat] || {}
        if (!chat?.delete) return
        if (!msg?.isGroup) return
        const antideleteMessage = `╭•┈•〘❌ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ❌〙•┈• ◊
│❒ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢:
│• @${participant.split`@`[0]}
│
│❒ 𝗔𝗰𝗮𝗯𝗮 𝗱𝗲 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝗿 𝘂𝗻 𝗺𝗲𝗻𝘀𝗮𝗷𝗲
│𝗿𝗲𝗲𝗻𝘃𝗶𝗮𝗻𝗱𝗼... ⏱️
╰•┈•〘❌ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ❌〙•┈• ◊`.trim()
        await this.sendMessage(msg.chat, { text: antideleteMessage, mentions: [participant] }, { quoted: msg })
        this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
    } catch (e) {
        console.error(e)
    }
}

global.dfail = (type, m, conn) => {
    const msg = {
        rowner: '《★》Esta función solo puede ser usada por mi creador', 
        owner: '《★》Esta función solo puede ser usada por mi desarrollador.', 
        mods: '《★》Esta función solo puede ser usada por los moderadores del bot', 
        premium: '《★》Esta función solo es para usuarios Premium.', 
        group: '《★》Esta funcion solo puede ser ejecutada en grupos.', 
        private: '《★》Esta función solo puede ser usada en chat privado.', 
        admin: '《★》Este comando solo puede ser usado por admins.', 
        botAdmin: '《★》Para usar esta función debo ser admin.',
        unreg: `《★》No te encuentras registrado, registrese para usar esta función\n*/reg nombre.edad*\n\n*Ejemplo* : */reg Crow.18*`,
        restrict: '《★》Esta característica esta desactivada.'
    }[type]
    if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})