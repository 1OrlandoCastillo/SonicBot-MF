let handler = async (m, { conn }) => {
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

  // Función para editar el mensaje (compatible con todas las versiones)
  const editMessage = async (messageKey, newText) => {
    try {
      await conn.sendMessage(m.chat, { text: newText, edit: messageKey });
    } catch (e) {
      // fallback: eliminar y enviar de nuevo si no se puede editar
      try { await conn.sendMessage(m.chat, { delete: messageKey }); } catch {}
      msg = await conn.sendMessage(m.chat, { text: newText }, { quoted: m });
    }
  };

  // Actualizamos la barra
  for (let i = 1; i < loading.length; i++) {
    await new Promise(res => setTimeout(res, 500));
    await editMessage(msg.key, loading[i]);
  }

  // Mensaje del bot
  await conn.sendMessage(m.chat, { text: "⚡ Hola, soy SonicBot-ProMax ⚡\nAquí está el contacto de mi creador" }, { quoted: m });

  // VCard
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