async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update;
  try {
    if (qr && !mcode) {
      txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx }, { quoted: m });
      if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000);
    }
    if (qr && mcode) {
      let secret = await sock.requestPairingCode((m.sender.split("@")[0]));
      secret = secret.match(/.{1,4}/g)?.join("-");
      txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m });
      codeBot = await m.reply(secret);
      if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000);
      if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000);
    }

    const reason = lastDisconnect?.error?.output?.statusCode || 0;
    if (connection === 'close') {
      switch (reason) {
        case DisconnectReason.loggedOut:
        case 401: case 405: case 440:
          console.log(chalk.red(`🟥 Sesión cerrada (${path.basename(pathYukiJadiBot)}), eliminando datos...`));
          fs.rmSync(pathYukiJadiBot, { recursive: true, force: true });
          break;
        case 408: case 428: case 500: case 515:
          console.log(chalk.yellow(`🔄 Reintentando conexión (${path.basename(pathYukiJadiBot)})...`));
          await creloadHandler(true);
          break;
        default:
          await creloadHandler(true);
      }
    }

    if (connection === 'open') {
      const name = sock.authState.creds.me?.name || 'Anónimo';
      const jid = sock.authState.creds.me?.jid || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`;
      console.log(chalk.green(`🟢 ${name} conectado como SubBot: +${path.basename(pathYukiJadiBot)}`));
      if (!global.conns.includes(sock)) global.conns.push(sock);
      await joinChannels(sock);
    }
  } catch (e) {
    console.error("Error en connectionUpdate:", e);
  }
}