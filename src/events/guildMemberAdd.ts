import { Events, GuildMember, EmbedBuilder, TextChannel } from "discord.js";

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    const welcomeChannels = [
      "hoş-geldin",
      "hos-geldin",
      "welcome",
      "genel",
      "general",
    ];

    let channel: TextChannel | null = null;
    for (const name of welcomeChannels) {
      const found = member.guild.channels.cache.find(
        (ch) => ch.name.includes(name) && ch.isTextBased()
      ) as TextChannel | undefined;
      if (found) {
        channel = found;
        break;
      }
    }

    if (!channel) return;

    const memberCount = member.guild.memberCount;
    const spaceEmojis = ["🌌", "🪐", "⭐", "🌠", "☄️", "🔭", "🛸", "💫", "🌙", "✨"];
    const randomEmoji = spaceEmojis[Math.floor(Math.random() * spaceEmojis.length)];

    const embed = new EmbedBuilder()
      .setColor(0x1a0533)
      .setTitle(`${randomEmoji} Plutonium'a Hoş Geldin!`)
      .setDescription(
        `## 🪐 Merhaba ${member}!\n\n` +
        `Uzayın derinliklerinden **Plutonium** sunucusuna ulaştın!\n\n` +
        `✦ Sen sunucumuzun **${memberCount}. üyesisin**\n` +
        `✦ Kanalları keşfetmeyi unutma\n` +
        `✦ Kuralları okumayı ihmal etme\n` +
        `✦ Yıldızlara dokunmaya hazır ol! 🌟`
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({
        text: "✦ Plutonium • Uzayın Derinliklerinden",
        iconURL: member.guild.iconURL() ?? undefined,
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
