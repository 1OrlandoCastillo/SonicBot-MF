let handler = async (m, { conn, isAdmin, isROwner} ) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    global.db.data.chats[m.chat].isBanned = false
    await conn.reply(m.chat, '𖧏 Hola, la interacción de este chat ha sido *Desbaneado* con exito Correctamente.', m, rcanal)
    await m.react('✅')
}
handler.help = ['desbanearbot']
handler.tags = ['group']
handler.command = ['desbanearbot', 'unbanchat']
handler.group = true 
export default handler
