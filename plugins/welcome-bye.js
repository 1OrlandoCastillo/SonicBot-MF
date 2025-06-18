import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  let pp = 'https:                                             
  try {
    pp = await conn.profilePictureUrl(m.messageStubParameters[0], '//telegra.ph/file/6880771a42bad09dd6087.jpg';
  try {
    pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image');
  } catch (e) {}

  let chat = global.db.data.chats[m.chat];

  if (chat.bienvenida && m.messageStubType == 27) {
    let bienvenida = `🎉 **Bienvenido** 🎉\n\nHola @${m.messageStubParameters[0].split`@`[0]} 👋\nBienvenido a ${groupMetadata.subject} 🤩\n\nEspero que te guste estar aquí 😊`;
    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: bienvenida,
      mentions: [m.messageStubParameters[0]],
    });
  }

  if (chat.bienvenida && (m.messageStubType == 28 || m.messageStubType == 32)) {
    let bye = `👋 **Adiós** 👋\n\n@${m.messageStubParameters[0].split`@`[0]} se fue 😢\nEsperamos verte de nuevo 🤗`;
    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: bye,
      mentions: [m.messageStubParameters[0]],
    });
  }
}