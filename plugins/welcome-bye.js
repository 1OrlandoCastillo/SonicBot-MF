import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

const mensajesBienvenida = [
  `┊» {nombre} 👾⁩
┊» 𝗖𝗢𝗡𝗧𝗜𝗚𝗢 𝗦𝗢𝗠𝗢𝗦 𝗢𝗧𝗥𝗢 𝗡𝗜𝗩𝗘𝗟
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗶𝗻𝗳𝗼

» Si no lees las reglas, ni llores cuando te saquen.`,
`┊» {nombre} 😈👹
┊» 𝗤𝗨𝗘 𝗟𝗨𝗝𝗢 𝗧𝗘𝗡𝗘𝗥𝗧𝗘
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝗰𝗶𝗼𝗻

» No vengas a desordenar, primero lee las reglas, cabrón.`,
`┊» {nombre} 🔥⁩ 
┊» Llegó el que faltaba
┊» 𝗠𝗔𝗦 𝗩𝗔𝗟𝗘 𝗤𝗨𝗘 𝗡𝗢 𝗟𝗔 𝗖𝗔𝗚𝗨𝗘𝗦
┊» 𝗿𝗲𝘃𝗶𝘀𝗮 𝗹𝗮 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝗰𝗶𝗼𝗻

»⁩ Lee las reglas, no vengas de despistado.`,
`┊» {nombre} 😗
┊» Solo los duros entran
┊» 𝗣𝗢𝗥𝗙𝗔 𝗡𝗢 𝗛𝗔𝗚𝗔𝗦 𝗘𝗟 𝗣𝗔𝗣𝗘𝗟 𝗗𝗘𝗟 𝗧𝗢𝗡𝗧𝗢
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗶𝗻𝗳𝗼

» Reglas primero, después la mamadera.`,
`┊{nombre} 💥⁩ 
┊» Se subió el nivel
┊» 𝗡𝗢 𝗦𝗘𝗔𝗦 𝗗𝗘 𝗘𝗦𝗢𝗦 𝗤𝗨𝗘 𝗡𝗢 𝗟𝗘𝗘𝗡
┊» 𝗿𝗲𝘃𝗶𝘀𝗮 𝗹𝗮 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝗰𝗶𝗼𝗻

» No hagas preguntas tontas, todo está en las reglas.`,
`┊{nombre} 👑⁩
┊» Llegó la leyenda
┊» 𝗣𝗘𝗥𝗢 𝗔𝗤𝗨Í 𝗡𝗢 𝗛𝗔𝗬 𝗘𝗫𝗖𝗨𝗦𝗔𝗦
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗶𝗻𝗳𝗼

» Las reglas no se muerden, léelas.`,
`┊» {nombre} 🦍⁩
┊» El club de los bravos
┊» 𝗦𝗜 𝗡𝗢 𝗧𝗘 𝗚𝗨𝗦𝗧𝗔𝗡 𝗟𝗔𝗦 𝗥𝗘𝗚𝗟𝗔𝗦, 𝗔𝗗𝗜𝗢𝗦 
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗶𝗻𝗳𝗼

» Aquí mandan las reglas, no tú.`,
`┊» {nombre} 😜⁩
┊» Bienvenido, no la cagues
┊» 𝗤𝗨𝗘 𝗡𝗢 𝗧𝗘 𝗦𝗔𝗤𝗨𝗘𝗠𝗢𝗦 𝗣𝗢𝗥 𝗕𝗢𝗕
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗶𝗻𝗳𝗼

» Lee, entiende, y no armes bulla.`,
`┊» {nombre} 🧨⁩
┊» El grupo se puso interesante
┊» 𝗡𝗢 𝗦𝗘𝗔𝗦 𝗣𝗘𝗦𝗔𝗗𝗢, 𝗟𝗘𝗘 𝗟𝗔𝗦 𝗥𝗘𝗚𝗟𝗔𝗦
┊» 𝗿𝗲𝘃𝗶𝘀𝗮 𝗹𝗮 𝗶𝗻𝗳𝗼

» No digas que no te avisamos.`,
`┊» {nombre} 😏😈⁩
┊» Aquí mandamos nosotros
┊» 𝗦𝗜 𝗡𝗢 𝗧𝗘 𝗚𝗨𝗦𝗧𝗔, 𝗣𝗨𝗘𝗥𝗧𝗔
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝗰𝗶𝗼𝗻

» Las reglas no se discuten, se cumplen.`,
`┊» {nombre} 😅⁩
┊» El que no lee, la embarra
┊» 𝗡𝗢 𝗟𝗟𝗢𝗥𝗘𝗦 𝗗𝗘𝗦𝗣𝗨𝗘𝗦
┊» 𝗹𝗲𝗲 𝗹𝗮 𝗶𝗻𝗳𝗼

» Ponte pilas y no hagas burradas.`,
];

