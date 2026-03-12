import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🛸 Botun gecikmesini ölç!"),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: "🛸 Sinyal gönderiliyor...",
      fetchReply: true,
    });

    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    const apiPing = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(ping < 100 ? 0x00ff88 : ping < 300 ? 0xffaa00 : 0xff4444)
      .setTitle("📡 Plutonium Bot — Sinyal Testi")
      .addFields(
        {
          name: "⚡ Bot Gecikmesi",
          value: `\`${ping}ms\``,
          inline: true,
        },
        {
          name: "🌐 API Gecikmesi",
          value: `\`${apiPing}ms\``,
          inline: true,
        },
        {
          name: "📶 Durum",
          value:
            ping < 100
              ? "✅ Mükemmel — Işık hızında!"
              : ping < 300
              ? "⚠️ İyi — Uzaydan sinyal geliyor"
              : "❌ Yavaş — Evrenin öte köşesinden...",
          inline: false,
        }
      )
      .setFooter({ text: "✦ Plutonium Bot" })
      .setTimestamp();

    await interaction.editReply({ content: "", embeds: [embed] });
  },
};
