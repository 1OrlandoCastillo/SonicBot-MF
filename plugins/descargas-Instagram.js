import { igdl } from "ruhend-scraper"

let handler = async (m, { args, conn }) => { 
    if (!args[0]) {
        return conn.reply(m.chat, '《★》Ingresa un link de Instagram.', m)
    }
    try {
        // Reacción de espera opcional
        await m.react('🕒')
        conn.reply(m.chat, '🕒 *Enviando El Video...*', m)

        let res = await igdl(args[0])
        let data = res.data

        for (let media of data) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            await conn.sendFile(m.chat, media.url, 'instagram.mp4', '🎞️ *Tu video de Instagram*', m)
        }
    } catch (err) {
        console.log(err)
        await m.react('❌')
        conn.reply(m.chat, 'Ocurrió un error al descargar el video.', m)
    }
}

handler.command = ['igdl', 'ig']
handler.tags = ['descargas']
handler.help = ['igdl']
handler.estrellas = 8
handler.group = true
handler.register = false  // Funciona sin registro

export default handler