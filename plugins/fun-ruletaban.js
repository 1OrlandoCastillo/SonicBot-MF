/* RuletaBan By WillZek (Optimizado por SonicBot-ProMax ⚡)
- Elimina a un usuario aleatoriamente
- Solo administradores pueden usarlo
- El bot debe ser administrador
*/

let handler = async (m, { conn, participants }) => {
    try {
        const botId = conn.user.jid
        const botInGroup = participants.find(p => p.id === botId)

        // Validar que el bot sea admin
        if (!botInGroup?.admin) {
            return m.reply('✤ Hola, el bot debe ser *Administrador* para ejecutar este Comando.')
        }

        // Filtrar administradores y dueño
        const gAdmins = participants.filter(p => p.admin !== null)
        const gOwner = gAdmins.find(p => p.admin === 'superadmin')?.id

        // Filtrar candidatos válidos (ni bot, ni owner, ni admins)
        const gNoAdmins = participants.filter(
            p => p.id !== botId && p.id !== gOwner && !p.admin
        )

        // Validaciones
        if (participants.length === gAdmins.length) {
            return m.reply('*⚠️ Solo hay administradores en este grupo.*')
        }

        if (gNoAdmins.length === 0) {
            return m.reply('*⚠️ No hay usuarios válidos para eliminar.*')
        }

        // Selección aleatoria
        const randomUser = gNoAdmins[Math.floor(Math.random() * gNoAdmins.length)]
        const tag = await conn.getName(randomUser.id)

        // Aviso previo
        await conn.reply(m.chat, `*🌠 Selección Aleatoria: ${tag}*\n> Serás Eliminado`, m)

        // Expulsión
        await conn.groupParticipantsUpdate(m.chat, [randomUser.id], 'remove')

        // Aviso final
        await conn.reply(m.chat, `*${tag}* Fue Eliminado Con Éxito 🎩`, m)
        await m.react('✅')
    } catch (e) {
        console.error(e)
        m.reply('⚠️ Ocurrió un error al ejecutar la RuletaBan.')
    }
}

handler.help = ['ruletaban']
handler.tags = ['grupo']
handler.command = /^(kickrandom|ruletaban|rban)$/i
handler.admin = true     // Solo administradores pueden usarlo
// ❌ handler.botAdmin eliminado

export default handler