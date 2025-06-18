const frasesDespedida = [
  `╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫ ┊ @${nombre} ┊ (-1) 𝗧𝗲 𝗳𝘂𝗶𝘀𝘁𝗲 𝗺á𝘀 𝗿á𝗽𝗶𝗱𝗼 𝗾𝘂𝗲 𝘁𝘂 𝘃𝗶𝗿𝗴𝗶𝗻𝗶𝗱𝗮. 🚀 ╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
  `╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫ ┊ @${nombre} ┊ (-1) 𝗡𝗶 𝘁𝘂 𝗺𝗮𝗺á 𝘁𝗲 𝗲́𝘅𝘁𝗿𝗮ñ𝗮, ¿𝗰𝗿𝗲𝗲𝘀 𝗾𝘂𝗲 𝗻𝗼𝘀𝗼𝘁𝗿𝗼𝘀 𝘀𝗶́? 😂 ╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`
];

async function despedirUsuario(conn, user, chatId) {
  const username = user.split('@')[0];
  let frase = frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)];
  frase = frase.replace(/\$\{nombre\}/gi, `${username}`);
  let ppUrl;
  try {
    ppUrl = await conn.profilePictureUrl(user, 'image');
  } catch (e) {
    ppUrl = 'https:                                             
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