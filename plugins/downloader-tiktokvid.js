import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) return conn.reply(
    m.chat,
    '🚩 Ingresa una palabra clave para buscar un video de TikTok.\n\n`Ejemplo:`\n' +
    `> *${usedPrefix + command}* Anya`,
    m, rcanal)

  await m.react('🕓')
  try {
    let url = `https://api-pbt.onrender.com/api/download/tiktokQuery?query=${encodeURIComponent(args.join(' '))}&apikey=a7q587awu57`
    let res = await fetch(url)
    if (!res.ok) throw await res.text()
    
    let json = await res.json()
    let result = json.data

    if (!result || !result.sin_marca_de_agua) throw '❌ No se encontró ningún resultado válido.'

    await conn.sendFile(m.chat, result.sin_marca_de_agua, 'tiktok.mp4', null, m, null, rcanal)
    await m.react('✅')

  } catch {
    await m.react('✖️')
  }
}

handler.help = ['tiktokvid *<nombre>*']
handler.tags = ['downloader']
handler.command = /^(ttvid|tiktokvid)$/i
handler.register = true
// handler.limit = 1

export default handler
