const handler = async (m, { conn }) => {
  m.reply(global.ComprarBot);
};

handler.command = /^(comprarbot|comprar)$/i;
export default handler;

global.ComprarBot = `
🔹 VENTA DE BOTS 🔹

Automatiza tu grupo y recibe soporte 24/7

BOT PARA GRUPO: 📲 wa.me/+522731590195
BOT PARA GRUPO PERMANENTE: 📲 wa.me/+522731590195

⚡ Rápido • Seguro • Personalizado
`;