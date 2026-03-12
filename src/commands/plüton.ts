import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pluton")
    .setDescription("🪐 Plüton hakkında detaylı bilgi al!"),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(0x3b1f6e)
      .setTitle("🪐 Plüton — Güneş Sisteminin Gizemli Cücesi")
      .setDescription(
        "Plüton, Kuiper Kuşağı'nda yer alan bir cüce gezegendir. 2006 yılında gezegenler kategorisinden çıkarılmış olsa da, gizemini korumaya devam ediyor!"
      )
      .addFields(
        {
          name: "📏 Boyut",
          value: "Çap: ~2.377 km (Dünya'nın %18'i)",
          inline: true,
        },
        {
          name: "📍 Mesafe",
          value: "Güneş'e: ~5.9 milyar km",
          inline: true,
        },
        {
          name: "🌡️ Sıcaklık",
          value: "-228°C ile -238°C arası",
          inline: true,
        },
        {
          name: "⏱️ Bir Yılı",
          value: "248 Dünya yılına eşit",
          inline: true,
        },
        {
          name: "🌙 Uyduları",
          value: "5 adet (En büyüğü: Charon)",
          inline: true,
        },
        {
          name: "🏔️ En Yüksek Dağ",
          value: "~4.000 metre yüksekliğinde buz dağları",
          inline: true,
        },
        {
          name: "🔭 Keşfedilme",
          value: "18 Şubat 1930 — Clyde Tombaugh tarafından",
          inline: false,
        },
        {
          name: "🛸 New Horizons",
          value:
            "NASA'nın New Horizons uzay aracı 2015 yılında Plüton'u yakın mesafeden inceledi ve ikonik kalp şeklini görüntüledi! 💜",
          inline: false,
        }
      )
      .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/240px-Pluto_in_True_Color_-_High-Res.jpg")
      .setFooter({
        text: "✦ Plutonium Bot • Güneş Sisteminin En Uzak Cücesi",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
