// Todos los comentarios originales
let comentariosTotales = [
"Está tan buena que debería tener impuesto 😏",
"Nivel puta profesional alcanzado 🔥",
"Ni tu crush te salva de esto 😎",
"Está que quema, literal 🔥🔥",
"Si esto fuera ilegal, ya estaría presa 😈",
"Demasiado caliente para este chat 🥵",
"Se roba todo, incluso la dignidad 😎",
"No es humano, es dios(a) del caos 😈",
"Qué asco, tan buen@ que da rabia 🤬",
"Puro fuego en todo lo que hace 🔥",
"Qué puta máquina, en serio 😎",
"Ni la NASA entiende tanto nivel 🚀",
"Está demasiado roto(a) para este juego 🔥",
"Parece hacker de la vida 😏",
"Que se jodan los demás, él/ella manda 😎",
"No hay compasión, solo respeto 🔥",
"Todo lo hace perfecto, qué bronca 🤬",
"Ni tu abuela te salvaría de esto 😏",
"Nivel demonio desbloqueado 😈",
"Está que rompe el sistema 💣",
"Si la miras directo, te quema 🔥",
"Demasiado OP para este mundo 😎",
"No hay quien le llegue ni a los talones 👣",
"Pura brutalidad, sin filtros 🤯",
"Es un/a cabrón/a de los buenos 😏",
"El nivel de mierda que tiene es impresionante 🤬",
"Ni dios se atreve a competir ⚡",
"Todo lo que toca lo destruye 🔥",
"Directo y duro: imposible de parar 💪",
"Parece que nació rompiendo reglas 😎",
"Ni la realidad lo aguanta 🤯",
"Nivel bestia desbloqueado 🦍",
"Qué cojones, está demasiado fuerte 😈",
"Arrasando sin piedad 😏",
"Ni tu abuela ni tu perro pueden competir 🐶",
"Es un/a verdadero/a badass 😎",
"Todo lo que hace es demasiado real 🤬",
"No hay debate: nivel dios 💥",
"Ni tú ni nadie le llega 🔥",
"Es un/a destructor/a de estándares 😈",
"No respeta límites, punto 🥵",
"Todo lo hace con cero compasión 😏",
"Directo al grano, imparable 💪",
"Que se jodan los haters 😎",
"Nivel legendario, ni intentes competir ⚡",
"Es un/a cabrón/a de respeto 😏",
"Destruye todo lo que toca 🤬",
"No hay reglas que lo detengan 🔥",
"Ni dios se atrevería a enfrentarlo/a 😈",
"Todo lo que toca se vuelve OP 💥",
"Es demasiado para este mundo 😎",
"No hay rival, solo respeto 🤯",
"Puro poder sin filtros 🔥",
"Nivel demonio activado 😈",
"Ni tu crush aguanta tanto 😏",
"Arrasando con todo a su paso 💪",
"Directo y brutal, punto 🤬",
"No tiene piedad con nadie 🔥",
"Nivel hardcore desbloqueado 😎",
"Es un/a puto/a genio del caos 😏",
"Nada lo detiene, nada 🤯",
"Todo lo hace mejor que tú 🔥",
"Nivel máximo, imposible de parar 😈",
"Ni los haters lo alcanzan 😎",
"Directo, duro y sin filtros 🤬",
"Arrasando todo el puto tiempo 🔥",
"Parece que nació para romper sistemas 😏",
"Todo lo que toca lo rompe 💥",
"No hay forma de ganarle 😎",
"Nivel bestial desbloqueado 🦍",
"Demasiado OP para este chat 🔥",
"Ni dios le llega a los talones 😈",
"Puro caos concentrado 😏",
"Directo, duro y letal 💪",
"No respeta nada ni a nadie 🤬",
"Todo lo que toca es fuego 🔥",
"Nivel demonio activado 😎",
"Ni la realidad lo aguanta 😏",
"Arrasando con todo a su paso 💥",
"Es un/a cabrón/a de respeto 😈",
"Demasiado para este puto mundo 🤯",
"Directo al grano, imparable 🔥",
"Ni tu crush, ni tu perro, ni tu abuela 😎",
"Puro OP concentrado 😏",
"Arrasando sin compasión 💪",
"Nivel hardcore alcanzado 🤬",
"Todo lo que toca es leyenda 🔥",
"Ni dios se atreve a competir 😈",
"Destruye estándares sin piedad 😏",
"Directo, brutal y letal 💥",
"Todo lo hace demasiado real 🔥",
"Ni tú ni nadie le llega 😎",
"Nivel bestia activado 🤯",
"Arrasando con todo sin piedad 😈",
"Demasiado OP para este mundo 😏",
"Puro caos sin filtros 💪",
"Todo lo que toca lo rompe 🔥",
"Ni la realidad lo soporta 😎",
"Directo y letal, punto 🤬",
"Arrasando todo el puto tiempo 😏",
"Nivel demonio desbloqueado 🔥",
"Demasiado badass para este chat 😈",
"Ni dios, ni humanos, nada lo detiene 😎",
"Todo lo que toca es OP 💥",
"Nivel máximo alcanzado 🤯",
"Arrasando con todo a su paso 🔥",
"Puro caos concentrado 😏",
"Directo, duro y letal 💪",
"Nada lo frena, punto 😈",
"Demasiado para este mundo 🤬",
"Todo lo hace perfecto y cruel 🔥",
"Ni tu crush ni nadie le llega 😎",
"Nivel bestial activado 😏",
"Arrasando sin piedad 💥",
"Directo y brutal, imposible de parar 😈",
"Todo lo que toca es leyenda 🔥",
"Nivel demonio desbloqueado 😎",
"Demasiado OP concentrado 🤯",
"Puro badass sin filtros 😏",
"Arrasando todo el puto tiempo 💪",
"Ni dios se atreve a competir 😈",
"Todo lo que toca lo rompe 🔥",
"Nivel máximo, imposible de vencer 😎",
"Directo y letal, punto 🤬",
"Demasiado badass para este chat 😏",
"Arrasando con todo sin piedad 💥",
"Puro caos concentrado 😈",
"Todo lo que toca es OP 🔥",
"Nivel bestia activado 😎",
"Demasiado para este mundo 🤯",
"Arrasando sin compasión 💪"
];