const mensajesDespedida = [
  `╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗧𝗲 𝗳𝘂𝗶𝘀𝘁𝗲 𝗺á𝘀 𝗿á𝗽𝗶𝗱𝗼 𝗾𝘂𝗲 𝘁𝘂 𝘃𝗶𝗿𝗴𝗶𝗻𝗶𝗱𝗮. 🚀
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗡𝗶 𝘁𝘂 𝗺𝗮𝗺á 𝘁𝗲 𝗲́𝘅𝘁𝗿𝗮ñ𝗮, ¿𝗰𝗿𝗲𝗲𝘀 𝗾𝘂𝗲 𝗻𝗼𝘀𝗼𝘁𝗿𝗼𝘀 𝘀𝗶́? 😂
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗦𝗮𝗹𝗶𝘀𝘁𝗲 𝘆 𝗲𝗹 𝗴𝗿𝘂𝗽𝗼 𝗲𝘀 𝗺á𝘀 𝗶𝗻𝘁𝗲𝗹𝗶𝗴𝗲𝗻𝘁𝗲. 🧠🔥
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗖𝗶𝗲𝗿𝗿𝗮 𝗹𝗮 𝗽𝘂𝗲𝗿𝘁𝗮 𝗮𝗹 𝘀𝗮𝗹𝗶𝗿, 𝗽𝗲𝗻𝗱𝗲𝗷𝗼. 🚪
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗡𝗼 𝗲𝗿𝗮𝘀 𝗻𝗶 𝗳𝘂𝗻𝗱𝗮𝗺𝗲𝗻𝘁𝗮𝗹, 𝗲𝗿𝗮𝘀 𝗲𝗹 𝗹𝗮𝘀𝘁𝗿𝗲. ⚓️
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗖𝗼𝗻 𝘁𝘂 𝘀𝗮𝗹𝗶𝗱𝗮 𝗲𝗹 𝗴𝗿𝘂𝗽𝗼 𝗽𝗲𝗿𝗱𝗶ó 𝘂𝗻 𝗽𝗲𝘀𝗼 𝗺𝘂𝗲𝗿𝘁𝗼. ⚰️
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗤𝘂𝗲 𝗯𝘂𝗲𝗻𝗼 𝗾𝘂𝗲 𝘁𝗲 𝘃𝗮𝘀, 𝗲𝗿𝗮𝘀 𝗲𝗹 𝘀𝗽𝗮𝗺 𝗵𝘂𝗺𝗮𝗻𝗼. 🗑️
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗦𝗶 𝘃𝗮𝘀 𝗮 𝗰𝗼𝗺𝗼 𝗹𝗹𝗲𝗴𝗮𝘀𝘁𝗲, 𝗻𝗮𝗱𝗶𝗲 𝗹𝗼 𝗻𝗼𝘁𝗮. 🦗
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗣𝗼𝗿 𝗳𝗶𝗻 𝗽𝗼𝗱𝗲𝗺𝗼𝘀 𝗵𝗮𝗯𝗹𝗮𝗿 𝘀𝗶𝗻 𝗽𝗲𝗻𝗱𝗲𝗷𝗲𝘀 𝗾𝘂𝗲 𝗺𝗶𝗿𝗲𝗻. 🎉
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗘𝗻𝘁𝗿𝗮𝘀𝘁𝗲 𝗰𝗼𝗺𝗼 𝗳𝗮𝗻𝘁𝗮𝘀𝗺𝗮, 𝘁𝗲 𝘃𝗮𝘀 𝗰𝗼𝗺𝗼 𝗰𝗮𝗯𝗿ó𝗻. 👻
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗦𝗶 𝗲𝘀𝘁𝗼 𝗳𝘂𝗲𝗿𝗮 𝘂𝗻 𝗿𝗲𝗮𝗹𝗶𝘁𝘆, 𝘁𝗲 𝘀𝗮𝗰𝗮𝗯𝗮𝗺𝗼𝘀 𝗽𝗼𝗿 𝗶𝗻ú𝘁𝗶𝗹. 📺
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗣𝗲𝗿𝗱𝗼́𝗻 𝗽𝗲𝗿𝗼 𝗲𝘀𝘁𝗼 𝗻𝗼 𝗲𝘀 𝘁𝘂 𝗮𝗻𝗶𝗺𝗲, 𝗮𝗾𝘂í 𝗻𝗼 𝗲𝗿𝗮𝘀 𝗽𝗿𝗼𝘁𝗮𝗴𝗼𝗻𝗶𝘀𝘁𝗮. 🍥
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗟𝗮 𝘀𝗮𝗹𝗶𝗱𝗮 𝗱𝗲𝗹 𝗮ñ𝗼, 𝗵𝗮𝘀𝘁𝗮 𝗲𝗹 𝗯𝗼𝘁 𝘀e fue
┊ (-𝟭) 𝗡𝗼 𝘁𝗲 𝗱𝗲𝘀𝗽𝗲𝗱𝗶𝗺𝗼𝘀, 𝘁𝗲 𝗲𝘅𝗽𝘂𝗹𝘀𝗮𝗺𝗼𝘀 𝗱𝗲 𝗺𝗲𝗻𝘁𝗲. 🧹
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗘𝗹 𝗴𝗿𝘂𝗽𝗼 𝘀𝗲 𝗹𝗶𝗺𝗽𝗶𝗮, 𝘀𝗲 𝘃𝗮 𝗲𝗹 𝗽𝗼𝗹𝘃𝗼. 🧽
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗤𝘂𝗲𝗱𝗮𝘁𝗲 𝗳𝘂𝗲𝗿𝗮, 𝗽𝗼𝗿 𝗳𝗮𝗹𝘁𝗮 𝗱𝗲 𝗮𝗰𝘁𝗶𝘃𝗶𝗱𝗮𝗱. 💤
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗗𝗲 𝗹𝗼𝘀 𝗰𝗿𝗲𝗮𝗱𝗼𝗿𝗲𝘀 𝗱𝗲 '𝗻𝗮𝗱𝗶𝗲 𝘁𝗲 𝗿𝗲𝗰𝗼𝗿𝗱𝗮𝗿á', 𝗹𝗲𝗴𝗮 '𝗻𝗮𝗱𝗶𝗲 𝗹𝗹𝗼𝗿𝗮𝗿á'. 🎬
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈{nombre}
┊ (-𝟭) 𝗧𝘂 𝘀𝗮𝗹𝗶𝗱𝗮 𝘀𝗲 𝗳𝗲𝘀𝘁𝗲𝗷𝗮 𝗺á𝘀 𝗾𝘂𝗲 𝘂𝗻 𝗴𝗼𝗹. ⚽️
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗡𝗶 𝗲𝗹 𝗯𝗼𝘁 𝘁𝗲 𝗮𝗴𝗿𝗲𝗴𝗮 𝗮 𝘀𝘂𝘀 𝗰𝗼𝗻𝘁𝗮𝗰𝘁𝗼𝘀. 🤳
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗣𝗼𝗿 𝘁𝗶 𝗲𝗹 𝗴𝗿𝘂𝗽𝗼 𝘀𝗲 𝗹𝗹𝗮𝗺𝗮𝗿á 𝗲𝗹 𝗰𝗹𝘂𝗯 𝗱𝗲 𝗹𝗼𝘀 𝗼𝗹𝘃𝗶𝗱𝗮𝗱𝗼𝘀. 🎭
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗛𝗼𝘆 𝗲𝘀 𝘁𝘂 𝗱𝗶́𝗮 𝗱𝗲 𝘀𝘂𝗲𝗿𝘁𝗲, 𝗻𝗮𝗱𝗶𝗲 𝗲𝘀𝗰𝗿𝗶𝗯𝗶𝗿á 𝗲𝘀𝘁𝗲 𝗮𝗱𝗶𝗼́𝘀. 🍀
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗘𝘀𝘁𝗲 𝗰𝗵𝗮𝘁 𝘀𝗲 𝗿𝗲𝗶́𝗿𝗮 𝗺á𝘀 𝘀𝗶𝗻 𝘁𝗶. 😂
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗦𝗲 𝘃𝗮 𝘂𝗻 𝗽𝗿𝗼𝗯𝗹𝗲𝗺𝗮, 𝗻𝗼 𝘂𝗻 𝗮𝗺𝗶𝗴𝗼. 😬
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ {nombre}
┊ (-𝟭) 𝗡𝗶 𝗲𝗻 𝗲𝗹 𝗶𝗻𝗳𝗶𝗲𝗿𝗻𝗼 𝗰𝗲𝗹𝗲𝗯𝗿𝗮𝗻 𝘁𝘂 𝗹𝗲𝗴𝗮𝗱𝗼. 🔥
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
];

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https://files.catbox.moe/hjl3b6.jpg');
  let img = await (await fetch(pp)).buffer();
  let chat = global.db.data.chats[m.chat];

  if (chat.bienvenida && (m.messageStubType == 27)) {
    let nombre = `@${m.messageStubParameters[0].split`@`[0]}`;
    let bienvenida = mensajesBienvenida[Math.floor(Math.random() * mensajesBienvenida.length)].replace(/{nombre}/g, nombre);
    await conn.sendAi(m.chat, namebot, author, bienvenida, img, img, canal);
  }

  if (chat.bienvenida && (m.messageStubType == 28 || m.messageStubType == 32)) {
    let nombre = `@${m.messageStubParameters[0].split`@`[0]}`;
    let despedida = mensajesDespedida[Math.floor(Math.random() * mensajesDespedida.length)].replace(/{nombre}/g, nombre);
    await conn.sendAi(m.chat, namebot, author, despedida, img, img, canal);
  }
}