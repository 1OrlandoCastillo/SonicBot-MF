import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  try {
    // Reacción de inicio
    await m.react('🕓')

    // Ejecutar git pull real
    let cmd = 'git pull' + (m.fromMe && text ? ' ' + text : '')
    let output = execSync(cmd, { encoding: 'utf-8' }).trim()

    // Verificar si ya está actualizado
    if (output.includes('Already up to date.')) {
      await conn.reply(m.chat, '✅ Tu bot ya está actualizado.', m)
      await m.react('✅')
      return
    }

    // Barra de carga simulada para actualización
    let loading = ["▰▱▱▱▱ 20%", "▰▰▱▱▱ 40%", "▰▰▰▱▱ 60%", "▰▰▰▰▱ 80%", "▰▰▰▰▰ 100%"]
    let msg
    for (let i = 0; i < loading.length; i++) {
      if (msg) await conn.sendMessage(m.chat, { delete: msg.key })
      msg = await conn.sendMessage(m.chat, { text: loading[i] }, { quoted: m })
      await new Promise(res => setTimeout(res, 500))
    }

    // Eliminar barra final
    if (msg) await conn.sendMessage(m.chat, { delete: msg.key })

    // Mensaje final de actualización
    await conn.reply(m.chat, '✅ Bot actualizado correctamente.', m)
    await m.react('✅')
    
  } catch (err) {
    // Reacción de error
    await m.react('❌')
    
    // Mensaje de error
    await conn.reply(m.chat, `⚠️ Error al actualizar:\n\n${err.message}`, m)
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']
handler.rowner = true

export default handler