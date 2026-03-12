import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

const shipYorumlari = [
  { min: 0,  max: 10,  emoji: "💀", yorum: "Bu ikili birbirini kara delik gibi itiyor. Kaçın!" },
  { min: 11, max: 25,  emoji: "❄️", yorum: "Plüton'un yüzeyi gibi soğuk. Sıfır kimya." },
  { min: 26, max: 40,  emoji: "😬", yorum: "Arkadaş olabilirler... belki. Ayda bir konuşurlarsa." },
  { min: 41, max: 55,  emoji: "🌙", yorum: "Ay ve Dünya gibi — birbirinin etrafında dönüyorlar ama dokunmuyorlar." },
  { min: 56, max: 69,  emoji: "⭐", yorum: "Fena değil! Bir yıldız çifti gibi birlikte parlıyorlar." },
  { min: 70, max: 80,  emoji: "🔥", yorum: "Güçlü çekim var! Süpernova enerjisi!" },
  { min: 81, max: 93,  emoji: "💫", yorum: "Bu çift galaksileri birleştiriyor. Muhteşem uyum!" },
  { min: 94, max: 99,  emoji: "💜", yorum: "Neredeyse mükemmel! Evren bu aşkı onaylıyor." },
  { min: 100, max: 100, emoji: "👑", yorum: "EVRENSEL UYUM! Bu çift kara delikleri bile eritebildi!" },
];

function shipIsmiOlustur(isim1: string, isim2: string): string {
  const temizle = (s: string) => s.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
  const a = temizle(isim1);
  const b = temizle(isim2);
  const yari1 = a.slice(0, Math.ceil(a.length / 2));
  const yari2 = b.slice(Math.floor(b.length / 2));
  return yari1 + yari2;
}

function kalp(yuzde: number): string {
  const dolu = Math.round(yuzde / 10);
  return "❤️".repeat(dolu) + "🖤".repeat(10 - dolu);
}

export default {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("💘 İki kişiyi uzayın gücüyle eşleştir!")
    .addUserOption((opt) =>
      opt.setName("kisi1").setDescription("Birinci kişi").setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("kisi2").setDescription("İkinci kişi (boş bırakırsan sen)").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const kisi1 = interaction.options.getUser("kisi1")!;
    const kisi2 = interaction.options.getUser("kisi2") ?? interaction.user;

    if (kisi1.id === kisi2.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff4444)
            .setTitle("💔 Kendi Kendini Sevemezsin!")
            .setDescription("Narsisizm Plüton'da bile yasak. Başka biriyle dene. 🪐")
            .setFooter({ text: "✦ Plutonium Ship" }),
        ],
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    await new Promise((r) => setTimeout(r, 1800));

    const skor = Math.floor(Math.random() * 101);
    const seviye = shipYorumlari.find((s) => skor >= s.min && skor <= s.max)!;
    const shipIsmi = shipIsmiOlustur(
      kisi1.displayName ?? kisi1.username,
      kisi2.displayName ?? kisi2.username
    );

    const embed = new EmbedBuilder()
      .setColor(0xe91e8c)
      .setTitle("💘 Plutonium Ship Makinesi™")
      .setDescription(
        `### ${kisi1} 💞 ${kisi2}\n` +
        `**Ship İsmi:** \`${shipIsmi}\``
      )
      .addFields(
        {
          name: `${seviye.emoji} Uyumluluk Skoru`,
          value: `**%${skor}**\n${kalp(skor)}`,
          inline: false,
        },
        {
          name: "🔮 Kozmik Yorum",
          value: seviye.yorum,
          inline: false,
        },
        {
          name: "🪐 Plüton Kararı",
          value: skor >= 70
            ? "✅ **Onaylandı!** Plüton bu çifti kutsuyor."
            : skor >= 40
            ? "🤔 **Kararsız.** Plüton daha fazla veri bekliyor."
            : "❌ **Reddedildi.** Plüton bu ilişkiye inanmıyor.",
          inline: false,
        }
      )
      .setFooter({ text: "✦ Plutonium Bot • Ship Motoru v2.0" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
