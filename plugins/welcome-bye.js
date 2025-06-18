import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

const mensajesDespedida = [
  `╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫ ┊ {nombre} ┊ (-𝟭) 𝗧𝗲 𝗳𝘂𝗶𝘀𝘁𝗲 𝗺á𝘀 𝗿á𝗽𝗶𝗱𝗼 𝗾𝘂𝗲 𝘁𝘂 𝘃𝗶𝗿𝗴𝗶𝗻𝗶𝗱𝗮. 🚀 ╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
  `╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫ ┊ {nombre} ┊ (-𝟭) 𝗡𝗶 𝘁𝘂 𝗺𝗮𝗺á 𝘁𝗲 𝗲́𝘅𝘁𝗿𝗮ñ𝗮, ¿𝗰𝗿𝗲𝗲𝘀 𝗾𝘂𝗲 𝗻𝗼𝘀𝗼𝘁𝗿𝗼𝘀 𝘀𝗶́? 😂 ╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
  `╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫ ┊ {nombre} ┊ (-𝟭) 𝗦𝗮𝗹𝗶𝘀𝘁𝗲 𝘆 𝗲𝗹 𝗴𝗿𝘂𝗽𝗼 𝗲𝘀 𝗺á𝘀 𝗶𝗻𝘁𝗲𝗹𝗶𝗴𝗲𝗻𝘁𝗲. 🧠🔥 ╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
];

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https://tinyurl.com/ylgu47w3');
  let img = await (await fetch(pp)).buffer();
  let chat = global.db.data.chats[m.chat];

  if (chat.bienvenida && m.messageStubType == 27) {
    let bienvenida = `🌟 *¡Hola, velocidad!* 🌟\n\n¡Bienvenido @${m.messageStubParameters[0].split`@`[0]}!\n¡Estás en ${groupMetadata.subject}!\n¡Vamos a correr! 🏃‍♂️`;
    await conn.sendAi(m.chat, namebot, author, bienvenida, img, img, canal);
  }

  if (chat.bienvenida && m.messageStubType == 28 || m.messageStubType == 32) {
    let nombre = `@${m.messageStubParameters[0].split`@`[0]}`;
    let despedida = mensajesDespedida[Math.floor(Math.random() * mensajesDespedida.length)].replace("{nombre}", nombre);
    await conn.sendAi(m.chat, namebot, author, despedida, img, img, canal);
  }
}