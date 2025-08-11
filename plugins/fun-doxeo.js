import { performance } from 'perf_hooks'

var handler = async (m, { conn, text }) => {
    let who;
    let userName;

    if (m.isGroup) {
        if (m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
            userName = await conn.getName(who);
        } else if (m.quoted) {
            who = m.quoted.sender;
            userName = await conn.getName(who);
        } else {
            who = m.chat;
        }
    } else {
        who = m.chat;
    }

    if (!who) return conn.reply(m.chat, `⚠️ Por favor, menciona a un usuario o responde a un mensaje.`, m);

    if (!userName) {
        userName = text || 'Usuario desconocido';
    }

    // Mensajes de carga
    let start = `🧑‍💻 *Iniciando doxeo*...`;
    let boosts = [
        pickRandom(['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20']),
        pickRandom(['21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40']),
        pickRandom(['41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60']),
        pickRandom(['61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80']),
        pickRandom(['81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'])
    ];

    await conn.sendMessage(m.chat, { text: start }, { quoted: m });
    for (let b of boosts) {
        await delay(1000);
        await conn.sendMessage(m.chat, { text: `*${b}%*` }, { quoted: m });
    }

    let old = performance.now();
    let neww = performance.now();
    let speed = `${(neww - old).toFixed(2)} ms`;

    let doxeo = `👤 *Persona doxeada* 

📅 ${new Date().toLocaleDateString()}
⏰ ${new Date().toLocaleTimeString()}

📢 Resultados:

*Nombre:* ${userName}
*Ip:* 92.28.211.234
*N:* 43 7462
*W:* 12.4893
*SS NUMBER:* 6979191519182016
*IPV6:* fe80::5dcd::ef69::fb22::d9888%12 
*UPNP:* Enabled
*DMZ:* 10.112.42.15
*MAC:* 5A:78:3E:7E:00
*ISP:* Ucom universal 
*DNS:* 8.8.8.8
*ALT DNS:* 1.1.1.1 
*DNS SUFFIX:* Dlink
*WAN:* 100.23.10.15
*WAN TYPE:* private nat
*GATEWAY:* 192.168.0.1
*SUBNET MASK:* 255.255.0.255
*UDP OPEN PORTS:* 8080, 80
*TCP OPEN PORTS:* 443
*ROUTER VENDEDOR:* ERICCSON
*DEVICE VENDEDOR:* WIN32-X
*CONNECTION TYPE:* TPLINK COMPANY
*ICMPHOPS:* 192.168.0.1, 192.168.1.1, 100.73.43.4
host-132.12.32.167.ucom.com
host-132.12.111.ucom.com
36.134.67.189, 216.239.78.11
Sof02s32inf14.1e100.net
*HTTP:* 192.168.3.1:433-->92.28.211.234:80
*Http:* 192.168.625-->92.28.211.455:80
*Http:* 192.168.817-->92.28.211.8:971
*Upd:* 192.168.452-->92.28.211:7265288
*Tcp:* 192.168.682-->92.28.211:62227.7
*Tcp:* 192.168.725-->92.28.211:67wu2
*Tcp:* 192.168.629-->92.28.211.167:8615
*EXTERNAL MAC:* 6U:77:89:ER:O4
*MODEM JUMPS:* 64`;

    await conn.sendMessage(m.chat, { text: doxeo, mentions: conn.parseMention(doxeo) }, { quoted: m });
}

handler.help = ['doxear'];
handler.tags = ['fun'];
handler.command = ['doxear', 'doxxeo', 'doxeo'];
handler.group = true;
// Quitamos registro obligatorio
handler.register = false;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));