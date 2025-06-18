import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https://tinyurl.com/ylgu47w3');
  let img = await (await fetch(pp)).buffer();
  let chat = global.db.data.chats[m.chat];

  if (chat.bienvenida && m.messageStubType == 27) {
    let bienvenida = `🌟 *¡Hola, velocidad!* 🌟\n\n¡Bienvenido @${m.messageStubParameters[0].split`@`[0]}!\n¡Estás en ${groupMetadata.subject}!\n¡Vamos a correr! 🏃‍♂️`;
    await conn.sendAi(m.chat, namebot, author, bienvenida, img, img, canal);
  }

  if (chat.bienvenida && m.messageStubType == 28) {
    let adios = `👋 *¡Adiós, amigo!* 👋\n\n@${m.messageStubParameters[0].split`@`[0]} se fue...\n¡Hasta luego, colega! 👋`;
    await conn.sendAi(m.chat, namebot, author, adios, img, img, canal);
  }

  if (chat.bienvenida && m.messageStubType == 32) {
    let kick = `🚫 *¡Zona prohibida!* 🚫\n\n@${m.messageStubParameters[0].split`@`[0]} fue expulsado...\n¡No te rindas, amigo! 💪`;
    await conn.sendAi(m.chat, namebot, author, kick, img, img, canal);
  }
}