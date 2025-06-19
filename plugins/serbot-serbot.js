if (qr && mcode) {
  let secret = await sock.requestPairingCode((m.sender.split("@")[0]));
  // Validar que secret tenga 8 dígitos antes de formatear
  if (!/^\d{8}$/.test(secret)) {
    await m.reply('Error: El código de emparejamiento no tiene 8 dígitos.');
    return;
  }
  secret = secret.match(/.{1,4}/g).join("-");
  const txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m });
  const codeBot = await m.reply(secret);
  if (txtCode?.key) setTimeout(() => {
    // Aquí debes llamar la función real de borrado de mensajes según tu framework
  }, 30000);
  if (codeBot?.key) setTimeout(() => {
    // Aquí debes llamar la función real de borrado de mensajes según tu framework
  }, 30000);
}