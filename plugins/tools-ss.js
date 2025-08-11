import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, `☁︎ Por favor, ingrese el Link de una página.`, m)

  try {
    await m.react('⏳')
    conn.reply(m.chat, `> Procesando su solicitud...`, m)

    let url = `https://image.thum.io/get/fullpage/${args[0]}`
    let res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    })

    let contentType = res.headers.get('content-type') || ''
    if (!res.ok || !contentType.startsWith('image/')) {
      throw new Error('No se recibió una imagen válida.')
    }

    let ss = await res.buffer()

    await m.react('📸')
    await conn.sendFile(m.chat, ss, 'captura.png', `✅ Captura de:\n${args[0]}`, m)
    await m.react('✅')

  } catch (err) {
    console.error('[❌ ERROR EN SS]', err)
    await m.react('❌')
    conn.reply(m.chat, `⚠️ No se pudo capturar la página.\nAsegúrate de que el link sea válido y no requiera inicio de sesión.`, m)
  }
}

handler.help = ['ss <página web>']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss']

export default handler