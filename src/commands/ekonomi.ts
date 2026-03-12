import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { getEcoUser, saveEcoUser, getTopEcoUsers } from "../data/storage.js";

const PARA = "🌟 Yıldız Tozu";
const PARA_K = "YT";
const CALISMA_COOLDOWN = 30 * 60 * 1000;
const ROB_COOLDOWN = 60 * 60 * 1000;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

const isler = [
  { meslek: "Uzay Mekaniği", min: 80, max: 200 },
  { meslek: "Plüton Madencisi", min: 100, max: 250 },
  { meslek: "Galaksi Kâşifi", min: 60, max: 180 },
  { meslek: "Yıldız Navigatörü", min: 90, max: 220 },
  { meslek: "Nebula Fotoğrafçısı", min: 70, max: 190 },
  { meslek: "Asteroit Avcısı", min: 110, max: 260 },
  { meslek: "Uzay İstasyonu Gardiyanı", min: 50, max: 160 },
  { meslek: "Kara Delik Araştırmacısı", min: 120, max: 300 },
];

function fmt(n: number) { return n.toLocaleString("tr-TR"); }

export default {
  data: new SlashCommandBuilder()
    .setName("ekonomi")
    .setDescription("💰 Yıldız Tozu ekonomi sistemi")
    .addSubcommand(s => s.setName("bakiye").setDescription("💳 Bakiyeni gör")
      .addUserOption(o => o.setName("kullanici").setDescription("Kimin bakiyesi?")))
    .addSubcommand(s => s.setName("gunluk").setDescription("🎁 Günlük ödülünü al!"))
    .addSubcommand(s => s.setName("calis").setDescription("⛏️ Çalış ve para kazan!"))
    .addSubcommand(s => s.setName("yatir").setDescription("🏦 Bankaya para yatır")
      .addIntegerOption(o => o.setName("miktar").setDescription("Miktar (0 = hepsi)").setRequired(true).setMinValue(0)))
    .addSubcommand(s => s.setName("cek").setDescription("🏦 Bankadan para çek")
      .addIntegerOption(o => o.setName("miktar").setDescription("Miktar (0 = hepsi)").setRequired(true).setMinValue(0)))
    .addSubcommand(s => s.setName("gonder").setDescription("💸 Birine para gönder")
      .addUserOption(o => o.setName("kullanici").setDescription("Kime?").setRequired(true))
      .addIntegerOption(o => o.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName("soy").setDescription("🔫 Birinin cebini soy! (Riskli!)")
      .addUserOption(o => o.setName("kullanici").setDescription("Kim?").setRequired(true)))
    .addSubcommand(s => s.setName("siralama").setDescription("🏆 En zenginler sıralaması"))
    .addSubcommand(s => s.setName("ver").setDescription("💎 Birine para ver (Admin)")
      .addUserOption(o => o.setName("kullanici").setDescription("Kim?").setRequired(true))
      .addIntegerOption(o => o.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1))),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild!.id;
    const userId = interaction.user.id;

    // ── BAKİYE ──────────────────────────────────────────────────────────────
    if (sub === "bakiye") {
      const hedef = interaction.options.getUser("kullanici") ?? interaction.user;
      const eco = getEcoUser(guildId, hedef.id);
      const embed = new EmbedBuilder()
        .setColor(0xf5c518)
        .setTitle(`💳 ${hedef.displayName ?? hedef.username} — Cüzdanı`)
        .setThumbnail(hedef.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: "👛 Cüzdan", value: `**${fmt(eco.balance)}** ${PARA_K}`, inline: true },
          { name: "🏦 Banka", value: `**${fmt(eco.bank)}** ${PARA_K}`, inline: true },
          { name: "💰 Toplam", value: `**${fmt(eco.balance + eco.bank)}** ${PARA_K}`, inline: true },
          { name: "🔥 Günlük Seri", value: `**${eco.dailyStreak}** gün`, inline: true },
        )
        .setFooter({ text: `✦ Plutonium Bot • Para birimi: ${PARA}` })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    // ── GÜNLÜK ──────────────────────────────────────────────────────────────
    if (sub === "gunluk") {
      const eco = getEcoUser(guildId, userId);
      const now = Date.now();
      const gecen = now - eco.lastDaily;
      if (gecen < DAILY_COOLDOWN) {
        const kalan = DAILY_COOLDOWN - gecen;
        const s = Math.floor(kalan / 1000);
        const dk = Math.floor(s / 60);
        const sa = Math.floor(dk / 60);
        return interaction.reply({
          content: `⏰ Günlük ödülünü aldın! **${sa} saat ${dk % 60} dakika** sonra tekrar alabilirsin.`,
          ephemeral: true,
        });
      }
      const streak = gecen < DAILY_COOLDOWN * 2 ? eco.dailyStreak + 1 : 1;
      const baz = 150 + Math.floor(Math.random() * 100);
      const bonus = Math.min(streak * 10, 300);
      const odul = baz + bonus;
      eco.balance += odul;
      eco.lastDaily = now;
      eco.dailyStreak = streak;
      saveEcoUser(guildId, userId, eco);
      const embed = new EmbedBuilder()
        .setColor(0x00ff88)
        .setTitle("🎁 Günlük Ödül Alındı!")
        .setDescription(`**+${fmt(odul)}** ${PARA_K} cüzdanına eklendi!`)
        .addFields(
          { name: "🔥 Seri Bonusu", value: `${streak} günlük seri! +${bonus} ${PARA_K}`, inline: true },
          { name: "💳 Yeni Bakiye", value: `**${fmt(eco.balance)}** ${PARA_K}`, inline: true },
        )
        .setFooter({ text: "✦ Her 24 saatte bir alabilirsin!" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    // ── ÇALIŞ ───────────────────────────────────────────────────────────────
    if (sub === "calis") {
      const eco = getEcoUser(guildId, userId);
      const gecen = Date.now() - eco.lastWork;
      if (gecen < CALISMA_COOLDOWN) {
        const kalan = Math.ceil((CALISMA_COOLDOWN - gecen) / 60000);
        return interaction.reply({ content: `⏰ Yorgunsun! **${kalan} dakika** dinlen.`, ephemeral: true });
      }
      const is = isler[Math.floor(Math.random() * isler.length)];
      const kazanc = Math.floor(Math.random() * (is.max - is.min + 1)) + is.min;
      eco.balance += kazanc;
      eco.lastWork = Date.now();
      saveEcoUser(guildId, userId, eco);
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("⛏️ İş Tamamlandı!")
        .setDescription(`**${is.meslek}** olarak çalıştın ve **+${fmt(kazanc)}** ${PARA_K} kazandın!`)
        .addFields({ name: "💳 Yeni Bakiye", value: `**${fmt(eco.balance)}** ${PARA_K}`, inline: true })
        .setFooter({ text: "✦ 30 dakika sonra tekrar çalışabilirsin." })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    // ── YATIR ───────────────────────────────────────────────────────────────
    if (sub === "yatir") {
      const eco = getEcoUser(guildId, userId);
      const raw = interaction.options.getInteger("miktar")!;
      const miktar = raw === 0 ? eco.balance : raw;
      if (miktar > eco.balance || miktar <= 0)
        return interaction.reply({ content: "❌ Yeterli bakiyen yok!", ephemeral: true });
      eco.balance -= miktar; eco.bank += miktar;
      saveEcoUser(guildId, userId, eco);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00cc77)
        .setTitle("🏦 Banka Yatırımı")
        .setDescription(`**${fmt(miktar)}** ${PARA_K} bankaya yatırıldı.`)
        .addFields(
          { name: "👛 Cüzdan", value: `${fmt(eco.balance)} ${PARA_K}`, inline: true },
          { name: "🏦 Banka", value: `${fmt(eco.bank)} ${PARA_K}`, inline: true },
        ).setFooter({ text: "✦ Plutonium Bankası" })] });
    }

    // ── ÇEK ─────────────────────────────────────────────────────────────────
    if (sub === "cek") {
      const eco = getEcoUser(guildId, userId);
      const raw = interaction.options.getInteger("miktar")!;
      const miktar = raw === 0 ? eco.bank : raw;
      if (miktar > eco.bank || miktar <= 0)
        return interaction.reply({ content: "❌ Bankanda yeterli para yok!", ephemeral: true });
      eco.bank -= miktar; eco.balance += miktar;
      saveEcoUser(guildId, userId, eco);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00cc77)
        .setTitle("🏦 Para Çekme")
        .setDescription(`**${fmt(miktar)}** ${PARA_K} bankadan çekildi.`)
        .addFields(
          { name: "👛 Cüzdan", value: `${fmt(eco.balance)} ${PARA_K}`, inline: true },
          { name: "🏦 Banka", value: `${fmt(eco.bank)} ${PARA_K}`, inline: true },
        ).setFooter({ text: "✦ Plutonium Bankası" })] });
    }

    // ── GÖNDER ──────────────────────────────────────────────────────────────
    if (sub === "gonder") {
      const hedef = interaction.options.getUser("kullanici")!;
      const miktar = interaction.options.getInteger("miktar")!;
      if (hedef.id === userId) return interaction.reply({ content: "❌ Kendine para gönderemezsin!", ephemeral: true });
      if (hedef.bot) return interaction.reply({ content: "❌ Bota para gönderemezsin!", ephemeral: true });
      const gonderen = getEcoUser(guildId, userId);
      if (gonderen.balance < miktar) return interaction.reply({ content: "❌ Yetersiz bakiye!", ephemeral: true });
      const alan = getEcoUser(guildId, hedef.id);
      gonderen.balance -= miktar; alan.balance += miktar;
      saveEcoUser(guildId, userId, gonderen);
      saveEcoUser(guildId, hedef.id, alan);
      const embed = new EmbedBuilder().setColor(0x9b59b6)
        .setTitle("💸 Para Gönderildi!")
        .setDescription(`${interaction.user} → ${hedef}\n**${fmt(miktar)}** ${PARA_K} gönderildi!`)
        .setFooter({ text: "✦ Plutonium Ekonomi" }).setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    // ── SOY ─────────────────────────────────────────────────────────────────
    if (sub === "soy") {
      const hedef = interaction.options.getUser("kullanici")!;
      if (hedef.id === userId) return interaction.reply({ content: "❌ Kendini soyamazsın!", ephemeral: true });
      if (hedef.bot) return interaction.reply({ content: "❌ Botu soyamazsın!", ephemeral: true });
      const eco = getEcoUser(guildId, userId);
      const gecen = Date.now() - eco.lastRob;
      if (gecen < ROB_COOLDOWN) {
        const kalan = Math.ceil((ROB_COOLDOWN - gecen) / 60000);
        return interaction.reply({ content: `⏰ Polislerden kaçıyorsun! **${kalan} dk** bekle.`, ephemeral: true });
      }
      const kurban = getEcoUser(guildId, hedef.id);
      if (kurban.balance < 100) return interaction.reply({ content: "❌ Bu kişinin cüzdanında para yok!", ephemeral: true });
      const basari = Math.random();
      eco.lastRob = Date.now();
      if (basari > 0.45) {
        const calinan = Math.floor(kurban.balance * (0.1 + Math.random() * 0.2));
        eco.balance += calinan; kurban.balance -= calinan;
        saveEcoUser(guildId, userId, eco); saveEcoUser(guildId, hedef.id, kurban);
        return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff6b35)
          .setTitle("🔫 Soygun Başarılı!")
          .setDescription(`${hedef}'ın cüzdanından **${fmt(calinan)}** ${PARA_K} çaldın! 😈`)
          .setFooter({ text: "✦ Plutonium Suç İstatistikleri" }).setTimestamp()] });
      } else {
        const ceza = Math.floor(eco.balance * 0.15);
        eco.balance = Math.max(0, eco.balance - ceza);
        saveEcoUser(guildId, userId, eco);
        return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff2222)
          .setTitle("🚔 Yakalandın!")
          .setDescription(`Soygun başarısız! Ceza olarak **${fmt(ceza)}** ${PARA_K} ödedi.`)
          .setFooter({ text: "✦ Plutonium Jandarması" }).setTimestamp()] });
      }
    }

    // ── SIRALAMA ────────────────────────────────────────────────────────────
    if (sub === "siralama") {
      const top = getTopEcoUsers(guildId);
      if (top.length === 0) return interaction.reply({ content: "📊 Henüz kimse para kazanmamış!", ephemeral: true });
      const madalya = ["🥇","🥈","🥉"];
      const desc = top.map((u, i) => `${madalya[i] ?? `**${i+1}.**`} <@${u.userId}> — **${fmt(u.total)}** ${PARA_K}`).join("\n");
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xf5c518)
        .setTitle("🏆 Zenginler Sıralaması").setDescription(desc)
        .setFooter({ text: `✦ Para Birimi: ${PARA}` }).setTimestamp()] });
    }

    // ── VER (Admin) ──────────────────────────────────────────────────────────
    if (sub === "ver") {
      if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: "❌ Yönetici yetkisi gerekli!", ephemeral: true });
      const hedef = interaction.options.getUser("kullanici")!;
      const miktar = interaction.options.getInteger("miktar")!;
      const eco = getEcoUser(guildId, hedef.id);
      eco.balance += miktar; saveEcoUser(guildId, hedef.id, eco);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff88)
        .setTitle("💎 Para Verildi!")
        .setDescription(`${hedef}'a **${fmt(miktar)}** ${PARA_K} verildi!`)
        .setFooter({ text: "✦ Admin Ekonomi" }).setTimestamp()] });
    }
  },
};
