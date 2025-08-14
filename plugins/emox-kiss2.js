// Código creado por Destroy wa.me/584120346669

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    // Determinamos a quién se refiere el comando
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]; // Si hay mención
    } else if (m.quoted) {
        who = m.quoted.sender; // Si se cita un mensaje
    } else {
        who = m.sender; // En caso contrario, el propio usuario
    }

    // Obtenemos nombres de manera asincrónica
    let name = await conn.getName(who);
    let name2 = await conn.getName(m.sender);

    // Reacción opcional
    m.react?.('🏳️‍🌈');

    // Construimos el mensaje según contexto
    let str;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        str = `\`${name2}\` beso excitantemente a \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` beso apasionado a \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` se besa a sí mismo 😏`.trim();
    }

    // Comprobamos si es un grupo
    const isGroup = m.chat.endsWith('@g.us');

    if (isGroup) {
        // Lista de videos
        const videos = [
            'https://qu.ax/bLLe.mp4','https://qu.ax/mwXW.mp4','https://qu.ax/WUiG.mp4',
            'https://qu.ax/djk.mp4','https://qu.ax/xdis.mp4','https://qu.ax/JKEw.mp4',
            'https://qu.ax/eCmG.mp4','https://qu.ax/Rtaw.mp4','https://qu.ax/Esky.mp4',
            'https://qu.ax/AYoP.mp4','https://qu.ax/ulK.mp4','https://qu.ax/xgVd.mp4',
            'https://qu.ax/gchC.mp4','https://qu.ax/DSbr.mp4','https://qu.ax/duCR.mp4',
            'https://qu.ax/aHmt.mp4','https://qu.ax/BmUb.mp4','https://qu.ax/lBqZ.mp4',
            'https://qu.ax/LcxW.mp4','https://qu.ax/MacM.mp4','https://qu.ax/vwbX.mp4',
            'https://qu.ax/hnzN.mp4','https://qu.ax/hqZa.mp4','https://qu.ax/WUE.mp4'
        ];

        // Seleccionamos un video aleatorio
        const video = videos[Math.floor(Math.random() * videos.length)];

        // Mencionamos al usuario correspondiente
        let mentions = [who];

        // Enviamos el mensaje con el video
        conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions
        }, { quoted: m });
    }
};

// Configuración del comando
handler.help = ['kiss2/besar2 @tag'];
handler.tags = ['emox'];
handler.command = ['kiss2','besar2'];
handler.group = true;

// ✅ Funciona sin necesidad de registro
export default handler;