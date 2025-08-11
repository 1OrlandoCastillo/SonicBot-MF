import axios from 'axios'
import fetch from 'node-fetch'

// Variables por defecto
const botname = 'MiBot'
const etiqueta = 'Orlando Castillo'
const vs = '1.0'
const msm = '[LOG]'
const emoji = '🤖'
const emoji2 = '⌛'
const error = '❌'
const rwait = '⏳'
const done = '✅'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
        const username = conn.getName(m.sender) || 'Usuario'
        const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`

        // Función segura para reaccionar (solo si existe)
        const safeReact = async (reaction) => {
            if (typeof m.react === 'function') {
                try { await m.react(reaction) } catch { }
            }
        }

        if (isQuotedImage) {
            const q = m.quoted
            const img = await q.download?.()
            if (!img) {
                console.log(`${msm} Error: No image buffer available`)
                return conn.reply(m.chat, '✘ No se pudo descargar la imagen.', m)
            }

            const content = `${emoji} ¿Qué se observa en la imagen?`
            try {
                const imageAnalysis = await fetchImageBuffer(content, img)
                const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
                const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
                const description = await luminsesi(query, username, prompt)
                await conn.reply(m.chat, description, m)
            } catch (err) {
                console.error(`${msm} Error analizando imagen:`, err.message)
                await safeReact(error)
                await conn.reply(m.chat, '✘ No se pudo analizar la imagen.', m)
            }
        } else {
            if (!text) {
                return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m)
            }
            await safeReact(rwait)
            try {
                // Enviar mensaje inicial (sin edición para compatibilidad total)
                await conn.sendMessage(m.chat, { text: `${emoji2} Procesando tu petición, espera...` }, { quoted: m })

                const query = text
                const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
                const response = await luminsesi(query, username, prompt)

                await conn.sendMessage(m.chat, { text: response }, { quoted: m })
                await safeReact(done)
            } catch (err) {
                console.error(`${msm} Error respondiendo texto:`, err.message)
                await safeReact(error)
                await conn.reply(m.chat, '✘ No puedo responder a esa pregunta.', m)
            }
        }
    } catch (err) {
        console.error(`${msm} Error general en handler:`, err.message)
        await conn.reply(m.chat, 'Ocurrió un error inesperado.', m)
    }
}

handler.help = ['ia', 'chatgpt']
handler.tags = ['ai']
handler.register = false // ✅ Sin registro obligatorio
handler.command = ['ia', 'chatgpt', 'luminai']
handler.group = true

export default handler

// Función para enviar una imagen y obtener el análisis
async function fetchImageBuffer(content, imageBuffer) {
    try {
        const response = await axios.post('https://Luminai.my.id', {
            content: content,
            imageBuffer: imageBuffer.toString('base64') // ✅ Enviamos en Base64
        }, {
            headers: { 'Content-Type': 'application/json' }
        })
        return response.data
    } catch (err) {
        console.error(`${msm} Error en fetchImageBuffer:`, err.message)
        throw err
    }
}

// Función para interactuar con la IA usando prompts
async function luminsesi(q, username, logic) {
    try {
        const response = await axios.post("https://Luminai.my.id", {
            content: q,
            user: username,
            prompt: logic,
            webSearchMode: false
        })
        return response.data.result
    } catch (err) {
        console.error(`${msm} Error en luminsesi:`, err.message)
        throw err
    }
}