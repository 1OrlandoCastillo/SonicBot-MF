import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Usa así: *${usedPrefix + command} nombre nuevo*`)

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('❌ No encontré tu sub bot activo.')
  }

  let config = {}

  // Si existe config.json, leerlo
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      return m.reply('⚠️ Error al leer el config.json.')
    }
  }

  // Editar o crear el campo "name"
  config.name = text.trim()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`☁︎ Nombre del sub bot cambiado a: *${text.trim()}*`)
  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al guardar el nombre.')
  }
}

handler.help = ['setname']
handler.tags= ['serbot']
handler.command = /^setname$/i
handler.owner = false // solo el dueño puede usar esto

export default handler