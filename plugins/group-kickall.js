/* 
- Kickall By Angel-OFC  
- elimina todos de un grupo con un comando 
- https://whatsapp.com/channel/0029VaJxgcB0bIdvuOwKTM2Y
- Mejorado Por WillZek🗿🍷
- Optimizado, seguro y compatible con todas las versiones de Baileys
*/
import axios from 'axios';

let handler = async (m, { conn, participants }) => {

    if (!participants) throw '*⚠️ No se pudo obtener la lista de miembros del grupo.*';

    const botId = conn.user.jid;
    const ownerId = m.sender;

    // Filtramos: no bot, no dueño, no admins
    const groupNoAdmins = participants
        .filter(p => p.id !== botId && p.id !== ownerId && !p.admin)
        .map(p => p.id);

    if (groupNoAdmins.length === 0) throw '*⚠️ No hay usuarios para eliminar.*';

    try {
        // Enviamos sticker como confirmación visual
        await conn.sendMessage(m.chat, {
            image: { url: 'https://files.catbox.moe/agx2sc.webp' },
            caption: ''
        });

        // Expulsión masiva de todos los no-admins
        await conn.groupParticipantsUpdate(m.chat, groupNoAdmins, 'remove');

        // Mensaje final
        await conn.sendMessage(m.chat, { text: '*⚔️ Eliminación Exitosa.*' });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '*❌ Ocurrió un error al intentar eliminar usuarios.*' });
    }
};

handler.help = ['kickall'];
handler.tags = ['grupo'];
handler.command = /^(kickall)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;