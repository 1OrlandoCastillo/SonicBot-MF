import { existsSync, promises as fs } from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    const rwait = '⌛', done = '✅', rcanal = null

    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, '🚩 *Utiliza este comando directamente en el número principal del Bot*', m, rcanal)
    }
    await conn.reply(m.chat, '🚩 *Iniciando proceso de eliminación de todos los archivos de sesión, excepto el archivo creds.json...*', m, rcanal)
    if (typeof m.react === 'function') await m.react(rwait)

    let sessionPath = path.resolve('./CrowSession/')

    try {
        if (!existsSync(sessionPath)) {
            return await conn.reply(m.chat, '🚩 *La carpeta CrowSession no existe o está vacía*', m, rcanal)
        }
        let files = await fs.readdir(sessionPath)
        let filesDeleted = 0
        for (const file of files) {
            if (file !== 'creds.json') {
                await fs.unlink(path.join(sessionPath, file))
                filesDeleted++
            }
        }
        if (filesDeleted === 0) {
            await conn.reply(m.chat, '🚩 *No se encontró ningún archivo para eliminar (excepto creds.json)*', m, rcanal)
        } else {
            if (typeof m.react === 'function') await m.react(done)
            await conn.reply(m.chat, `🚩 *Se eliminaron ${filesDeleted} archivos de sesión (excepto creds.json)*`, m, rcanal)
            await conn.reply(m.chat, `🚩 *¡Hola! ¿logras verme?*`, m, rcanal)
        }
    } catch (err) {
        console.error('Error al leer la carpeta o los archivos de sesión:', err)
        await conn.reply(m.chat, '🚩 *Ocurrió un fallo inesperado*', m, rcanal)
    }
}
handler.help = ['dsowner']
handler.tags = ['owner']
handler.command = /^(delzero|dsowner|clearallsession)$/i
handler.rowner = true

export default handler