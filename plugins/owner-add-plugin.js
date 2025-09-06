import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return m.reply('*[❗] Solo los dueños pueden usar este comando.*')
  }

  if (!args[0]) {
    return m.reply(`*[❗] Uso correcto:*
${usedPrefix}plugin <nombre_archivo.js>

*Ejemplo:*
1. Escribe: ${usedPrefix}plugin mi-comando.js
2. Responde a este mensaje con el código completo del plugin`)
  }

  let fileName = args[0]

  if (!fileName.endsWith('.js')) {
    fileName += '.js'
  }

  if (!/^[a-zA-Z0-9-_]+\.js$/.test(fileName)) {
    return m.reply('*[❗] Nombre de archivo inválido. Solo letras, números, guiones y guiones bajos.*')
  }

  const pluginPath = join('./plugins', fileName)

  if (fs.existsSync(pluginPath)) {
    return m.reply(`*[❗] El archivo ${fileName} ya existe.*`)
  }

  if (!m.quoted || !m.quoted.text) {
    return m.reply(`*[❗] Debes responder a un mensaje con el código del plugin.*

*Ejemplo:*
1. Escribe: ${usedPrefix}plugin mi-comando.js
2. Responde a este mensaje con el código completo`)
  }

  let pluginContent = m.quoted.text

  try {
    // Crear el archivo
    fs.writeFileSync(pluginPath, pluginContent, 'utf8')

    let txt = `╭─「 ✦ 𓆩✅𓆪 ᴘʟᴜɢɪɴ ᴄʀᴇᴀᴅᴏ ✦ 」─╮\n`
    txt += `│\n`
    txt += `╰➺ ✧ *Archivo:* ${fileName}\n`
    txt += `╰➺ ✧ *Ruta:* plugins/${fileName}\n`
    txt += `╰➺ ✧ *Estado:* Creado exitosamente ✅\n`
    txt += `│\n`
    txt += `╰➺ ✧ *Comando:* .${fileName.replace('.js', '')}\n`
    txt += `╰➺ ✧ *Recarga:* El plugin se cargará automáticamente\n`
    txt += `│\n`
    txt += `╰────────────────╯\n`
    txt += `\n> LOVELLOUD Official`

    await conn.sendMessage(m.chat, { text: txt }, { quoted: m })

  } catch (error) {
    m.reply(`*[❗] Error al crear el plugin: ${error.message}*`)
  }
}

handler.help = ['#plugin <nombre.js>\n→ Crear un nuevo plugin (responde con el código)']
handler.tags = ['owner']
handler.command = ['plugin', 'addplugin', 'crearplugin']

export default handler