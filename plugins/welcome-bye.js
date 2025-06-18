const frasesDespedida = [

];

async function despedirUsuario(conn, user, chatId) {
  const username = user.split('@')[0];
  let frase = frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)];
  frase = frase.replace(/\$\{nombre\}/gi, `@${username}`);
  let ppUrl;
  try {
    ppUrl = await conn.profilePictureUrl(user, 'image');
  } catch (e) {
    ppUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg'                                           
  }
  await conn.sendMessage(chatId, {
    image: { url: ppUrl },
    caption: frase,
    mentions: [user]
  });
}

                                               
conn.ev.on('//telegra.ph/file/6880771a42bad09dd6087.jpg';
  }
  await conn.sendMessage(chatId, {
    image: { url: ppUrl },
    caption: frase,
    mentions: [user]
  });
}

conn.ev.on('group-participants.update', async (update) => {
  const { id, participants, action } = update;
  if (action === 'remove' || action === 'leave') {
    for (const user of participants) {
      await despedirUsuario(conn, user, id);
    }
  }
});