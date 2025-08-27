import fs from 'fs';
import path from 'path';

const IGNORAR_CARPETAS = new Set([
  'node_modules', '.git', '__tests__', '__mocks__',
  'backup', 'backups', 'old', 'temp', '.cache', '.history',
  '.vscode', '.idea'
]);
// Ignora archivos de prueba o backups comunes
const IGNORAR_ARCHIVOS_REGEX = /\.(test|spec)\.js$|\.bak(\.js)?$|\.disabled(\.js)?$/i;

let handler = async (m, { conn }) => {
  try {
    const inicio = Date.now();
    const pluginsPath = './plugins';
    const files = new Set();

    // Lee árbol sin seguir symlinks y sin duplicados
    function leerArchivos(dir) {
      const entradas = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entradas) {
        const full = path.join(dir, ent.name);
        if (ent.isSymbolicLink()) continue;
        if (ent.isDirectory()) {
          if (IGNORAR_CARPETAS.has(ent.name)) continue;
          leerArchivos(full);
        } else if (ent.isFile()) {
          if (!ent.name.endsWith('.js')) continue;
          if (IGNORAR_ARCHIVOS_REGEX.test(ent.name)) continue;
          files.add(path.resolve(full));
        }
      }
    }

    leerArchivos(pluginsPath);

    let analizados = files.size;
    let comandosDetectados = 0;

    const errores = [];      // ❌ críticos: no cargan o export no válido
    const advertencias = []; // ⚠️ estructura incompleta (falta tags/help)

    // Helper para mostrar rutas relative a /plugins
    const rel = p => path.relative(pluginsPath, p) || p;

    for (const filePath of files) {
      try {
        delete require.cache[require.resolve(filePath)];
        const mod = require(filePath);
        // Soporta ESM default y CJS
        const exp = mod && (mod.default ?? mod);

        // Si no exporta objeto/función, es error crítico
        if (!exp || (typeof exp !== 'object' && typeof exp !== 'function')) {
          errores.push(`❌ *${rel(filePath)}*: No exporta un objeto o función válido`);
          continue;
        }

        // Un archivo cuenta como "comando" solo si tiene handler.command
        const comando = exp.command;
        if (typeof comando === 'undefined') {
          // No lo contamos como comando; puede ser utilería y está ok.
          continue;
        }

        // A partir de aquí, es un comando
        comandosDetectados++;

        // Validaciones de estructura mínima
        if (!exp.tags) advertencias.push(`⚠️ *${rel(filePath)}*: Falta 'handler.tags'`);
        if (!exp.help) advertencias.push(`⚠️ *${rel(filePath)}*: Falta 'handler.help'`);

        // (Opcional) Valida tipo de command
        // if (!(comando instanceof RegExp) && !Array.isArray(comando)) {
        //   advertencias.push(`⚠️ *${rel(filePath)}*: 'handler.command' debería ser RegExp o Array`);
        // }

      } catch (err) {
        errores.push(`❌ *${rel(filePath)}*: ${err.message}`);
      }
    }

    const fin = Date.now();
    const tiempo = ((fin - inicio) / 1000).toFixed(2);

    const correctos = Math.max(comandosDetectados - (errores.length), 0); // errores críticos ya impiden contar como "correcto"

    let msg =
      `🔍 *Chequeo de plugins completado*\n\n` +
      `⏳ *Tiempo:* ${tiempo}s\n` +
      `📄 *Archivos JS analizados:* ${analizados}\n` +
      `🧩 *Comandos detectados:* ${comandosDetectados}\n` +
      `✅ *Comandos correctos:* ${correctos}\n` +
      `❌ *Errores críticos:* ${errores.length}\n` +
      `⚠️ *Advertencias:* ${advertencias.length}\n\n`;

    if (errores.length) {
      msg += `❌ *Errores críticos:*\n${errores.join('\n')}\n\n`;
    }
    if (advertencias.length) {
      msg += `⚠️ *Advertencias:*\n${advertencias.join('\n')}\n`;
    }
    if (!errores.length && !advertencias.length) {
      msg += `✅ *Todo ok. Tus comandos están en orden.*`;
    }

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error al ejecutar: ${e.message}` }, { quoted: m });
  }
};

handler.command = /^checarplugins$/i;
handler.help = ['checarplugins'];
handler.tags = ['owner'];

export default handler;