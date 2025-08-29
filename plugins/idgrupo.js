let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply("⚠️ Este comando solo funciona en grupos.");

  let metadata = await conn.groupMetadata(m.chat); 
  let groupId = metadata.id; 
  let groupName = metadata.subject;

  await conn.sendMessage(m.chat, { 
    text: `👥 *Nombre del grupo:* ${groupName}\n🆔 *ID:* ${groupId}` 
  }, { quoted: m });
};

handler.help = ["idgrupo"];
handler.tags = ["info"];
handler.command = ["idgrupo", "groupid"]; // <- aquí defines el nombre del comando

export default handler;