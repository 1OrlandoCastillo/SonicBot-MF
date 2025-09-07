// plugins/grupo-abrir-cerrar.js

let handler = async (m, { conn, command }) => {
  try {
    if (command === 'abrir') {
      await conn.groupSettingUpdate(m.chat, 'not_announcement') 
      return m.reply('✅ El grupo ha sido *abierto* (todos pueden escribir).')
    }
    if (command === 'cerrar') {
      await conn.groupSettingUpdate(m.chat, 'announcement')
      return m.reply('✅ El grupo ha sido *cerrado* (solo administradores pueden escribir).')
    }
  } catch (e) {
    console.error(e)
    return m.reply('❌ Ocurrió un error al intentar actualizar la configuración del grupo.')
  }
}

handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = ['abrir', 'cerrar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler