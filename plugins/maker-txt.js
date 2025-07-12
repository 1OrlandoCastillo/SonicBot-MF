const wm = global.wm || '💫 𝐒𝐮𝐩𝐞𝐫 𝐁𝐨𝐭 𝐃𝐞 𝐖𝐡𝐚𝐭𝐬𝐚𝐩𝐩 🥳'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : ''

    if (command == 'txt' || command == 'escribir') {
        if (!teks) throw `⚠️ 𝙌𝙐𝙀 𝙀𝙎𝘾𝙍𝙄𝘽𝙄𝙊? 𝙐𝙎𝘼𝙍 𝙀𝙎𝙏𝙀 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 𝘿𝙀 𝙇𝘼 𝙎𝙄𝙂𝙐𝙄𝙀𝙉𝙏𝙀 𝙁𝙊𝙍𝙈𝘼\n\n𝙀𝙅𝙀𝙈𝙋𝙇𝙊: *${usedPrefix + command}* Hola LoliBot`;
        let img = `${global.APIs.fgmods.url}/maker/txt?text=${encodeURIComponent(teks)}&apikey=${global.APIs.fgmods.key}`;
        await conn.sendFile(m.chat, img, 'img.png', `✍🏻 𝙀𝙎𝙏𝘼 𝙇𝙄𝙎𝙏𝙊!!\n${wm}`, m);
    }

    if (command == 'brat') {    
        if (!teks) throw `⚠️ Ingresar en texto\nEj: *${usedPrefix + command}* case "hola":\nm.reply("que onda")\nbreak`
        let img = `${global.APIs.fgmods.url}/maker/carbon?text=${encodeURIComponent(teks)}&apikey=${global.APIs.fgmods.key}`;
        await conn.sendFile(m.chat, img, 'carbon.png', ``, m);
    }
}

handler.help = ['txt', 'brat']
handler.tags = ['game']
handler.command = ['txt', 'escribir', 'brat']
handler.limit = 1
export default handler