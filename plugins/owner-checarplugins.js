import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    try {
        let pluginsPath = './plugins'; // Carpeta principal de plugins
        let files = [];

        // Función para leer archivos de manera recursiva (incluye subcarpetas)
        function leerArchivos(dir) {
            let elementos = fs.readdirSync(dir);
            for (let elemento of elementos) {
                let fullPath = path.join(dir, elemento);
                if (fs.statSync(fullPath).isDirectory()) {
                    leerArchivos(fullPath); // Si es carpeta, entrar y seguir leyendo
                } else if (elemento.endsWith('.js')) {
                    files.push(fullPath); // Agregar archivo JS
                }
            }
        }

        leerArchivos(pluginsPath);

        let errores = [];
        let total = files.length;

        for (let filePath of files) {
            try {
                // Limpiar caché para recargar el archivo
                delete require.cache[require.resolve(filePath)];

                // Intentar cargar el plugin
                let plugin = require(filePath);

                // Verificar que exporta algo válido
                if (!plugin || (typeof plugin !== 'object' && typeof plugin !== 'function')) {
                    errores.push(`❌ ${filePath}: No exporta un objeto o función válido`);
                }

            } catch (err) {
                errores.push(`❌ ${filePath}: ${err.message}`);
            }
        }

        let mensaje = `🔍 *Chequeo de plugins completado*\n\n📂 Total de plugins: ${total}\n✅ Correctos: ${total - errores.length}\n❌ Con errores: ${errores.length}\n\n`;

        if (errores.length === 0) {
            mensaje += '✅ Todos los plugins se cargaron correctamente, sin errores.';
        } else {
            mensaje += '⚠️ Errores encontrados:\n\n' + errores.join('\n');
        }

        await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });

    } catch (e) {
        await conn.sendMessage(m.chat, { text: `❌ Error al ejecutar el comando: ${e.message}` }, { quoted: m });
    }
};

handler.command = /^checarplugins$/i; // Comando: .checarplugins
handler.help = ['checarplugins'];
handler.tags = ['owner']; // Solo el owner debería usar esto

export default handler;