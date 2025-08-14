// Código creado por WillZek wa.me/50557865603

let handler = async (m, { conn }) => {
    let who;

    // Determinamos a quién va dirigido el mensaje
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]; // Si hay mención
    } else if (m.quoted) {
        who = m.quoted.sender; // Si se cita un mensaje
    } else {
        who = m.sender; // En caso contrario, se refiere a sí mismo
    }

    let name = await conn.getName(who);      // Nombre de la persona mencionada
    let name2 = await conn.getName(m.sender); // Nombre del que envía el comando

    // Reacción del mensaje
    if (m.react) m.react('🫦');

    // Construcción del mensaje
    let str;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        str = `\`${name2}\` le dio besos a \`${name || who}\` ( ˘ ³˘)♥.`;
    } else if (m.quoted) {
        str = `\`${name2}\` besó a \`${name || who}\` 💋.`;
    } else {
        str = `\`${name2}\` se besó a sí mismo ( ˘ ³˘)♥`;
    }

    // Solo funciona en grupos
    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/d6ece99b5011aedd359e8.mp4',
            'https://telegra.ph/file/ba841c699e9e039deadb3.mp4',
            'https://telegra.ph/file/6497758a122357bc5bbb7.mp4',
            'https://telegra.ph/file/8c0f70ed2bfd95a125993.mp4',
            'https://telegra.ph/file/826ce3530ab20b15a496d.mp4',
            'https://telegra.ph/file/f66bcaf1effc14e077663.mp4',
            'https://telegra.ph/file/e1dbfc56e4fcdc3896f08.mp4',
            'https://telegra.ph/file/0fc525a0d735f917fd25b.mp4',
            'https://telegra.ph/file/68643ac3e0d591b0ede4f.mp4',
            'https://telegra.ph/file/af0fe6eb00bd0a8a9e3a0.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];

        const mentions = [who]; // Mencionamos al usuario

        await conn.sendMessage(
            m.chat,
            { video: { url: video }, gifPlayback: true, caption: str, mentions },
            { quoted: m }
        );
    }
};

handler.help = ['kiss/besar @tag'];
handler.tags = ['emox'];
handler.command = ['kiss', 'besar'];
handler.group = true;

export default handler;