import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

const iqSeviyeler = [
  { min: 0, max: 30, unvan: "Kara Delik", aciklama: "IQ'n o kadar düşük ki ışık bile senden kaçıyor.", emoji: "🕳️" },
  { min: 31, max: 50, unvan: "Uzay Tozu", aciklama: "Var olduğunu hissediyoruz ama nerede olduğun belli değil.", emoji: "💨" },
  { min: 51, max: 70, unvan: "Asteroit", aciklama: "Büyük olmaya çalışıyorsun ama hâlâ taş gibi duruyorsun.", emoji: "🪨" },
  { min: 71, max: 90, unvan: "Ay", aciklama: "Parlıyorsun ama aydınlığın başkasına ait.", emoji: "🌙" },
  { min: 91, max: 110, unvan: "Dünya", aciklama: "Ortalama. Tam ortada. Ne iyi ne kötü. Tebrikler?", emoji: "🌍" },
  { min: 111, max: 130, unvan: "Mars Kâşifi", aciklama: "Meraklısın ve cesursun. Ama hâlâ Mars'ta hayat yok.", emoji: "🔴" },
  { min: 131, max: 150, unvan: "Jüpiter Dahisi", aciklama: "Büyük ve etkileyicisin. Ama bazen çok fazla basınç uyguluyorsun.", emoji: "🟠" },
  { min: 151, max: 170, unvan: "Süpernova", aciklama: "Parlak ama tehlikeli. Etrafındaki her şeyi yakabilirsin.", emoji: "💥" },
  { min: 171, max: 190, unvan: "Galaksi Bilgesi", aciklama: "Anlamak mümkün değil. Yarı tanrı mısın?", emoji: "🌌" },
  { min: 191, max: 210, unvan: "Plüton Efendisi", aciklama: "Bu kadar yüksek IQ'ya sahip biri neden buraya bakarki?", emoji: "🪐" },
];

export default {
  data: new SlashCommandBuilder()
    .setName("iq")
    .setDescription("🧠 IQ testini çöz! (Tamamen bilimsel, gerçekten.)")
    .addUserOption((opt) =>
      opt
        .setName("kullanici")
        .setDescription("Kimin IQ'sunu ölçelim? (boş = kendin)")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const hedefUser = interaction.options.getUser("kullanici") ?? interaction.user;
    const hedefMember = interaction.options.getMember("kullanici") as GuildMember | null
      ?? interaction.member as GuildMember;

    await interaction.deferReply();
    await new Promise((r) => setTimeout(r, 2000));

    const iq = Math.floor(Math.random() * 210 + 1);
    const seviye = iqSeviyeler.find((s) => iq >= s.min && iq <= s.max) ?? iqSeviyeler[4];

    const barDolu = Math.floor((iq / 210) * 10);
    const bar = "█".repeat(barDolu) + "░".repeat(10 - barDolu);

    const embed = new EmbedBuilder()
      .setColor(iq > 120 ? 0x00ff88 : iq > 80 ? 0xffaa00 : 0xff4444)
      .setTitle(`🧠 IQ Ölçümü — ${hedefUser.displayName ?? hedefUser.username}`)
      .setThumbnail(hedefUser.displayAvatarURL({ size: 128 }))
      .addFields(
        {
          name: "📊 IQ Skoru",
          value: `**${iq}** puan\n\`[${bar}]\``,
        },
        {
          name: `${seviye.emoji} Unvan`,
          value: `**${seviye.unvan}**`,
          inline: true,
        },
        {
          name: "💬 Yorum",
          value: seviye.aciklama,
          inline: false,
        },
        {
          name: "🔬 Test Yöntemi",
          value: "Kullanıcı adın MD5 karması + Plüton'un yörünge açısı ÷ Mars'ın yüzey sıcaklığı × rastgele sayı.",
        }
      )
      .setFooter({
        text: "✦ Uyarı: Bu test tamamen saçmadır. Asıl IQ'n çok daha farklı... ya da değil.",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
