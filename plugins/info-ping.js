import speed from "performance-now";
import { spawn, exec, execSync } from "child_process";

let handler = async (m, { conn }) => {
  let timestamp = speed();
  let latensi = speed() - timestamp;
  exec(`neofetch --stdout`, (error, stdout, stderr) => {
    let child = stdout.toString("utf-8");
    let ssd = child.replace(/Memory:/, "Ram:");
    m.reply(`${ssd}乂  *Speed* : ${latensi.toFixed(4)} _ms_`);
  });
};
handler.help = ["ping"];
handler.tags = ["info"];
handler.command = ["ping", "p"];

export default handler;