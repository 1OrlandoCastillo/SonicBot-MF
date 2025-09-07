import fs from "fs"
import path from "path"

let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  const chatId = m.chat

  if (!m.isGroup) {
    return m.reply("❌ Este comando solo puede usarse en grupos.")
  }

  if (!isAdmin && !isOwner) {
    return m.reply("❌ Solo los administradores del grupo o el owner del bot pueden usar este comando.")
  }

  if (!args[0] || !['on', 'off'].includes(args[0])) {
    return m.reply("⚙️ Usa el comando así:\n\n📌 *.antilink on*  (activar)\n📌 *.antilink off* (desactivar)")
  }

  const subbotID = conn.user.jid
  const filePath = path.resolve("./activossubbots.json")

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ antilink: {} }, null, 2))
  }

  const data = JSON.parse(fs.readFileSync(filePath))

  if (!data.antilink) data.antilink = {}
  if (!data.antilink[subbotID]) data.antilink[subbotID] = {}

  if (args[0] === 'on') {
    data.antilink[subbotID][chatId] = true
    m.reply("✅ Antilink *activado* en este grupo.")
  } else {
    delete data.antilink[subbotID][chatId]
    m.reply("✅ Antilink *desactivado* en este grupo.")
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

handler.command = ['antilink']
handler.group = true
export default handler