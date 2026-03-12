import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";

const CHAMBERS = 6;
const BULLET_CHAMBER = Math.floor(Math.random() * CHAMBERS);

function pullTrigger(): boolean {
  return Math.floor(Math.random() * CHAMBERS) === 0;
}

export default {
  data: new SlashCommandBuilder()
    .setName("rulet")
    .setDescription("🔫 Rus Ruletini oyna! Kaybedersen 1 dakika susturulursun."),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    const isLost = pullTrigger();

    if (isLost) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("🔫 BANG! 💀")
        .setDescription(
          `**${member.displayName}** tetiği çekti ve... 💥\n\n` +
          `Kurşun sana isabet etti! **1 dakika boyunca susturuldun.** 😂`
        )
        .addFields(
          { name: "🎰 Şans", value: `1/${CHAMBERS} — Talihsiz!`, inline: true },
          { name: "⏱️ Ceza", value: "1 dakika timeout", inline: true }
        )
        .setFooter({ text: "Bir dahaki sefere daha şanslı olursun..." })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      try {
        await member.timeout(60_000, "Rus Ruleti kaybı");
      } catch {
        await interaction.followUp({
          content: "⚠️ Seni susturmak için yetkim yok! (Rol sıralamama bak)",
          ephemeral: true,
        });
      }
    } else {
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("🔫 *klik* — Boş namlu!")
        .setDescription(
          `**${member.displayName}** tetiği çekti ve... 😅\n\n` +
          `Bu sefer şanslıydın! Namlu boştu, sağ kaldın! 🎉`
        )
        .addFields(
          { name: "🎰 Şans", value: `1/${CHAMBERS} — Kurtuldun!`, inline: true },
          { name: "💚 Durum", value: "Sağ & Sağlıklı", inline: true }
        )
        .setFooter({ text: "Şansını tekrar denemek ister misin?" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
