import { Events, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: { user: { id: string; tag: string } }) {
    console.log(`✅ Bot hazır: ${client.user.tag}`);

    const commands: object[] = [];
    const commandsPath = join(__dirname, "..", "commands");
    const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = (await import(pathToFileURL(filePath).href)).default;
      if (command?.data) {
        commands.push(command.data.toJSON());
      }
    }

    const token = process.env.DISCORD_BOT_TOKEN!;
    const rest = new REST({ version: "10" }).setToken(token);

    try {
      console.log(`🔄 ${commands.length} slash komutu yükleniyor...`);
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log(`✅ Slash komutlar başarıyla yüklendi!`);
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot+applications.commands&permissions=8`;
      console.log(`🔗 Bot davet linki: ${inviteUrl}`);
    } catch (err) {
      console.error("❌ Slash komutlar yüklenemedi:", err);
    }
  },
};