// Dividimos comentarios en rangos para porcentaje
let insultos = comentariosTotales.slice(0, 40);
let based = comentariosTotales.slice(40, 80);
let elogios = comentariosTotales.slice(80);

const handler = async (m, { conn, command, text }) => {
    if (!text) throw `*Ingrese el @ o el nombre de la persona que desee calcular su porcentaje de ${command.replace('how', '')}*`;

    const porcentaje = Math.floor(Math.random() * 1201); // 0 a 1200
    const tema = command.replace('how', '').toUpperCase();

    let arrayComentarios;
    if (porcentaje <= 399) arrayComentarios = insultos;
    else if (porcentaje <= 799) arrayComentarios = based;
    else arrayComentarios = elogios;

    if (arrayComentarios.length === 0) arrayComentarios = ["¡Se acabaron las frases! 😅"];

    // Elegir comentario aleatorio y eliminarlo para no repetir
    const index = Math.floor(Math.random() * arrayComentarios.length);
    const comentario = arrayComentarios.splice(index, 1)[0];

    const mensaje = `
_*${text}* es *${porcentaje}%* ${tema}. *${comentario}*_
`.trim();

    await conn.reply(
        m.chat,
        mensaje,
        m,
        m.mentionedJid ? { contextInfo: { mentionedJid: m.mentionedJid } } : {}
    );
};

export default {
    handler,
    command: /^(prostituta|prostituto)/i,
    fail: null
};