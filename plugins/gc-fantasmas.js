import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, participants, command, text }) => {

let member = participants.map(u => u.id)
let total = 0
let sider = []
let sum = text ? Number(text) : member.length

for (let i = 0; i < sum; i++) {
    let user = m.isGroup ? participants.find(u => u.id == member[i]) : {}
    let data = global.db.data.users[member[i]]
    if ((!data || data.chat == 0) && !user?.admin && !user?.superAdmin) {
        if (!data || data.whitelist == false) {
            total++
            sider.push(member[i])
        }
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms))

switch (command) {
    case 'fantasmas': 
        if (total == 0) return conn.reply(m.chat, '✅ Este grupo es activo, no tiene fantasmas.', m) 
        m.reply(`👻 *Revisión de inactivos*\n\n📋 *Lista de fantasmas:*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n📝 *Nota:* El conteo empieza desde que el bot se activa en este número.`, null, { mentions: sider }) 
        break

    case 'kickfantasmas':  
        if (total == 0) return conn.reply(m.chat, '✅ Este grupo es activo, no tiene fantasmas.', m) 
        await m.reply(`👻 *Eliminación de inactivos*\n\n📋 *Lista de fantasmas:*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n🕒 El bot eliminará un usuario cada 10 segundos.`, null, { mentions: sider }) 
        await delay(10000)
        let chat = global.db.data.chats[m.chat]
        chat.welcome = false
        try {
            for (let user of sider) {
                if (user.endsWith('@s.whatsapp.net') && !(participants.find(v => areJidsSameUser(v.id, user)) || { admin: true }).admin) {
                    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                    await delay(10000)
                }
            }
        } finally {
            chat.welcome = true
        }
        break
}

}

handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler