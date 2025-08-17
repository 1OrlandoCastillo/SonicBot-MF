let handler = async (m, { conn }) => {
  // Barra de carga animada
  let loading = [
    "▰▱▱▱▱▱▱▱▱▱ 10%",
    "▰▰▱▱▱▱▱▱▱▱ 20%",
    "▰▰▰▱▱▱▱▱▱▱ 30%",
    "▰▰▰▰▱▱▱▱▱▱ 40%",
    "▰▰▰▰▰▱▱▱▱▱ 50%",
    "▰▰▰▰▰▰▱▱▱▱ 60%",
    "▰▰▰▰▰▰▰▱▱▱ 70%",
    "▰▰▰▰▰▰▰▰▱▱ 80%",
    "▰▰▰▰▰▰▰▰▰▱ 90%",
    "▰▰▰▰▰▰▰▰▰▰ 100%\n\n✅ Listo!"
  ];

  // Enviamos el mensaje inicial
  let msg = await conn.sendMessage(m.chat, { text: loading[0] }, { quoted: m });

  // Vamos "editando" el mensaje eliminando y reescribiendo
  for (let i = 1; i < loading.length; i++) {
    await new Promise(res => setTimeout(res, 500)); // esperar medio segundo
    try {
      // Eliminamos el mensaje anterior
      await conn.sendMessage(m.chat, { delete: msg.key });
    } catch (e) {
      // Si no se puede borrar, seguimos sin romper el código
    }
    // Enviamos el nuevo mensaje
    msg = await conn.sendMessage(m.chat, { text: loading[i] }, { quoted: m });
  }

  // Mensaje previo al contacto
  await conn.sendMessage(m.chat, { text: "⚡ Hola, soy SonicBot-ProMax ⚡\nAquí está el contacto de mi creador" }, { quoted: m });

  // VCard del owner
  let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;White444;;\nFN:White444\nTEL;waid=5212731590195:5212731590195\nEND:VCARD`;
  await conn.sendMessage(
    m.chat,
    { contacts: { displayName: 'White444', contacts: [{ vcard }] } },
    { quoted: m }
  );
};

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;