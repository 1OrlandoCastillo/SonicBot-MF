const defaultMenu = {
  before: `
╭━━━✦✧✦━━━╮
┃   💠✨ 𝙎𝙊𝙉𝙄𝘾𝘽𝙊𝙏-𝙈𝘿 ✨💠
╰━━━✦✧✦━━━╯
╭──────── ✦ ────────╮
┃ 🕹️ *¡Bienvenido a la revolución de los bots!*
┃ 🌟 *%greeting*
┃ 🙋‍♂️ Usuario: *%name*
┃ 👑 Owner: *%owner*
┃ 🧁 Diversión y utilidad garantizada.
╰──────── ✦ ────────╯

╭━━━《  📡  ESTADO DEL BOT  📡  》━━━╮
┃ ⏳  Activo: *%muptime*
┃ 💻  Host: *%host*
┃ 👥  Usuarios: *%totalreg*
┃ 🌎  País: *%country*
┃ 📅  Día: *%week*
┃ 🗓️  Fecha: *%date*
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━✦✧✦━━━╮
┃  🚀 *¡Explora, juega y domina con SonicBot!* 🚀
╰━━━✦✧✦━━━╯
┊✨ “Haz más. Hazlo fácil. Hazlo con SonicBot.”
┊🎉 “¡Nuevas sorpresas todos los días, no te las pierdas!”
┊🦊 “Comparte SonicBot y multiplica la diversión.”
┊💡 “¿Sabías? Puedes personalizar tu experiencia con comandos únicos.”
%readmore
`.trim(),

  header: `
╭═───────『 🗂 %category 』───────═╮
`.trim(),

  body: `┃ 🔹 %cmd %isdiamond %isPremium`,

  footer: '╰══════════════════════╯\n',

  after: `
╭━━━━━━━━✦✧✦━━━━━━━━╮
┃  📢 𝙄𝙉𝙁𝙊 𝙔 𝙎𝙊𝙋𝙊𝙍𝙏𝙀 📢
╰━━━━━━━━✦✧✦━━━━━━━━╯
┊📬 ¿Tienes dudas, necesitas soporte o quieres sugerir algo?
┊👤 Usa *.owner* o *.dueño* para hablar DIRECTAMENTE con el creador.
┊⭐ ¡Gracias por confiar y ser parte de la familia SonicBot!
┊🪐 Únete a nuestra comunidad y vive la mejor experiencia de WhatsApp.
╰━━━━━━━━━━━━━━━━━━━╯
`.trim()
}