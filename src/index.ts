import { Client, GatewayIntentBits, Collection, Events, ActivityType, EmbedBuilder } from "discord.js";
import { readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { initGiveawayTimers } from "./commands/cekilis.js";
import { getGiveawayStore, saveGiveaway } from "./data/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Command {
  data: { name: string; toJSON(): object };
  execute(interaction: unknown): Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

(client as unknown as { commands: Collection<string, Command> }).commands = new Collection();

const commandsPath = join(__dirname, "commands");
const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command: Command = (await import(pathToFileURL(filePath).href)).default;
  if (command?.data && command?.execute) {
    (client as unknown as { commands: Collection<string, Command> }).commands.set(command.data.name, command);
  }
}

const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = (await import(pathToFileURL(filePath).href)).default;
  if (event.once) {
    client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
  }
}

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  throw new Error("DISCORD_BOT_TOKEN ortam değişkeni eksik!");
}

client.on(Events.ClientReady, async (readyClient) => {
  console.log(`🚀 ${readyClient.user.tag} olarak giriş yapıldı! Plutonium botu aktif.`);
  readyClient.user.setPresence({
    activities: [{ name: "🪐 Plutonium Sunucusu", type: ActivityType.Watching }],
    status: "online",
  });
  await initGiveawayTimers(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // ── Slash Komutlar ──────────────────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const commands = (client as unknown as { commands: Collection<string, Command> }).commands;
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.error(`❌ "${interaction.commandName}" komutu bulunamadı.`);
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const errMsg = { content: "☄️ Bir hata oluştu! Komutu çalıştırırken sorun yaşandı.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errMsg);
      } else {
        await interaction.reply(errMsg);
      }
    }
    return;
  }

  // ── Buton Etkileşimleri ─────────────────────────────────────────────────
  if (interaction.isButton()) {
    const id = interaction.customId;

    // Çekiliş katılım butonu
    if (id === "giveaway_join") {
      const store = getGiveawayStore();
      const giveaway = Object.values(store).find(
        g => g.messageId === interaction.message.id && !g.ended
      );
      if (!giveaway)
        return interaction.reply({ content: "❌ Bu çekiliş sona erdi!", ephemeral: true });

      const idx = giveaway.participants.indexOf(interaction.user.id);
      if (idx !== -1) {
        giveaway.participants.splice(idx, 1);
        saveGiveaway(giveaway);
        return interaction.reply({ content: "❌ Çekilişten çıktın.", ephemeral: true });
      }

      giveaway.participants.push(interaction.user.id);
      saveGiveaway(giveaway);

      try {
        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        const fields = embed.data.fields ?? [];
        const f = fields.find(x => x.name === "🎟️ Katılımcı");
        if (f) f.value = `${giveaway.participants.length}`;
        await interaction.message.edit({ embeds: [embed] });
      } catch {}

      return interaction.reply({
        content: `🎉 **${giveaway.prize}** çekilişine katıldın! Bol şans!`,
        ephemeral: true,
      });
    }

    // Anket butonları (poll_0, poll_1 ...)
    if (id.startsWith("poll_")) {
      return interaction.reply({
        content: `✅ Oyun kaydedildi! (${id.replace("poll_", "")  }. seçenek)`,
        ephemeral: true,
      });
    }
  }
});

await client.login(token);
