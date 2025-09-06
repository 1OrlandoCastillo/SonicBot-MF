var handler = async (m, { conn, participants, command }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.')
  const groupMetadata = await conn.groupMetadata(m.chat)

  const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
  const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

  let member = participants.map(u => u.id)
  let sider = []
  let total = 0

  for (let user of member) {
    let data = global.db.data.users[user] || { chat: 0, whitelist: false }
    if ((data.chat === 0) && !data.whitelist) {
      if (user !== conn.user.jid && user !== ownerGroup && user !== ownerBot) {
        total++
        sider.push(user)
      }
    }
  }

  const delay = ms => new Promise(res => setTimeout(res, ms))

  switch (command) {
    case 'fantasmas':
      if (!total)
        return conn.reply(m.chat, '✅ Este grupo es activo, no tiene fantasmas.', m)

      return conn.reply(
        m.chat,
        `👻 *Revisión de inactivos*\n\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}`,
        m,
        { mentions: sider }
      )

    case 'kickfantasmas':
      if (!total)
        return conn.reply(m.chat, '✅ Este grupo es activo, no tiene fantasmas.', m)

      await conn.reply(
        m.chat,
        `👻 *Eliminando ${total} fantasmas...*`,
        m,
        { mentions: sider }
      )

      for (let user of sider) {
        try {
          console.log(`Expulsando a: ${user}`)
          await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
          await delay(2000) // ahora solo 2 segundos
        } catch (e) {
          console.error(`Error expulsando a ${user}:`, e)
          await conn.reply(m.chat, `⚠️ No pude expulsar a @${user.split('@')[0]}`, m, {
            mentions: [user],
          })
        }
      }

      break
  }
}

handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler