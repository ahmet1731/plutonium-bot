import { Events, GuildMember, EmbedBuilder, TextChannel, PartialGuildMember } from "discord.js";

export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember | PartialGuildMember) {
    const leaveChannels = [
      "hoş-geldin",
      "hos-geldin",
      "welcome",
      "genel",
      "general",
    ];

    let channel: TextChannel | null = null;
    for (const name of leaveChannels) {
      const found = member.guild.channels.cache.find(
        (ch) => ch.name.includes(name) && ch.isTextBased()
      ) as TextChannel | undefined;
      if (found) {
        channel = found;
        break;
      }
    }

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x2c0057)
      .setTitle("☄️ Bir Yıldız Söndü...")
      .setDescription(
        `**${member.user?.username ?? "Bir üye"}** aramızdan ayrıldı.\n\n` +
        `Umarız bir gün tekrar Plutonium'a dönersin 🌌`
      )
      .setThumbnail(member.user?.displayAvatarURL({ size: 256 }) ?? null)
      .setFooter({ text: "✦ Plutonium • Uzayın Derinliklerinden" })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
