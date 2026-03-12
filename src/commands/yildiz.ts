import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

const yildizlar: Map<string, number> = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName("yildiz")
    .setDescription("⭐ Yıldız sistemi komutları")
    .addSubcommand((sub) =>
      sub
        .setName("ver")
        .setDescription("⭐ Birine yıldız ver!")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Yıldız verilecek kişi").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("bak").setDescription("⭐ Yıldızlarına bak!")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Yıldızlarına bakılacak kişi (boş bırakırsan kendin)")
        )
    )
    .addSubcommand((sub) =>
      sub.setName("siralama").setDescription("🏆 Yıldız sıralamasını gör!")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "ver") {
      const hedef = interaction.options.getMember("kullanici") as GuildMember;
      if (!hedef) {
        return interaction.reply({ content: "❌ Kullanıcı bulunamadı!", ephemeral: true });
      }
      if (hedef.id === interaction.user.id) {
        return interaction.reply({ content: "🚫 Kendine yıldız veremezsin!", ephemeral: true });
      }

      const mevcutYildiz = yildizlar.get(hedef.id) ?? 0;
      yildizlar.set(hedef.id, mevcutYildiz + 1);

      const embed = new EmbedBuilder()
        .setColor(0xf5c518)
        .setTitle("⭐ Yıldız Verildi!")
        .setDescription(
          `${interaction.user} tarafından **${hedef.displayName}** kişisine bir yıldız verildi!\n\n` +
          `✦ ${hedef.displayName} artık **${mevcutYildiz + 1}** yıldıza sahip! ⭐`
        )
        .setThumbnail(hedef.user.displayAvatarURL({ size: 128 }))
        .setFooter({ text: "✦ Plutonium Bot • Yıldız Sistemi" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "bak") {
      const hedefUser = interaction.options.getUser("kullanici") ?? interaction.user;
      const yildiz = yildizlar.get(hedefUser.id) ?? 0;

      const embed = new EmbedBuilder()
        .setColor(0xf5c518)
        .setTitle("⭐ Yıldız Durumu")
        .setDescription(
          `**${hedefUser.displayName ?? hedefUser.username}** sahip olduğu yıldızlar:\n\n` +
          `✦ **${yildiz}** ⭐ yıldız`
        )
        .setThumbnail(hedefUser.displayAvatarURL({ size: 128 }))
        .setFooter({ text: "✦ Plutonium Bot • Yıldız Sistemi" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "siralama") {
      if (yildizlar.size === 0) {
        return interaction.reply({
          content: "📊 Henüz hiç yıldız verilmemiş!",
          ephemeral: true,
        });
      }

      const sirali = [...yildizlar.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const madalyalar = ["🥇", "🥈", "🥉"];
      let aciklama = "";
      for (let i = 0; i < sirali.length; i++) {
        const [id, yildiz] = sirali[i];
        const emoji = madalyalar[i] ?? `${i + 1}.`;
        aciklama += `${emoji} <@${id}> — **${yildiz}** ⭐\n`;
      }

      const embed = new EmbedBuilder()
        .setColor(0xf5c518)
        .setTitle("🏆 Yıldız Sıralaması")
        .setDescription(aciklama)
        .setFooter({ text: "✦ Plutonium Bot • Yıldız Sistemi" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
