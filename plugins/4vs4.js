// 4v4-horarios.js — Compatible con Baileys
// Incluye conversión horaria por país

import moment from "moment-timezone";

const MAX_ESC = 4;
const MAX_SUP = 2;

global.ff4v4 = global.ff4v4 || {};

// Zonas horarias a mostrar
const zones = [
  { name: "MÉXICO 🇲🇽", tz: "America/Mexico_City" },
  { name: "COLOMBIA 🇨🇴", tz: "America/Bogota" },
  { name: "ARGENTINA 🇦🇷", tz: "America/Argentina/Buenos_Aires" }
];

function fmtHour(str) {
  if (typeof str !== "string") return null;
  const m = str.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

function renderCard(state) {
  const e = Array.from(state.esc);
  const s = Array.from(state.sup);

  const escLines = Array.from({ length: MAX_ESC }, (_, i) =>
    `${i === 0 ? "👑" : "⚜️"} ➤ ${e[i] ? `@${e[i].split("@")[0]}` : ""}`
  );
  const supLines = Array.from({ length: MAX_SUP }, (_, i) =>
    `⚜️ ➤ ${s[i] ? `@${s[i].split("@")[0]}` : ""}`
  );

  // Convertir hora base a todas las zonas
  const baseTime = moment.tz(state.hour, "HH:mm", zones[0].tz);
  const hours = zones.map(z => `┊ • ${baseTime.clone().tz(z.tz).format("HH:mm")} ${z.name}`);

  return [
    "ㅤ ㅤ4 `𝗩𝗘𝗥𝗦𝗨𝗦` 4",
    "╭─────────────╮",
    "┊ `𝗠𝗢𝗗𝗢:` ```CLK```",
    "┊",
    "┊ ⏱️ `𝗛𝗢𝗥𝗔𝗥𝗜𝗢`",
    ...hours,
    "┊",
    "┊ » `𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔`",
    ...escLines.map(l => "┊ " + l),
    "┊",
    "┊ » `𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:`",
    ...supLines.map(l => "┊ " + l),
    "╰─────────────╯",
    "",
    "❤️ = Participar | 👍 = Suplente | ❌ = Salir",
    "",
    "• Lista Activa Por 5 Minutos"
  ].join("\n");
}

async function postOrUpdate(conn, chat, state) {
  const mentions = [...state.esc, ...state.sup, state.creator].filter(Boolean);
  const text = renderCard(state);

  const sent = await conn.sendMessage(chat, { text, mentions });

  if (state.msgId && state.msgId !== sent.key.id) {
    try {
      await conn.sendMessage(chat, { delete: { remoteJid: chat, fromMe: true, id: state.msgId } });
    } catch {}
  }
  state.msgId = sent.key.id;
}

let handler = async (m, { conn, args }) => {
  const chat = m.chat;
  const who = m.sender;

  let hour = args && args[0] ? fmtHour(args[0]) : null;
  if (!hour) hour = "05:00";

  global.ff4v4[chat] = {
    msgId: null,
    creator: who,
    hour,
    esc: new Set(),
    sup: new Set()
  };

  await postOrUpdate(conn, chat, global.ff4v4[chat]);

  setTimeout(() => delete global.ff4v4[chat], 5 * 60 * 1000);
};

handler.help = ["4v4 [HH:MM]"];
handler.tags = ["games"];
handler.command = /^4v4$/i;
handler.group = true;

// Reacciones
handler.all = async function (m, { conn }) {
  const rx = m?.message?.reactionMessage;
  if (!rx) return;
  const chat = m.chat;
  const state = global.ff4v4[chat];
  if (!state) return;

  if (state.msgId !== rx.key?.id) return;
  const user = rx.key?.participant || m.sender;
  const emoji = rx.text;

  if (emoji === "❤️") {
    state.sup.delete(user);
    if (state.esc.size < MAX_ESC) state.esc.add(user);
  } else if (emoji === "👍") {
    if (!state.esc.has(user) && state.sup.size < MAX_SUP) state.sup.add(user);
  } else if (emoji === "❌") {
    state.esc.delete(user);
    state.sup.delete(user);
  } else return;

  await postOrUpdate(conn, chat, state);
};

export default handler;