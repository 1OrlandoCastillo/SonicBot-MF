let handler = async (m, { conn, command }) => {
  const grupoAutorizado = "120363417503488301@g.us"; // 🔹 ID de tu grupo
  const botNumber = "5212731590195@s.whatsapp.net";   // 🔹 Tu JID de bot

  // 🔹 Verificar que el comando se use solo en el grupo autorizado
  if (m.chat !== grupoAutorizado) 
    return m.reply("⚠️ Este comando solo funciona en el grupo autorizado.");

  if (!m.isGroup) return m.reply("⚠️ Este comando solo funciona en grupos.");

  // Usuario a kickear (mencionado o respondido)
  let who = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!who) return m.reply(`⚠️ Debes mencionar a alguien para usar *${command}*`);

  // Metadata del grupo
  let groupMetadata = await conn.groupMetadata(m.chat);
  let admins = groupMetadata.participants
    .filter(p => p.admin)
    .map(p => p.id);

  // 🔹 Verificar que quien ejecuta el comando sea admin
  if (!admins.includes(m.sender)) 
    return m.reply("⚠️ Solo los administradores pueden usar este comando.");

  // 🔹 Verificar que el bot también sea admin
  if (!admins.includes(botNumber)) 
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