import fetch from 'node-fetch'

// 🔧 Configura aquí tu canal
const idcanal = "120363411154070926@newsletter" // JID real del canal
const namecanal = "Sonic"            // nombre que se mostrará

export async function before(m, { conn }) {
  // ⚡ Comando de prueba para mandar un mensaje fakeReply
  if (m.text === ".test") {

    // Definimos la información de fake reply
    global.rcanal = {
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: idcanal,
          serverMessageId: 100,
          newsletterName: namecanal,
        }
      }
    }

    // Enviamos el mensaje al chat donde se escribió el comando
    await conn.sendMessage(
      m.chat,
      { text: "✅ Bot funcionando con fakeReply desde el canal", ...global.rcanal },
      { quoted: m }
    )
  }
}
