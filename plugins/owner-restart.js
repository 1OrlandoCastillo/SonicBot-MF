let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw '⚠ *_Ingrese el error que desea reportar._*'
    if (text.length < 10) throw '⚠️ *_Especifique bien el error, mínimo 10 caracteres._*'
    if (text.length > 1000) throw '⚠️ *_Máximo 1000 caracteres para enviar el error._*'
    const teks = `╭───────────────────\n│⊷〘 *R E P O R T E* 🌠 〙⊷\n├───────────────────\n│⁖🧡꙰  *Cliente:*\n│✏️ Wa.me/${m.sender.split`@`[0]}\n│\n│⁖💚꙰  *Mensaje:*\n│📩 ${text}\n╰───────────────────`
    let quotedText = m.quoted && m.quoted.text ? `\n\n*Mensaje citado:*\n${m.quoted.text}` : ''
    // Detecta correctamente el número del owner para ambos formatos
    let ownerNumber = (Array.isArray(global.owner[0]) ? global.owner[0][0] : global.owner[0]) + '@s.whatsapp.net'
    await conn.reply(
        ownerNumber,
        teks + quotedText,
        m,
        typeof conn.parseMention === 'function' ? { mentions: conn.parseMention(teks) } : {}
    )
    m.reply('⚠️ *_El reporte se envió a mi creador, cualquier informe falso puede ocasionar baneo._*')
}
handler.help = ['reportar']
handler.tags = ['info']
handler.command = /^(reporte|report|reportar|bug|error)$/i
handler.estrellas = 2
export default handler