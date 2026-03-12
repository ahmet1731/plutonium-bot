import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

const hizSeviyeleri = [
  { min: 0, max: 10, unvan: "Kaplumbağa Astronotu", aciklama: "Işık yılında 1 metre gidebilirsin. Yeterli.", emoji: "🐢" },
  { min: 11, max: 25, unvan: "Yürüyen Asteroit", aciklama: "Yavaş ama kararlı. En azından çarparsan iz bırakırsın.", emoji: "🪨" },
  { min: 26, max: 40, unvan: "Uzay Yürüyüşçüsü", aciklama: "Ağırlıksız ortamda yürüyüş hızında. Güzel ama verimli değil.", emoji: "👨‍🚀" },
  { min: 41, max: 60, unvan: "Roket Adayı", aciklama: "Bir gün uzaya çıkabilirsin. Belki. Teori bazında.", emoji: "🚀" },
  { min: 61, max: 75, unvan: "Süpersonik Gezgin", aciklama: "Sesin hızını geçtin! Ama uzay çok büyük, yine de geç kaldın.", emoji: "⚡" },
  { min: 76, max: 89, unvan: "Voyager Modu", aciklama: "NASA seni işe almak istiyor. Reddet, özgür ol.", emoji: "🛸" },
  { min: 90, max: 99, unvan: "Pulsar Hızı", aciklama: "Işık hızına yaklaşıyorsun. Zaman yavaşlıyor, dikkat et!", emoji: "💫" },
  { min: 100, max: 100, unvan: "IŞIK HIZI TANRI", aciklama: "FİZİK YASALARI İHLAL EDİLDİ. Einstein ağlıyor.", emoji: "🌌" },
];

export default {
  data: new SlashCommandBuilder()
    .setName("hiz")
    .setDescription("🚀 Uzaydaki hızını ölç!")
    .addUserOption((opt) =>
      opt.setName("kullanici").setDescription("Kim ölçülsün? (boş = kendin)").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const hedefUser = interaction.options.getUser("kullanici") ?? interaction.user;

    await interaction.deferReply();
    await new Promise((r) => setTimeout(r, 1500));

    const hiz = Math.floor(Math.random() * 101);
    const seviye = hizSeviyeleri.find((h) => hiz >= h.min && hiz <= h.max)!;

    const barDolu = Math.floor(hiz / 10);
    const bar = "🟣".repeat(barDolu) + "⚫".repeat(10 - barDolu);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🚀 Uzay Hız Ölçümü — ${hedefUser.displayName ?? hedefUser.username}`)
      .setThumbnail(hedefUser.displayAvatarURL({ size: 128 }))
      .addFields(
        {
          name: "⚡ Hız Skoru",
          value: `**%${hiz}** (ışık hızı bazında)\n\`[${bar}]\``,
        },
        {
          name: `${seviye.emoji} Unvan`,
          value: `**${seviye.unvan}**`,
          inline: true,
        },
        {
          name: "💬 Yorum",
          value: seviye.aciklama,
        },
        {
          name: "📐 Hesaplama Yöntemi",
          value: "Kullanıcı adı → ASCII → Fibonacci dizisi → Plüton orbital hızı × Güneş luminositesi ÷ 42",
        }
      )
      .setFooter({ text: "✦ Plutonium Bot • Uzay Hız Ölçer Pro™" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
