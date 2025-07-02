let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
  if (!m.isGroup) return;
  if (isAdmin || isOwner || m.fromMe || isROwner) return;

  let chat = global.db.data.chats[m.chat];
  let delet = m.key.participant;
  let bang = m.key.id;
  const user = `@${m.sender.split`@`[0]}`;
  const groupAdmins = participants.filter(p => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `*» ${i + 1}. @${v.id.split('@')[0]}*`).join('\n');
  let bot = global.db.data.settings[this.user.jid] || {};
  const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text);
  const grupo = `https://chat.whatsapp.com`;

  if (isAdmin && chat.antiLink && m.text.includes(grupo)) {
    return m.reply(`⚠️ *El sistema AntiLink está activo*, pero te salvaste por ser admin. 🎩`);
  }

  if (chat.antiLink && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
      if (m.text.includes(linkThisGroup)) return !0;
    }

    await conn.sendMessage(m.chat, {
      text: `⚡✨ *「 𝑷𝒊𝒌𝒂𝒄𝒉𝒖 AntiLink 」* ✨⚡\n\n🔗 *Detecté un enlace sospechoso en el grupo...*\n\n👤 Usuario: ${user}\n❌ *Reglas violadas*\n\n💥 Serás eliminado en unos segundos...\n`,
      mentions: [m.sender]
    }, { quoted: m, ephemeralExpiration: 24 * 60 * 100, disappearingMessagesInChat: 24 * 60 * 100 });

    if (!isBotAdmin) {
      return conn.sendMessage(m.chat, {
        text: `⚠️ *El AntiLink está activo*, pero no puedo actuar porque *no soy administrador* del grupo.\n\n👑 *Admins del grupo:*\n${listAdmin}`,
        mentions: [...groupAdmins.map(v => v.id)]
      }, { quoted: m });
    }

    if (isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      let responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0]?.status === "404") return;
    }
  }

  return !0;
}