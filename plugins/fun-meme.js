// ig : https://www.instagram.com/fg98._/
import hispamemes from 'hispamemes'
let handler = async (m, { conn, usedPrefix, command }) => {
    // Definir el emoji y el dev si no están definidos globalmente
    const dev = 'Orlando Castillo'
    const emoji2 = '😂'

    const meme = await hispamemes.meme()
    if (!meme) return m.reply('No se pudo obtener un meme, intenta de nuevo.')

    await conn.sendMessage(m.chat, { 
        image: { url: meme }, 
        caption: '¡Aqui Está Tu Meme!🤣',
        viewOnce: true
    }, { quoted: m })

    await m.react(emoji2)
}
handler.help = ['meme']
handler.tags = ['fun']
handler.command = ['meme', 'memes']
handler.estrellas = 1
handler.register = true
export default handler