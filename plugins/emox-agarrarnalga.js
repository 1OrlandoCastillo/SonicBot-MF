// Código creado por Niño Piña wa.me/50557865603
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    let who;

    // Determinamos a quién se refiere el comando
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    // Reacción de durazno 🍑
    m.react('🍑');

    if (m.isGroup) {
        // GIFs de ejemplo
        const gifs = [
            'https://files.catbox.moe/yjulgu.mp4',
            'https://files.catbox.moe/erm82k.mp4',
            'https://files.catbox.moe/9m1nkp.mp4',
            'https://files.catbox.moe/rzijb5.mp4'
        ];

        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        // Enviamos solo el video/GIF sin texto
        conn.sendMessage(m.chat, { video: { url: gif }, gifPlayback: true }, { quoted: m });
    }
};

handler.help = ['agarrarnalgas @tag'];
handler.tags = ['emox'];
handler.command = ['agarrarnalgas'];
handler.group = true;

export default handler;