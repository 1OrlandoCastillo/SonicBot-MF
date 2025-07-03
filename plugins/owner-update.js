import { execSync } from 'child_process'

let handler = async (m, { conn }) => {
  try {
    await m.react('🕓')
    let stdout = execSync('git pull')
    await conn.reply(
      m.chat,
      `《★》𝘼𝙘𝙩𝙪𝙖𝙡𝙞𝙯𝙖𝙙𝙤 𝘾𝙤𝙣 𝙀𝙭𝙞𝙩𝙤 ✔\n${stdout.toString()}`,
      m
    )
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, '❎ Error actualizando:\n' + e.message, m)
    await m.react('❌')
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']
handler.rowner = true

export default handler