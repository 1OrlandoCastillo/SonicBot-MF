// Código creado por Destroy wa.me/584120346669

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name = await conn.getName(who);
    let name2 = await conn.getName(m.sender);

    m.react('😍');

    let str;
    if ((m.mentionedJid && m.mentionedJid.length > 0) || m.quoted) {
        str = `\`${name2}\` *está enamorad﹫ de* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *está enamorad﹫.*`.trim();
    }

    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/5fbd60c40ab190ecc8e1c.mp4',
            'https://telegra.ph/file/ca30d358d292674698b40.mp4',
            'https://telegra.ph/file/25f88386dd7d4d6df36fa.mp4',
            'https://telegra.ph/file/eb63131df0de6b47c7ab7.mp4',
            'https://telegra.ph/file/209990ee46c645506a5fc.mp4',
            'https://telegra.ph/file/440f276fcbb2d04cbf1d1.mp4',
            'https://telegra.ph/file/42cea67d9b013ed9a9cd0.mp4',
            'https://telegra.ph/file/bc0f47b8f3fb9470bc918.mp4',
            'https://telegra.ph/file/79ae875090b64ab247b7a.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['love2/enamorada @tag'];
handler.tags = ['anime'];
handler.command = ['love','amor','enamorada'];
handler.group = true;

export default handler;