import { proto } from '@whiskeysockets/baileys'

let listaActiva = false  // Controla si hay lista activa
let messageIdActual = null // Guardar id del mensaje actual para filtrar reacciones

const handler = async (m, { conn }) => {
  if (listaActiva) {
    return conn.sendMessage(
      m.chat,
      { text: '❌ *¡Ya hay una lista activa! Por favor espera que termine antes de crear otra.*' },
      { quoted: m }
    )
  }

  listaActiva = true
  let escuadra = []
  let suplentes = []

  const { text, mentions } = generarEmbed(escuadra, suplentes)
  const message = await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })

  messageIdActual = message.key.id

  // Escuchar reacciones solo una vez y para el mensaje correcto
  conn.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (
        msg.key.remoteJid === m.chat &&
        msg.key.id === messageIdActual &&
        msg.message?.reactionMessage &&
        !msg.key.fromMe
      ) {
        const userJid = msg.key.participant || msg.key.remoteJid
        const nombre = await conn.getName(userJid)
        const reaction = msg.message.reactionMessage.text

        if (reaction === '❤️') {
          if (!escuadra.find(u => u.jid === userJid)) {
            escuadra.push({ jid: userJid, nombre })
            suplentes = suplentes.filter(u => u.jid !== userJid)
          }
        } else if (reaction === '👍') {
          if (!suplentes.find(u => u.jid === userJid)) {
            suplentes.push({ jid: userJid, nombre })
            escuadra = escuadra.filter(u => u.jid !== userJid)
          }
        } else {
          continue
        }

        await actualizarLista(m, conn, escuadra, suplentes)
      }
    }
  })

  // Cerrar la lista después de 5 minutos
  setTimeout(() => {
    listaActiva = false
    messageIdActual = null
    console.log('La lista ha expirado.')
    console.log(`Escuadra: ${escuadra.map(u => u.nombre).join(', ')}`)
    console.log(`Suplentes: ${suplentes.map(u => u.nombre).join(', ')}`)
  }, 300000)
}

async function actualizarLista(m, conn, escuadra, suplentes) {
  const { text, mentions } = generarEmbed(escuadra, suplentes)
  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
}

function generarEmbed(escuadra, suplentes) {
  const mentions = [...escuadra, ...suplentes].map(u => u.jid)

  const escuadraText = escuadra.length
    ? escuadra.map(u => `┊ ⚜️ ➤ @${u.nombre}`).join('\n')
    : `┊ 👑 ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤ \n┊ ⚜️ ➤`

  const suplentesText = suplentes.length
    ? suplentes.map(u => `┊ ⚜️ ➤ @${u.nombre}`).join('\n')
    : `┊ ⚜️ ➤ \n┊ ⚜️ ➤`

  const text = `ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭─────────────╮
┊ \`𝗠𝗢𝗗𝗢:\` \`\`\`CLK\`\`\`
┊
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
• 5:00am MÉXICO 🇲🇽
• 6:00am COLOMBIA 🇨🇴
┊
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\`
${escuadraText}
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\`
${suplentesText}
╰─────────────╯

❤️ = Participar | 👍 = Suplente

• Lista Activa Por 5 Minutos`

  return { text, mentions }
}

handler.help = ['4vs4']
handler.tags = ['4vs4']
handler.group = true

export default handler