// plugins/antilink.js
const fs = require("fs");
const path = require("path");

let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, '');

  // Solo en grupos
  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
    }, { quoted: msg });
  }

  try {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id.includes(senderClean));
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    const isOwner = global.owner.some(o => o[0] === senderClean);

    if (!isAdmin && !isOwner) {
      return conn.sendMessage(chatId, {
        text: "❌ Solo los administradores del grupo o el owner del bot pueden usar este comando."
      }, { quoted: msg });
    }

    if (!args[0] || !['on', 'off'].includes(args[0])) {
      return conn.sendMessage(chatId, {
        text: "⚙️ Usa el comando así:\n\n📌 *.antilink on*  (activar)\n📌 *.antilink off* (desactivar)"
      }, { quoted: msg });
    }

    const subbotID = conn.user.id;
    const filePath = path.resolve("./activossubbots.json");

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ antilink: {} }, null, 2));
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    if (!data.antilink) data.antilink = {};
    if (!data.antilink[subbotID]) data.antilink[subbotID] = {};

    if (args[0] === 'on') {
      data.antilink[subbotID][chatId] = true;
      await conn.sendMessage(chatId, { text: "✅ Antilink *activado* en este grupo." }, { quoted: msg });
    } else {
      delete data.antilink[subbotID][chatId];
      await conn.sendMessage(chatId, { text: "✅ Antilink *desactivado* en este grupo." }, { quoted: msg });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("❌ Error en comando antilink:", e);
    await conn.sendMessage(chatId, { text: "❌ Ocurrió un error al procesar el comando." }, { quoted: msg });
  }
};

// -------------------------------------------------------------
// 🔍 Listener: detecta mensajes con links y actúa según antilink
// -------------------------------------------------------------
handler.before = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  if (!chatId || !chatId.endsWith("@g.us")) return;

  const subbotID = conn.user.id;
  const filePath = path.resolve("./activossubbots.json");

  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath));

  if (!data.antilink || !data.antilink[subbotID] || !data.antilink[subbotID][chatId]) return;

  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!body) return;

  const regex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[A-Za-z0-9]+)/gi;
  if (regex.test(body)) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      const senderId = msg.key.participant || msg.key.remoteJid;
      const senderClean = senderId.replace(/[^0-9]/g, '');
      const participant = metadata.participants.find(p => p.id.includes(senderClean));
      const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

      if (isAdmin) return; // los admins pueden enviar links

      // 1. Eliminar mensaje
      await conn.sendMessage(chatId, { delete: msg.key });

      // 2. Expulsar al usuario
      await conn.groupParticipantsUpdate(chatId, [senderId], "remove");

      // 3. Aviso al grupo
      await conn.sendMessage(chatId, {
        text: `🚫 El usuario @${senderClean} fue eliminado por enviar enlaces.`,
        mentions: [senderId]
      });
    } catch (e) {
      console.error("Error en antilink listener:", e);
    }
  }
};

handler.command = ['antilink'];
module.exports = handler;