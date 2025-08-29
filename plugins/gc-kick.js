const handler = async (m, { conn }) => {
  try {
    const usedPrefix = "."; // ✅ Prefijo fijo para bot principal

    // ✅ Verificar que el comando se use en grupos
    if (!m.key.remoteJid.includes("@g.us")) {
      return await conn.sendMessage(m.chat, {
        text: "❌ *Este comando solo funciona en grupos.*"
      }, { quoted: m });
    }

    // ✅ Obtener info del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants || [];
    const sender = m.key.participant;

    // ✅ Detectar admins
    const admins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
    const isAdmin = admins.some(admin => admin.id === sender);

    // ✅ Verificar Owner del BOT (desde config.js)
    let isOwner = false;
    try {
      const config = require("../../../config.js");
      if (config.owner) {
        isOwner = config.owner.some(o => o[0] === sender.replace("@s.whatsapp.net", ""));
      }
    } catch (err) {
      console.error("Error verificando owner:", err);
    }

    // ✅ Bloquear si no es Admin ni Owner
    if (!isAdmin && !isOwner) {
      return await conn.sendMessage(m.chat, {
        text: "🚫 *No tienes permisos para expulsar miembros.*\n⚠️ *Solo administradores o el dueño del bot pueden usar este comando.*"
      }, { quoted: m });
    }

    // ✅ Detectar usuario objetivo (mención o respuesta)
    let target = null;
    const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mention?.length > 0) {
      target = mention[0];
    } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
      target = m.message.extendedTextMessage.contextInfo.participant;
    }

    if (!target) {
      return await conn.sendMessage(m.chat, {
        text: `⚠️ *Debes mencionar o responder a un usuario para expulsarlo.*\nEjemplo: ${usedPrefix}kick @usuario`
      }, { quoted: m });
    }

    // ✅ No expulsar admins
    const isTargetAdmin = admins.some(admin => admin.id === target);
    if (isTargetAdmin) {
      return await conn.sendMessage(m.chat, {
        text: "❌ *No puedes expulsar a un administrador del grupo.*"
      }, { quoted: m });
    }

    // ✅ Expulsar al usuario
    await conn.groupParticipantsUpdate(m.chat, [target], "remove");

    return await conn.sendMessage(m.chat, {
      text: `🚷 *El usuario @${target.split("@")[0]} ha sido expulsado del grupo.*`,
      mentions: [target]
    }, { quoted: m });

  } catch (err) {
    console.error("Error en el comando kick:", err);
    await conn.sendMessage(m.chat, {
      text: "❌ *Ocurrió un error al intentar expulsar al usuario.*"
    }, { quoted: m });
  }
};

// ✅ Nombre del comando
handler.command = ["kick", "expulsar"];
module.exports = handler;