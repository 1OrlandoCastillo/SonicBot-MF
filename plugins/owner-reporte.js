let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw '⚠ *_Ingrese el error que desea reportar._*'
    if (text.length < 10) throw '⚠️ *_Especifique bien el error, mínimo 10 caracteres._*'
    if (text.length > 1000) throw '⚠️ *_Máximo 1000 caracteres para enviar el error._*'

    const teks = `╭───────────────────
│⊷〘 *R E P O R T E* 🌠 〙⊷
├───────────────────
│⁖🧡꙰  *Cliente:*
│✏️ Wa.me/${m.sender.split`@`[0]}
│
│⁖💚꙰  *Mensaje:*
│📩 ${text}
╰───────────────────`

    let quotedText = m.quoted && m.quoted.text ? `\n\n*Mensaje citado:*\n${m.quoted.text}` : ''

    // Detecta y envía el reporte a todos los owners definidos en global.owner
    let owners = global.owner.map(o => Array.isArray(o) ? o[0] : o) // soporta formatos ['numero','nombre']
    for (let num of owners) {
        let jid = num + '@s.whatsapp.net'
        await conn.reply(
            jid,
            teks + quotedText,
            m,
            typeof conn.parseMention === 'function' ? { mentions: conn.parseMention(teks) } : {}
        )
    }

    m.reply('⚠️ *_El reporte se envió a mis creadores, cualquier informe falso puede ocasionar baneo._*')
}

handler.help = ['reportar']
handler.tags = ['info']
handler.command = /^(reporte|report|reportar|bug|error)$/i
handler.estrellas = 2

export default handler