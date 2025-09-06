// plugins/index/antilink.js
export default {
  command: ['antilink'],
  tags: ['group'],
  help: ['antilink'],
  async handler(m, { conn, usedPrefix, command }) {
    try {
      // Solo funciona en grupos
      if (!m.isGroup) return

      const groupId = m.chat
      const antiLinkGroups = global.db.data.settings?.antilink || {}

      // Si el grupo no tiene activado antienlace, no hace nada
      if (!antiLinkGroups[groupId]) return

      const text = m.text || m.caption || ''
      const linkRegex = /(https?:\/\/)?(www\.)?(discord\.gg|chat\.whatsapp\.com|t\.me|bit\.ly|https?:\/\/\S+)/gi

      if (linkRegex.test(text)) {
        // Elimina el mensaje
        try {
          await conn.sendMessage(groupId, { text: `❌ @${m.sender.split('@')[0]} no se permiten enlaces en este grupo.` }, { mentions: [m.sender] })
          await conn.sendMessage(groupId, { delete: m.key })
        } catch (e) { console.error(e) }

        // Opcional: Expulsar al usuario
        try {
          // Verifica que el bot tenga permisos
          const participant = m.sender
          const groupMetadata = await conn.groupMetadata(groupId)
          const isAdmin = groupMetadata.participants.find(p => p.id === participant)?.admin

          if (!isAdmin) {
            await conn.groupParticipantsUpdate(groupId, [participant], 'remove')
          }
        } catch (e) { console.error(e) }
      }
    } catch (e) {
      console.error(e)
    }
  }
}
