import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("🖼️ Bir kullanıcının avatarını gör")
    .addUserOption(o => o.setName("kullanici").setDescription("Kimin avatarı?"))
    .addStringOption(o => o.setName("format").setDescription("Format")
      .addChoices(
        { name: "PNG", value: "png" },
        { name: "JPG", value: "jpg" },
        { name: "WEBP", value: "webp" },
        { name: "GIF (hareketli ise)", value: "gif" },
      )),

  async execute(interaction: ChatInputCommandInteraction) {
    const hedef = interaction.options.getUser("kullanici") ?? interaction.user;
    const format = (interaction.options.getString("format") ?? "png") as "png"|"jpg"|"webp"|"gif";

    await hedef.fetch();
    const avatarUrl = hedef.displayAvatarURL({ size: 4096, extension: format === "gif" ? undefined : format });
    const bannerUrl = hedef.bannerURL({ size: 4096 });

    const embed = new EmbedBuilder()
      .setColor(0x1a0533)
      .setTitle(`🖼️ ${hedef.displayName ?? hedef.username} — Avatar`)
      .setImage(avatarUrl)
      .addFields(
        { name: "🔗 Bağlantı", value: `[Avatarı İndir](${avatarUrl})`, inline: true },
        { name: "🆔 Kullanıcı", value: `\`${hedef.id}\``, inline: true },
      )
      .setFooter({ text: "✦ Plutonium Bot • Avatar Görüntüleyici" })
      .setTimestamp();

    if (bannerUrl) {
      embed.addFields({ name: "🎨 Banner", value: `[Banner İndir](${bannerUrl})` });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
