import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

const evlilikYorumlari = [
  { min: 0, max: 20, yorum: "Kara delik kadar çekimli değil bu ilişki. Kaçın birbirinizden.", emoji: "🕳️" },
  { min: 21, max: 40, yorum: "Plüton ve Charon gibi: Birbirinizi çekiyorsunuz ama hiç bitiremiyorsunuz.", emoji: "🪐" },
  { min: 41, max: 60, yorum: "Ortalama bir yıldız gibi: Ne çok parlak ne çok sönük. İdare eder.", emoji: "⭐" },
  { min: 61, max: 80, yorum: "Jüpiter ve Satürn gibi: Dev bir güç, birbirinizi dengeliyorsunuz.", emoji: "🟠" },
  { min: 81, max: 95, yorum: "Güneş ve Dünya gibi: Biri olmadan diğeri yaşayamaz!", emoji: "☀️" },
  { min: 96, max: 100, yorum: "MÜKEMMEL UYUM! Bu aşk kara delikleri bile büker!", emoji: "💫" },
];

const evlilikTavsiyeleri = [
  "Anlaşmazlıklarda 'Plüton resmi olarak gezegen değil' demek sorunu çözer.",
  "Her gece yıldızlara bakın ama hepsini saymaya kalkmayın, tartışma çıkar.",
  "Evlilikte en önemli şey: Aynı pizza çeşidini seçebilmek.",
  "Birbirinizi Satürn'ün halkaları gibi çevreleyin. Ve kimseye bırakmayın.",
  "Uzun yolculuklarda Voyager 1 gibi: Sinyal kesik olsa da yolculuğa devam.",
  "Kötü günlerde hatırlayın: Evren 13.8 milyar yıldır devam ediyor, siz de yaparsınız.",
];

export default {
  data: new SlashCommandBuilder()
    .setName("evlen")
    .setDescription("💒 İki kişiyi uzay falıyla eşleştir!")
    .addUserOption((opt) =>
      opt.setName("kisi1").setDescription("Birinci kişi").setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("kisi2").setDescription("İkinci kişi (boş = sen)").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const kisi1 = interaction.options.getUser("kisi1")!;
    const kisi2 = interaction.options.getUser("kisi2") ?? interaction.user;

    if (kisi1.id === kisi2.id) {
      const embed = new EmbedBuilder()
        .setColor(0xff4444)
        .setTitle("💔 Hata!")
        .setDescription("Kendini kendinle evlendiremezsin! Bu Plüton'da bile yasak. 🪐")
        .setFooter({ text: "✦ Plutonium Bot • Evlilik Ofisi" });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply();
    await new Promise((r) => setTimeout(r, 2000));

    const uyumluluk = Math.floor(Math.random() * 101);
    const seviye = evlilikYorumlari.find((e) => uyumluluk >= e.min && uyumluluk <= e.max)!;
    const tavsiye = evlilikTavsiyeleri[Math.floor(Math.random() * evlilikTavsiyeleri.length)];

    const barDolu = Math.floor(uyumluluk / 10);
    const bar = "❤️".repeat(barDolu) + "🖤".repeat(10 - barDolu);

    const embed = new EmbedBuilder()
      .setColor(0xe91e8c)
      .setTitle("💒 Uzay Evlilik Ofisi™")
      .setDescription(`${kisi1} 💕 ${kisi2}`)
      .addFields(
        {
          name: "🌌 Evrensel Uyumluluk",
          value: `**%${uyumluluk}**\n${bar}`,
        },
        {
          name: `${seviye.emoji} Yorum`,
          value: seviye.yorum,
        },
        {
          name: "💡 Evlilik Tavsiyesi",
          value: tavsiye,
        },
        {
          name: "📜 Plüton Nikâh Cüzdanı",
          value: uyumluluk > 70
            ? "✅ Onaylandı! Plüton nikâhı geçerlidir (hukuki değeri yoktur)."
            : "❌ Reddedildi. Plüton bu birlikteliği desteklemiyor.",
        }
      )
      .setFooter({ text: "✦ Plutonium Bot • Evlilik ve Uzay Rehberi" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
