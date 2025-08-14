/* 
- Kickall By Angel-OFC  
- elimina todos de un grupo con un comando 
- https://whatsapp.com/channel/0029VaJxgcB0bIdvuOwKTM2Y
- Mejorado Por WillZek🗿🍷
- Optimizado y seguro (solo expulsa no-admins)
*/
import axios from 'axios';

let handler = async (m, { conn, participants }) => {

    const groupAdmins = participants.filter(p => p.admin); // lista de admins
    const botId = conn.user.jid;
    const ownerId = m.sender; // ID del que ejecuta el comando

    // Filtramos: no bot, no dueño, no admins
    const groupNoAdmins = participants
        .filter(p => p.id !== botId && p.id !== ownerId && !p.admin)
        .map(p => p.id);

    if (groupNoAdmins.length === 0) throw '*⚠️ No hay usuarios para eliminar.*'; 

    const stickerUrl = 'https://files.catbox.moe/agx2sc.webp'; 
    m.react('💫');
    await conn.sendFile(m.chat, stickerUrl, 'sticker.webp', '', m, null);

    // Expulsión masiva
    await conn.groupParticipantsUpdate(m.chat, groupNoAdmins, 'remove');

    conn.reply(m.chat, '*⚔️ Eliminación Exitosa.*', m);
    m.react('✅');
};

handler.help = ['kickall'];
handler.tags = ['grupo'];
handler.command = /^(kickall)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;