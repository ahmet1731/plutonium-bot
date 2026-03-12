import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

const uzayBilgileri = [
  {
    baslik: "🪐 Plüton Hakkında",
    bilgi: "Plüton, Güneş Sisteminin en uzak cüce gezegenidir. Güneş'e ortalama 5.9 milyar km uzaklıkta bulunur. Bir Plüton yılı, Dünya'da 248 yıla karşılık gelir!",
  },
  {
    baslik: "🌌 Samanyolu Galaksisi",
    bilgi: "Samanyolu galaksisi yaklaşık 100.000 ışık yılı genişliğinde ve 200-400 milyar yıldızdan oluşmaktadır. Güneş sistemimiz galaksinin merkezine yaklaşık 26.000 ışık yılı uzaklıkta bulunur.",
  },
  {
    baslik: "⭐ En Büyük Yıldız",
    bilgi: "UY Scuti, bilinen en büyük yıldızlardan biridir. Güneşimizden yaklaşık 1.700 kat büyüktür! Eğer Güneş'in yerine konulsaydı, Jüpiter'in yörüngesine kadar uzanırdı.",
  },
  {
    baslik: "🕳️ Kara Delikler",
    bilgi: "Kara delikler, ışığın bile kaçamadığı sonsuz yoğunlukta uzay nesneleridir. En büyük kara delik TON 618, Güneş'ten 66 milyar kat daha kütlelidir.",
  },
  {
    baslik: "🌠 Meteor Yağmurları",
    bilgi: "Perseid meteor yağmuru her yıl Ağustos ayında görülür. Saatte 100'den fazla meteor düşebilir! Bu meteoritler, komüt Swift-Tuttle'ın bıraktığı iz üzerinden geçtiğimizde oluşur.",
  },
  {
    baslik: "🔭 Hubble Uzay Teleskobu",
    bilgi: "Hubble Uzay Teleskobu 1990'da fırlatıldı ve 13 milyar ışık yılı uzaklığındaki galaksileri görebildi. Evreni anlamamızda devrim yaratan bu teleskop hâlâ aktif olarak çalışmaktadır.",
  },
  {
    baslik: "🛸 Voyager 1",
    bilgi: "Voyager 1, 1977'de fırlatılan ve şu anda Güneş Sisteminin dışında olan insanlığın en uzak uzay aracıdır. Dünya'ya sinyal iletmesi yaklaşık 22 saat sürmektedir!",
  },
];

export default {
  data: new SlashCommandBuilder()
    .setName("uzay")
    .setDescription("🌌 Rastgele bir uzay bilgisi öğren!"),

  async execute(interaction: ChatInputCommandInteraction) {
    const bilgi = uzayBilgileri[Math.floor(Math.random() * uzayBilgileri.length)];

    const embed = new EmbedBuilder()
      .setColor(0x0d0d2b)
      .setTitle(bilgi.baslik)
      .setDescription(bilgi.bilgi)
      .setFooter({
        text: "✦ Plutonium Bot • Uzayın Sırları",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
