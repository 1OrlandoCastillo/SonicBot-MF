// Código creado por Destroy wa.me/584120346669

let handler = async (m, { conn }) => {
    let who;

    // Determinar a quién va dirigido el comando
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    // Obtener nombres con fallback
    let name = who ? conn.getName(who) : 'desconocido';
    let name2 = conn.getName(m.sender) || 'desconocido';

    // Reacción al mensaje
    if (m.react) {
        m.react('😝');
    } else {
        conn.sendMessage(m.chat, { reaction: { text: '😝', key: m.key } });
    }

    // Construcción del mensaje
    let str;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        str = `\`${name2}\` le sacó la lengua a \`${name}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` le sacó la lengua a \`${name}\`.`;
    } else {
        str = `\`${name2}\` saca la lengua`.trim();
    }

    // Enviar video en grupos
    if (m.isGroup) {
        const videos = [
            'https://files.catbox.moe/qhcqag',
            'https://files.catbox.moe/tnsdlr.mp4',
            'https://files.catbox.moe/fox9sl.mp4',
            'https://files.catbox.moe/lh4c2n.mp4',
            'https://files.catbox.moe/y2zg7b.mp4',
            'https://qu.ax/rlvKj.mp4',
            'https://qu.ax/sYXfh.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];

        const mentions = [who]; // Mencionamos al usuario correspondiente
        conn.sendMessage(
            m.chat,
            { video: { url: video }, gifPlayback: true, caption: str, mentions },
            { quoted: m }
        );
    }
}

// Comandos y tags
handler.help = ['bleh/lengua @tag'];
handler.tags = ['emox'];
handler.command = ['bleh', 'lengua'];
handler.group = true;

export default handler;