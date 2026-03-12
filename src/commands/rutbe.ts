import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import {
  getUserVoiceData,
  getTopVoiceUsers,
  setManualRank,
  clearManualRank,
  getManualRankStore,
} from "../data/storage.js";
import { RANKS, getRankForSeconds, getNextRank, formatTime } from "../data/ranks.js";
import { assignRankRole, removeAllRankRoles, ensureRoleExists } from "../utils/roleManager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rutbe")
    .setDescription("🎖️ Ses rütbe sistemi")
    .addSubcommand((sub) =>
      sub
        .setName("bak")
        .setDescription("🏅 Rütbeni veya birisinin rütbesini gör")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Kimin rütbesine bakılsın?").setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("siralama").setDescription("🏆 Ses süresi sıralaması")
    )
    .addSubcommand((sub) =>
      sub.setName("rutbeler").setDescription("📋 Tüm rütbeleri ve gereksinimlerini gör")
    )
    .addSubcommand((sub) =>
      sub
        .setName("ver")
        .setDescription("✅ Birine manuel rütbe ver (Yönetici)")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Kime verilecek?").setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("rutbe")
            .setDescription("Hangi rütbe?")
            .setRequired(true)
            .addChoices(...RANKS.map((r) => ({ name: r.name, value: r.name })))
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("al")
        .setDescription("❌ Birinin rütbesini al (Yönetici)")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Kimden alınsın?").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("sifirla")
        .setDescription("🔄 Birinin ses süresini sıfırla (Yönetici)")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Kimin süresi sıfırlansın?").setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild!.id;

    // ─── BAK ───────────────────────────────────────────────
    if (sub === "bak") {
      const hedefUser = interaction.options.getUser("kullanici") ?? interaction.user;
      const hedefMember = (interaction.options.getMember("kullanici") ??
        interaction.member) as GuildMember;

      const data = getUserVoiceData(hedefUser.id, guildId);
      const rank = getRankForSeconds(data.totalSeconds);
      const nextRank = getNextRank(data.totalSeconds);

      // Manuel rütbe kontrolü
      const manualStore = getManualRankStore();
      const manualRank = manualStore[guildId]?.[hedefUser.id];

      const rankAdi = manualRank
        ? `${manualRank} *(Manuel)*`
        : rank
        ? rank.name
        : "Henüz rütbe yok 🌑";

      let progress = "";
      if (nextRank && !manualRank) {
        const gereken = nextRank.minSeconds;
        const mevcut = Math.min(data.totalSeconds, gereken);
        const yuzde = Math.floor((mevcut / gereken) * 10);
        const bar = "█".repeat(yuzde) + "░".repeat(10 - yuzde);
        const kalan = gereken - data.totalSeconds;
        progress = `\`[${bar}]\` %${Math.floor((mevcut / gereken) * 100)}\n` +
          `${nextRank.emoji} **${nextRank.name}** için ${formatTime(kalan)} kaldı`;
      } else if (!nextRank && !manualRank) {
        progress = "👑 Maksimum rütbeye ulaştın!";
      }

      const embed = new EmbedBuilder()
        .setColor(rank ? rank.color : 0x555555)
        .setTitle(`🎖️ ${hedefUser.displayName ?? hedefUser.username} — Rütbe Durumu`)
        .setThumbnail(hedefUser.displayAvatarURL({ size: 128 }))
        .addFields(
          {
            name: "🏅 Mevcut Rütbe",
            value: rankAdi,
            inline: true,
          },
          {
            name: "⏱️ Toplam Ses Süresi",
            value: formatTime(data.totalSeconds),
            inline: true,
          },
          ...(progress ? [{ name: "📈 İlerleme", value: progress, inline: false }] : [])
        )
        .setFooter({ text: "✦ Plutonium Bot • Ses Rütbe Sistemi" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ─── SIRALAMA ──────────────────────────────────────────
    if (sub === "siralama") {
      await interaction.deferReply();
      const top = getTopVoiceUsers(guildId, 10);

      if (top.length === 0) {
        return interaction.editReply("📊 Henüz kimse ses kanalına girmemiş!");
      }

      const madalyalar = ["🥇", "🥈", "🥉"];
      let aciklama = "";

      for (let i = 0; i < top.length; i++) {
        const { userId, totalSeconds } = top[i];
        const rank = getRankForSeconds(totalSeconds);
        const emoji = madalyalar[i] ?? `**${i + 1}.**`;
        const rankEmoji = rank ? rank.emoji : "🌑";
        aciklama += `${emoji} <@${userId}> ${rankEmoji} — **${formatTime(totalSeconds)}**\n`;
      }

      const embed = new EmbedBuilder()
        .setColor(0xf5c518)
        .setTitle("🏆 Ses Süresi Sıralaması")
        .setDescription(aciklama)
        .setFooter({ text: "✦ Plutonium Bot • Ses Rütbe Sistemi" })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // ─── RÜTBELER ──────────────────────────────────────────
    if (sub === "rutbeler") {
      const satirlar = RANKS.map((r) => {
        const sure = formatTime(r.minSeconds);
        return `${r.emoji} **${r.name}**\n┗ ${sure} ses süresi gerekli — *${r.description}*`;
      }).join("\n\n");

      const embed = new EmbedBuilder()
        .setColor(0x1a0533)
        .setTitle("📋 Plutonium — Ses Rütbe Sistemi")
        .setDescription(
          "Ses kanallarında geçirdiğin süreye göre otomatik rütbe kazanırsın!\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          satirlar
        )
        .setFooter({ text: "✦ Plutonium Bot • Ses Rütbe Sistemi" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ─── VER (Admin) ────────────────────────────────────────
    if (sub === "ver") {
      if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: "❌ Bu komutu kullanmak için **Rolleri Yönet** yetkisi gerekli!", ephemeral: true });
      }
      const hedefMember = interaction.options.getMember("kullanici") as GuildMember;
      const seciliRutbeAdi = interaction.options.getString("rutbe")!;
      const seciliRutbe = RANKS.find((r) => r.name === seciliRutbeAdi)!;

      await interaction.deferReply();

      await removeAllRankRoles(hedefMember);
      await assignRankRole(hedefMember, seciliRutbe);
      setManualRank(guildId, hedefMember.user.id, seciliRutbeAdi);

      const embed = new EmbedBuilder()
        .setColor(seciliRutbe.color)
        .setTitle("✅ Rütbe Verildi!")
        .setDescription(
          `${hedefMember} kullanıcısına **${seciliRutbe.name}** rütbesi verildi!\n\n` +
          `*"${seciliRutbe.description}"*`
        )
        .setThumbnail(hedefMember.user.displayAvatarURL({ size: 128 }))
        .addFields({
          name: "👑 Veren",
          value: `${interaction.user}`,
          inline: true,
        })
        .setFooter({ text: "✦ Plutonium Bot • Ses Rütbe Sistemi" })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // ─── AL (Admin) ─────────────────────────────────────────
    if (sub === "al") {
      if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: "❌ Bu komutu kullanmak için **Rolleri Yönet** yetkisi gerekli!", ephemeral: true });
      }
      const hedefMember = interaction.options.getMember("kullanici") as GuildMember;

      await interaction.deferReply();
      await removeAllRankRoles(hedefMember);
      clearManualRank(guildId, hedefMember.user.id);

      const embed = new EmbedBuilder()
        .setColor(0xff4444)
        .setTitle("❌ Rütbe Alındı")
        .setDescription(`${hedefMember} kullanıcısının tüm rütbeleri kaldırıldı.`)
        .setFooter({ text: "✦ Plutonium Bot • Ses Rütbe Sistemi" })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // ─── SIFIRLA (Admin) ────────────────────────────────────
    if (sub === "sifirla") {
      if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ Bu komutu kullanmak için **Yönetici** yetkisi gerekli!", ephemeral: true });
      }
      const hedefUser = interaction.options.getUser("kullanici")!;
      const hedefMember = interaction.options.getMember("kullanici") as GuildMember;

      // Ses verisini sıfırla
      const { getVoiceStore, saveVoiceStore } = await import("../data/storage.js");
      const store = getVoiceStore();
      delete store[`${guildId}:${hedefUser.id}`];
      saveVoiceStore(store);

      await removeAllRankRoles(hedefMember);
      clearManualRank(guildId, hedefUser.id);

      const embed = new EmbedBuilder()
        .setColor(0xff4444)
        .setTitle("🔄 Ses Süresi Sıfırlandı")
        .setDescription(`${hedefMember} kullanıcısının ses süresi ve rütbesi sıfırlandı.`)
        .setFooter({ text: "✦ Plutonium Bot • Ses Rütbe Sistemi" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
