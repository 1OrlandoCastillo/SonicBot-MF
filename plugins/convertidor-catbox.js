import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

// CONFIGURACIÓN DEL BOT
const namebot = "MiBot"; // Cambia esto por el nombre de tu bot
const rcanal = null;     // Si no necesitas canal específico, deja null

let handler = async (m, { conn }) => {
  // Obtener el mensaje citado o el propio
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime) {
    return conn.reply(
      m.chat,
      `Por favor, responde a un archivo válido (imagen, video, etc.).`,
      m,
      rcanal
    );
  }

  await m.react("📍");

  try {
    // Descargar el archivo
    let media = await q.download();
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);

    // Subir a Catbox
    let link = await catbox(media);

    // Construir mensaje
    let txt = `*乂 U P L O A D E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
    txt += `*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n\n`;
    txt += `> *${namebot}*`;

    // Enviar archivo
    await conn.sendFile(m.chat, media, 'archivo.jpg', txt, m, rcanal);

    await m.react("✅");
  } catch (e) {
    console.error(e);
    await m.react("😩");
  }
};

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['catbox', 'tourl'];
export default handler;

// Función para convertir bytes a formato legible
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

// Función para subir archivo a Catbox
async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};

  // Crear Blob directamente desde Buffer de Node
  const blob = new Blob([content], { type: mime });

  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}