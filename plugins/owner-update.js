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

    // Barra de carga simulada (un solo mensaje que se edita)
    let loading = [
      "▰▱▱▱▱ 20%",
      "▰▰▱▱▱ 40%",
      "▰▰▰▱▱ 60%",
      "▰▰▰▰▱ 80%",
      "▰▰▰▰▰ 100%"
    ]

    // Enviar el primer mensaje
    let msg = await conn.sendMessage(m.chat, { text: loading[0] }, { quoted: m })

    // Editar el mismo mensaje
    for (let i = 1; i < loading.length; i++) {
      await new Promise(res => setTimeout(res, 700)) // espera
      await conn.sendMessage(m.chat, {
        text: loading[i],
        edit: msg.key // <- aquí edita el mismo mensaje
      })
    }

    // Mensaje final
    await conn.sendMessage(m.chat, {
      text: "✅ Bot actualizado correctamente.",
      edit: msg.key
    })
    await m.react('✅')

  } catch (err) {
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Error al actualizar:\n\n${err.message}`, m)
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']
handler.rowner = true

export default handler