    const plain = content.replace(/@[\d\-]+/g, '');

    const displayName = await niceName(targetJid, conn, chatId, qPushName, fallbackPN);

    let avatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
    try { avatar = await conn.profilePictureUrl(targetJid, 'image'); } catch {}

    await conn.sendMessage(chatId, { react: { text: '🎨', key: msg.key } });

    const quoteData = {
      type: 'quote', format: 'png', backgroundColor: bgColor,
      width: 600, height: 900, scale: 3,
      messages: [{
        entities: [],
        avatar: true,
        from: { id: 1, name: displayName, photo: { url: avatar } },
        text: plain,
        replyMessage: {}
      }]
    };

    const { data } = await axios.post(
      'https://bot.lyo.su/quote/generate',
      quoteData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const stickerBuf = Buffer.from(data.result.image, 'base64');
    const sticker = await writeExifImg(stickerBuf, {
      packname: 'SonicBot 2.0 Bot',
      author: 'Orlando OFF 💻'
    });

    await conn.sendMessage(chatId, { sticker }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error('❌ Error en qc:', e);
    await conn.sendMessage(msg.key.remoteJid, { text: '❌ Error al generar el sticker.' }, { quoted: msg });
  }
};

handler.command = ['qc'];
export default handler;