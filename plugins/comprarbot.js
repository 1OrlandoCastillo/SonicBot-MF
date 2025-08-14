const handler = async (m, { conn }) => {
  m.reply(global.ComprarBot);
};

handler.command = /^(comprarbot|comprar)$/i; // Regex que detecta ambos comandos
export default handler;

global.ComprarBot = `
〔 *TIPOS DE COMPRA* 〕

*BOT PARA GRUPO* :
> wa.me/+522731590195

*BOT PARA GRUPO PERMANENTE* :
> wa.me/+522731590195
`;