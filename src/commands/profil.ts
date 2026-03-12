import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("👤 Bir kullanıcının profilini gör")
    .addUserOption((opt) =>
      opt
        .setName("kullanici")
        .setDescription("Profili görülecek kişi (boş bırakırsan kendin)")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const hedef =
      (interaction.options.getMember("kullanici") as GuildMember | null) ??
      (interaction.member as GuildMember);

    const user = hedef.user;
    const katilmaTarih = hedef.joinedAt;
    const hesapTarih = user.createdAt;

    const roller = hedef.roles.cache
      .filter((r) => r.id !== interaction.guild!.id)
      .sort((a, b) => b.position - a.position)
      .first(5)
      .map((r) => `<@&${r.id}>`)
      .join(", ") || "Yok";

    const rozetler: string[] = [];
    if (hedef.permissions.has("Administrator")) rozetler.push("🛡️ Yönetici");
    if (hedef.permissions.has("ModerateMembers")) rozetler.push("🔨 Moderatör");
    if (user.bot) rozetler.push("🤖 Bot");

    const embed = new EmbedBuilder()
      .setColor(0x1a0533)
      .setTitle(`🌌 ${user.displayName ?? user.username} — Plutonium Profili`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: "🪪 Kullanıcı",
          value: `${user.tag}`,
          inline: true,
        },
        {
          name: "🆔 ID",
          value: `\`${user.id}\``,
          inline: true,
        },
        {
          name: "🌟 Takma Ad",
          value: hedef.nickname ?? "Yok",
          inline: true,
        },
        {
          name: "📅 Sunucuya Katılma",
          value: katilmaTarih
            ? `<t:${Math.floor(katilmaTarih.getTime() / 1000)}:F>`
            : "Bilinmiyor",
          inline: true,
        },
        {
          name: "🗓️ Hesap Oluşturma",
          value: `<t:${Math.floor(hesapTarih.getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: "✦ Rozetler",
          value: rozetler.length > 0 ? rozetler.join(" • ") : "Yok",
          inline: false,
        },
        {
          name: "🎭 Roller (İlk 5)",
          value: roller,
          inline: false,
        }
      )
      .setImage(user.bannerURL({ size: 512 }) ?? null)
      .setFooter({ text: "✦ Plutonium Bot • Profil", iconURL: user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
