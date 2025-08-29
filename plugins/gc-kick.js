let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // ✅ Verificar que el comando se use en grupos
    if (!m.isGroup) {
      return conn.reply(m.chat, "❌ *Este comando solo funciona en grupos.*", m);
    }

    // ✅ Obtener info del grupo
    let groupMetadata = await conn.groupMetadata(m.chat);
    let participants = groupMetadata.participants || [];
    let sender = m.sender;

    // ✅ Detectar admins del grupo
    let admins = participants.filter(p => p.admin !== null).map(p => p.id);
    let isAdmin = admins.includes(sender);

    // ✅ Verificar Owner del BOT (desde global.owner en config.js)
    let isOwner = global.owner && global.owner.some(o => o[0] === sender.replace("@s.whatsapp.net", ""));

    // ✅ Bloquear si no es Admin ni Owner
    if (!isAdmin && !isOwner) {
      return conn.reply(m.chat, "🚫 *No tienes permisos para expulsar miembros.*\n⚠️ *Solo administradores o el dueño del bot pueden usar este comando.*", m);
    }

    // ✅ Detectar usuario objetivo (mención o respuesta)
    let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);

    if (!target) {
      return conn.reply(m.chat, `⚠️ *Debes mencionar o responder a un usuario para expulsarlo.*\n\nEjemplo: ${usedPrefix + command} @usuario`, m);
    }

    // ✅ No expulsar admins
    if (admins.includes(target)) {
      return conn.reply(m.chat, "❌ *No puedes expulsar a un administrador del grupo.*", m);
    }

    // ✅ Expulsar al usuario
    await conn.groupParticipantsUpdate(m.chat, [target], "remove");

    return conn.reply(
      m.chat,
      `🚷 *El usuario @${target.split("@")[0]} ha sido expulsado del grupo.*`,
      m,
      { mentions: [target] }
    );

  } catch (err) {
    console.error("❌ Error en el comando kick:", err);
    conn.reply(m.chat, "⚠️ *Ocurrió un error al intentar expulsar al usuario.*", m);
  }
};

// ✅ Nombre y opciones del comando
handler.help = ["kick", "expulsar"];
handler.tags = ["group"];
handler.command = ["kick", "expulsar"];
handler.group = true;
handler.admin = false; // lo controlamos en el código
handler.botAdmin = true; // el bot debe ser admin

export default handler;