// plugins/index/antilink.js
export default {
  command: ['antilink'],
  tags: ['group'],
  help: ['antilink'],
  async handler(m, { conn }) {
    try {
      if (!m.isGroup) return
      if (!global.db.data?.settings?.antilink) return
      if (!global.db.data.settings.antilink[m.chat]) return

      const text = m.text || m.caption || ''
      const linkRegex = /(https?:\/\/)?(www\.)?(discord\.gg|chat\.whatsapp\.com|t\.me|bit\.ly|https?:\/\/\S+)/gi
      if (!linkRegex.test(text)) return

      if (!conn.user) return // ⚠ Espera que la sesión esté lista

      // Notificación al grupo
      try {
        await conn.sendMessage(m.chat, { 
          text: `❌ @${m.sender.split('@')[0]}, no se permiten enlaces en este grupo.`, 
          mentions: [m.sender] 
        })
      } catch (e) { console.error('Error notificando anti-link:', e) }

      // Intentar eliminar el mensaje (si key existe)
      try {
        if (m.key) await conn.sendMessage(m.chat, { delete: m.key })
      } catch (e) { console.error('Error eliminando mensaje anti-link:', e) }

      // Expulsar al usuario solo si no es admin
      try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participant = m.sender
        const isAdmin = groupMetadata.participants.find(p => p.id === participant)?.admin
        if (!isAdmin) {
          await conn.groupParticipantsUpdate(m.chat, [participant], 'remove')
        }
      } catch (e) { console.error('Error expulsando usuario anti-link:', e) }

    } catch (e) {
      console.error('Error en plugin antilink:', e)
    }
  }
}
