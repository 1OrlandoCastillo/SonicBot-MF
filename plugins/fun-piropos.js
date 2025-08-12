const { generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default

const emoji2 = '⌛'  // Emoji que usas en el mensaje

var handler = async (m, { conn, text }) => {
  conn.reply(m.chat, `${emoji2} Buscando un piropo, espere un momento...`, m)

  conn.reply(
    m.chat,
    `*┏━_͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡_͜͡━┓*\n\n❥ *"${pickRandom(global.piropo)}"*\n\n*┗━_͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡_͜͡━┛*`,
    m
  )
}

handler.help = ['piropo']
handler.tags = ['fun']
handler.command = ['piropo']
handler.fail = null
handler.exp = 0
handler.group = true
handler.register = true

export default handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

global.piropo = [
  "Eres como un rayo de sol en un día nublado, iluminas todo a tu paso.",
  "Tus ojos tienen el brillo de mil estrellas y la ternura de un atardecer.",
  "Si la belleza fuera arte, tú serías la obra maestra más valiosa.",
  "Contigo cada instante se convierte en un recuerdo inolvidable.",
  "Tu sonrisa es el idioma que mi corazón siempre quiere entender.",
  "Eres la razón por la que las flores quieren crecer y los pájaros cantar.",
  "Tu esencia es pura magia, capaz de encantar hasta al más escéptico.",
  "Cuando sonríes, el mundo entero se detiene solo para admirarte.",
  "Tu belleza no tiene comparación, eres única en todo el universo.",
  "Si la perfección tuviera nombre, llevaría el tuyo sin dudarlo.",
  "Cada vez que hablas, tus palabras pintan de colores mi alma.",
  "Eres la melodía perfecta en la canción de mi vida.",
  "En tus ojos se esconde un mundo lleno de sueños y esperanza.",
  "Tu presencia convierte cualquier lugar en el paraíso mismo.",
  "Eres la inspiración que mis pensamientos nunca dejan de buscar.",
  "Nada se compara a la dulzura que transmites con tu mirada.",
  "Contigo aprendí que la belleza también puede tener alma.",
  "Tu risa es el remedio que cura cualquier tristeza.",
  "Si pudiera detener el tiempo, lo haría para verte siempre feliz.",
  "Eres el poema más hermoso que la vida pudo escribir.",
  "No hay día gris cuando tú estás cerca, solo hay luz y alegría.",
  "Tu aura brilla con una luz que ni el sol podría opacar.",
  "En el jardín de la vida, tú eres la flor más preciosa.",
  "Eres la magia que convierte lo ordinario en extraordinario.",
  "Cada vez que te veo, el mundo cobra sentido de nuevo.",
  "Eres la chispa que enciende mi corazón sin pedir permiso.",
  "Tu belleza trasciende lo físico, tocando lo más profundo del alma.",
  "Eres la razón por la que creo en la belleza verdadera y eterna.",
  "Tu mirada tiene el poder de transformar cualquier día común en especial.",
  "No solo eres hermosa, eres un sueño hecho realidad."
]