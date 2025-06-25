import moment from 'moment-timezone';

const handler = async (m, { conn }) => {
  const zonasHorarias = [
    { nombre: '🇵🇪 Perú', zona: 'America/Lima' },
    { nombre: '🇲🇽 México', zona: 'America/Mexico_City' },
    { nombre: '🇧🇴 Bolivia', zona: 'America/La_Paz' },
    { nombre: '🇨🇱 Chile', zona: 'America/Santiago' },
    { nombre: '🇦🇷 Argentina', zona: 'America/Argentina/Buenos_Aires' },
    { nombre: '🇨🇴 Colombia', zona: 'America/Bogota' },
    { nombre: '🇪🇨 Ecuador', zona: 'America/Guayaquil' },
    { nombre: '🇨🇷 Costa Rica', zona: 'America/Costa_Rica' },
    { nombre: '🇨🇺 Cuba', zona: 'America/Havana' },
    { nombre: '🇬🇹 Guatemala', zona: 'America/Guatemala' },
    { nombre: '🇭🇳 Honduras', zona: 'America/Tegucigalpa' },
    { nombre: '🇳🇮 Nicaragua', zona: 'America/Managua' },
    { nombre: '🇵🇦 Panamá', zona: 'America/Panama' },
    { nombre: '🇺🇾 Uruguay', zona: 'America/Montevideo' },
    { nombre: '🇻🇪 Venezuela', zona: 'America/Caracas' },
    { nombre: '🇵🇾 Paraguay', zona: 'America/Asuncion' },
    { nombre: '🇺🇸 New York', zona: 'America/New_York' },
    { nombre: '🇮🇩 Asia', zona: 'Asia/Jakarta' },
    { nombre: '🇧🇷 Brasil', zona: 'America/Sao_Paulo' },
    { nombre: '🇬🇶 Guinea Ecuatorial', zona: 'Africa/Malabo' },
  ];

  let texto = '「 ZONA-HORARIA ⏰ 」\n\n';
  zonasHorarias.forEach((zona) => {
    const fecha = moment().tz(zona.zona).format('DD/MM HH:mm');
    texto += `⏱️ ${zona.nombre} : ${fecha}\n`;
  });

  texto += `\n${String.fromCharCode(8206).repeat(850)}Zona horaria del servidor actual:\n[ ${Intl.DateTimeFormat().resolvedOptions().timeZone} ] ${moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('DD/MM/YY HH:mm:ss')}`;

  await conn.sendMessage(m.chat, { text: texto }, { quoted: m });
};

handler.help = ['horario'];
handler.tags = ['info'];
handler.command = ['horario'];
export default handler;