import { performance } from 'perf_hooks'

const handler = async (m, { conn, text }) => {
    let who, userName

    // Determinar el usuario objetivo
    if (m.isGroup) {
        if (m.mentionedJid?.length) {
            who = m.mentionedJid[0]
        } else if (m.quoted) {
            who = m.quoted.sender
        } else {
            who = m.chat
        }
    } else {
        who = m.chat
    }

    if (!who) return conn.reply(m.chat, `⚠️ Por favor, menciona a un usuario o responde a un mensaje.`, m)

    userName = await conn.getName(who)
    if (!userName) userName = text || 'Usuario desconocido'

    // Mensaje inicial
    await conn.sendMessage(m.chat, { text: `🧑‍💻 *Iniciando doxeo*...` }, { quoted: m })

    // Simulación de carga 0% a 100% en saltos aleatorios
    for (let p = 0; p <= 100; p += Math.floor(Math.random() * 20) + 1) {
        await delay(800)
        await conn.sendMessage(m.chat, { text: `*${Math.min(p, 100)}%*` }, { quoted: m })
    }

    // Medir tiempo de respuesta
    let start = performance.now()
    await delay(100) // Simulación de procesamiento
    let end = performance.now()
    let speed = `${(end - start).toFixed(2)} ms`

    // Mensaje final
    let doxeo = `👤 *Persona doxeada* 

📅 ${new Date().toLocaleDateString()}
⏰ ${new Date().toLocaleTimeString()}
⚡ Velocidad: ${speed}

📢 Resultados:
*Nombre:* ${userName}
*IP:* 92.28.211.234
*MAC:* 5A:78:3E:7E:00
*ISP:* Ucom universal 
*DNS:* 8.8.8.8 | 1.1.1.1
*Gateway:* 192.168.0.1
*Puertos abiertos:* UDP 8080, 80 | TCP 443
*Router:* ERICCSON | TPLINK COMPANY
`

    await conn.sendMessage(m.chat, { text: doxeo, mentions: conn.parseMention(doxeo) }, { quoted: m })
}

handler.help = ['doxear']
handler.tags = ['fun']
handler.command = ['doxear', 'doxxeo', 'doxeo']
handler.group = true
handler.register = false

export default handler

// Funciones auxiliares
const delay = (ms) => new Promise((res) => setTimeout(res, ms))