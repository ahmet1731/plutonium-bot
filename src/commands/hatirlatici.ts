import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";

function parseSure(str: string): number | null {
  const match = str.match(/^(\d+)(s|dk|sa|g)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  switch (match[2].toLowerCase()) {
    case "s":  return val * 1_000;
    case "dk": return val * 60_000;
    case "sa": return val * 3_600_000;
    case "g":  return val * 86_400_000;
    default:   return null;
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("hatirlatici")
    .setDescription("⏰ Kendine hatırlatıcı kur")
    .addStringOption(o => o.setName("sure").setDescription("Ne zaman? (Örnek: 30dk, 2sa, 1g)").setRequired(true))
    .addStringOption(o => o.setName("mesaj").setDescription("Ne hatırlatayım?").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    const sureStr = interaction.options.getString("sure")!;
    const mesaj = interaction.options.getString("mesaj")!;
    const sureMs = parseSure(sureStr);

    if (!sureMs)
      return interaction.reply({ content: "❌ Geçersiz süre! Örnek: `30dk`, `2sa`, `1g`", ephemeral: true });

    const maxMs = 7 * 24 * 60 * 60 * 1000;
    if (sureMs > maxMs)
      return interaction.reply({ content: "❌ Maksimum 7 günlük hatırlatıcı kurabilirsin!", ephemeral: true });

    const bitis = Math.floor((Date.now() + sureMs) / 1000);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xffaa00)
        .setTitle("⏰ Hatırlatıcı Kuruldu!")
        .setDescription(`**${mesaj}**\n\n<t:${bitis}:R> hatırlatacağım!`)
        .addFields({ name: "📅 Zaman", value: `<t:${bitis}:F>` })
        .setFooter({ text: "✦ Plutonium Bot • Hatırlatıcı" })
        .setTimestamp()],
    });

    setTimeout(async () => {
      try {
        const channel = interaction.channel as TextChannel;
        await channel.send({
          content: `⏰ ${interaction.user} **Hatırlatıcı!**`,
          embeds: [new EmbedBuilder()
            .setColor(0xffaa00)
            .setTitle("🔔 Hatırlatıcı!")
            .setDescription(`${interaction.user}, bunu hatırlatmamı istedin:\n\n**"${mesaj}"**`)
            .setFooter({ text: "✦ Plutonium Bot • Hatırlatıcı" })
            .setTimestamp()],
        });
      } catch {}
    }, sureMs);
  },
};
