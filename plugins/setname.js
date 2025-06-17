let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat,` Proporciona el nombre del *Bot* que deseas Poner.`, m, rcanal)
  }
  
  global.db.data.users[m.sender].namebot = args.join(' ')
  return conn.reply(m.chat,`*Nombre* cambiado a *${args.join(' ')}* Correctamente.`, m, rcanal)
}

handler.help = ['setbotname']
handler.tags = ['set']
handler.command = ['setbotname']

export default handler