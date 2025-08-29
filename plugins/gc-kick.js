let handler = async (m, { conn, participants, command, text }) => {
  if (!m.isGroup) return m.reply("⚠️ Este comando solo funciona en grupos.");

  let who = m.mentionedJid[0] || m.quoted?.sender;
  if (!who) return m.reply(`⚠️ Debes mencionar a alguien para usar *${command}*`);

  let groupMetadata = await conn.groupMetadata(m.chat);
  let admins = groupMetadata.participants
    .filter(p => p.admin)
    .map(p => p.id);

  // 🔹 Verificar que quien ejecuta el comando sea admin
  if (!admins.includes(m.sender)) 
    return m.reply("⚠️ Solo los administradores pueden usar este comando.");

  // 🔹 Verificar que el bot también sea admin
  if (!admins.includes(conn.user.jid)) 
    return m.reply("⚠️ Necesito ser administrador para poder eliminar.");

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], "remove");
    await m.reply(`✅ Usuario eliminado: @${who.split("@")[0]}`, { mentions: [who] });
  } catch (e) {
    await m.reply("❌ No pude eliminar al usuario. Verifica mis permisos.");
  }
};

handler.help = ["kick"];
handler.tags = ["group"];
handler.command = ["kick"];

export default handler;