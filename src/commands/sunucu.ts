import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Guild,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("sunucu")
    .setDescription("🌌 Sunucu bilgilerini gör"),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    await guild.fetch();

    const toplamUye = guild.memberCount;
    const botlar = guild.members.cache.filter((m) => m.user.bot).size;
    const insanlar = toplamUye - botlar;

    const kanallar = guild.channels.cache;
    const textKanal = kanallar.filter((c) => c.type === 0).size;
    const sesKanal = kanallar.filter((c) => c.type === 2).size;

    const olusturmaTarihi = guild.createdAt;
    const roller = guild.roles.cache.size - 1;

    const embed = new EmbedBuilder()
      .setColor(0x1a0533)
      .setTitle(`🌌 ${guild.name} — Sunucu Bilgileri`)
      .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
      .setImage(guild.bannerURL({ size: 1024 }) ?? null)
      .addFields(
        {
          name: "👑 Sahibi",
          value: `<@${guild.ownerId}>`,
          inline: true,
        },
        {
          name: "🆔 ID",
          value: `\`${guild.id}\``,
          inline: true,
        },
        {
          name: "📅 Kuruluş",
          value: `<t:${Math.floor(olusturmaTarihi.getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: "👥 Üyeler",
          value: `👤 **${insanlar}** insan\n🤖 **${botlar}** bot\n📊 **${toplamUye}** toplam`,
          inline: true,
        },
        {
          name: "📢 Kanallar",
          value: `💬 **${textKanal}** yazı\n🔊 **${sesKanal}** ses`,
          inline: true,
        },
        {
          name: "🎭 Roller",
          value: `**${roller}** adet`,
          inline: true,
        },
        {
          name: "🚀 Boost",
          value: `**${guild.premiumSubscriptionCount ?? 0}** boost\nSeviye: **${guild.premiumTier}**`,
          inline: true,
        },
        {
          name: "✦ Tema",
          value: "🌌 Uzay & Plüton",
          inline: true,
        }
      )
      .setFooter({
        text: "✦ Plutonium Bot • Sunucu Bilgileri",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
