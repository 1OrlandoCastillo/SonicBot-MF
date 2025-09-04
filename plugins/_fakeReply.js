import fetch from 'node-fetch'

// 🔧 Configura aquí el ID del canal y el nombre que quieres que aparezca
const idcanal = "120363000000000000@newsletter"  // ejemplo de JID de canal
const namecanal = "Mi Canal Oficial"            // nombre que se mostrará

export async function before(m, { conn }) {
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
}
