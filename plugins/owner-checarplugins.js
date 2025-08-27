import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    try {
        let inicio = Date.now(); // Tiempo inicial
        let pluginsPath = './plugins';
        let files = [];

        // Leer subcarpetas recursivamente
        function leerArchivos(dir) {
            let elementos = fs.readdirSync(dir);
            for (let elemento of elementos) {
                let fullPath = path.join(dir, elemento);
                if (fs.statSync(fullPath).isDirectory()) {
                    leerArchivos(fullPath);
                } else if (elemento.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        }

        leerArchivos(pluginsPath);

        let errores = [];
        let total = files.length;

        for (let filePath of files) {
            try {
                delete require.cache[require.resolve(filePath)];
                let plugin = require(filePath);

                // Verificar exportación válida
                if (!plugin || (typeof plugin !== 'object' && typeof plugin !== 'function')) {
                    errores.push(`❌ *${filePath}*: No exporta un objeto o función válido`);
                    continue;
                }

                // Si es objeto, verificar propiedades requeridas
                if (typeof plugin === 'object') {
                    if (!plugin.command) errores.push(`⚠️ *${filePath}*: Falta 'handler.command'`);
                    if (!plugin.tags) errores.push(`⚠️ *${filePath}*: Falta 'handler.tags'`);
                    if (!plugin.help) errores.push(`⚠️ *${filePath}*: Falta 'handler.help'`);
                }

            } catch (err) {
                errores.push(`❌ *${filePath}*: ${err.message}`);
            }
        }

        let fin = Date.now();
        let tiempo = ((fin - inicio) / 1000).toFixed(2); // Segundos con 2 decimales

        let mensaje = `🔍 *Chequeo de plugins completado*\n\n` +
                      `⏳ *Tiempo:* ${tiempo}s\n` +
                      `📂 *Total:* ${total}\n` +
                      `✅ *Correctos:* ${total - errores.length}\n` +
                      `❌ *Con errores:* ${errores.length}\n\n`;

        if (errores.length === 0) {
            mensaje += '✅ *Todos los plugins están completos y sin errores.*';
        } else {
            mensaje += '⚠️ *Problemas encontrados:*\n\n' + errores.join('\n');
        }

        await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });

    } catch (e) {
        await conn.sendMessage(m.chat, { text: `❌ Error al ejecutar el comando: ${e.message}` }, { quoted: m });
    }
};

handler.command = /^checarplugins$/i;
handler.help = ['checarplugins'];
handler.tags = ['owner'];

export default handler;