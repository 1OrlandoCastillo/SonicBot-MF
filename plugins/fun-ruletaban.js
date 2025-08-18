/* RuletaBan By WillZek (Optimizado por SonicBot-ProMax ⚡)
- Elimina a un usuario aleatoriamente
- https://github.com/WillZek 
*/

let handler = async (m, { conn, participants }) => {
    try {
        // Filtrar admins
        const gAdmins = participants.filter(p => p.admin !== null);
        const botId = conn.user.jid;
        const gOwner = gAdmins.find(p => p.admin === 'superadmin')?.id;

        // Filtrar los que no son admins, ni el bot ni el owner
        const gNoAdmins = participants.filter(
            p => p.id !== botId && p.id !== gOwner && !p.admin
        );

        // Validaciones
        if (participants.length === gAdmins.length) {
            return m.reply('*⚠️ Solo hay administradores en este grupo.*');
        }

        if (gNoAdmins.length === 0) {
            return m.reply('*⚠️ No hay usuarios válidos para eliminar.*');
        }

        // Selección aleatoria
        const randomUser = gNoAdmins[Math.floor(Math.random() * gNoAdmins.length)];
        const tag = await conn.getName(randomUser.id);

        // Aviso previo
        await conn.reply(m.chat, `*🌠 Selección Aleatoria: ${tag}*\n> Serás Eliminado`, m);

        // Expulsión
        await conn.groupParticipantsUpdate(m.chat, [randomUser.id], 'remove');

        // Aviso final
        await conn.reply(m.chat, `*${tag}* Fue Eliminado Con Éxito 🎩`, m);
        await m.react('✅');
    } catch (e) {
        console.error(e);
        m.reply('⚠️ Ocurrió un error al ejecutar la RuletaBan.');
    }
};

handler.help = ['ruletaban'];
handler.tags = ['grupo'];
handler.command = /^(kickrandom|ruletaban|rban)$/i;
handler.admin = true;
handler.botAdmin = true;

export default handler;