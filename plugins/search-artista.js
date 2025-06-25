import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const newPrefix = text.trim()
  if (!newPrefix) {
    return m.reply(`Ingresa el nuevo prefijo para el bot.\n\nEjemplo:\n${usedPrefix + command} !`)
  }
  const sessionId = conn?.auth?.creds?.me?.id?.split(':')[0]
  if (!sessionId) return m.reply('No se pudo identificar esta sesión de bot.')
  const configPath = path.join(`./sessions/sesion-${sessionId}`, 'config.json')
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)) : {}
  config.prefix = newPrefix
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  m.reply(`Prefijo del bot actualizado a: *${newPrefix}*`)
}

handler.command = /^setprefix$/i
handler.owner = true
export default handler