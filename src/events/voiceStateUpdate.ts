import { Events, VoiceState, EmbedBuilder, TextChannel } from "discord.js";
import { setUserJoined, setUserLeft, getUserVoiceData } from "../data/storage.js";
import { getRankForSeconds, getNextRank, formatTime } from "../data/ranks.js";
import { assignRankRole } from "../utils/roleManager.js";

export default {
  name: Events.VoiceStateUpdate,
  once: false,

  async execute(oldState: VoiceState, newState: VoiceState) {
    const userId = newState.member?.user.id ?? oldState.member?.user.id;
    const member = newState.member ?? oldState.member;
    if (!userId || !member || member.user.bot) return;

    const guildId = newState.guild.id;

    // Ses kanalına katıldı
    if (!oldState.channelId && newState.channelId) {
      setUserJoined(userId, guildId);
      console.log(`🎤 ${member.user.tag} → ${newState.channel?.name} kanalına girdi`);
      return;
    }

    // Ses kanalından ayrıldı
    if (oldState.channelId && !newState.channelId) {
      const secondsSpent = setUserLeft(userId, guildId);
      console.log(`👋 ${member.user.tag} çıktı — Bu oturumda: ${formatTime(secondsSpent)}`);

      if (secondsSpent < 10) return;

      const data = getUserVoiceData(userId, guildId);
      const rank = getRankForSeconds(data.totalSeconds);

      if (rank) {
        const promoted = await assignRankRole(member, rank);

        if (promoted) {
          const logKanal = newState.guild.channels.cache.find(
            (ch) =>
              (ch.name.includes("genel") || ch.name.includes("general") || ch.name.includes("hoş-geldin")) &&
              ch.isTextBased()
          ) as TextChannel | undefined;

          if (logKanal) {
            const nextRank = getNextRank(data.totalSeconds);
            const embed = new EmbedBuilder()
              .setColor(0xf5c518)
              .setTitle("🎖️ Yeni Rütbe Kazanıldı!")
              .setDescription(
                `${member} yeni bir rütbe kazandı!\n\n` +
                `✦ **${rank.name}**\n` +
                `*"${rank.description}"*`
              )
              .addFields(
                {
                  name: "⏱️ Toplam Ses Süresi",
                  value: formatTime(data.totalSeconds),
                  inline: true,
                },
                nextRank
                  ? {
                      name: "🎯 Sonraki Rütbe",
                      value: `${nextRank.name}\n(${formatTime(nextRank.minSeconds - data.totalSeconds)} kaldı)`,
                      inline: true,
                    }
                  : {
                      name: "🏆 Durum",
                      value: "Maksimum rütbeye ulaştın! 👑",
                      inline: true,
                    }
              )
              .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
              .setFooter({ text: "✦ Plutonium Bot • Ses Rütbe Sistemi" })
              .setTimestamp();

            await logKanal.send({ embeds: [embed] });
          }
        }
      }
      return;
    }

    // Kanal değiştirdi — aktif oturumu güncelle
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      const secondsSpent = setUserLeft(userId, guildId);
      setUserJoined(userId, guildId);
      console.log(`🔄 ${member.user.tag} kanal değiştirdi — ${formatTime(secondsSpent)} eklendi`);
    }
  },
};
