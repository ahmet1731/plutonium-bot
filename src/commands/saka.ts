import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

interface Saka {
  soru: string;
  cevap: string;
  emoji: string;
}

const uzaySakalari: Saka[] = [
  {
    soru: "Plüton neden okula gitmiyor?",
    cevap: "Çünkü gezegenler sınıfına alınmıyor! 😭",
    emoji: "🪐",
  },
  {
    soru: "Astronotlar neden karanlıktan korkmuyor?",
    cevap: "Çünkü onlar zaten uzayda! Karanlık onların ev arkadaşı! 🌌",
    emoji: "👨‍🚀",
  },
  {
    soru: "Güneş sosyal medyada neden paylaşım yapmıyor?",
    cevap: "Çünkü zaten milyarlarca takipçisi var ve algoritma onu yıldız olarak işaretledi! ⭐",
    emoji: "☀️",
  },
  {
    soru: "Kara delik neden psikologa gitti?",
    cevap: "Çünkü her şeyi içine atıyordu ve hiçbir şeyi bırakamıyordu! 🕳️",
    emoji: "🕳️",
  },
  {
    soru: "Mars'ta restoran açsan ne yana koyardın?",
    cevap: "Curiosity Bar! Ama müşteri yoktur zira atmosfer düşmanca! 🍸",
    emoji: "🔴",
  },
  {
    soru: "Ay neden diyet yapıyor?",
    cevap: "Çünkü çok fazla döngüsü var ve her seferinde dolunay oluyor! 🌕",
    emoji: "🌙",
  },
  {
    soru: "Satürn neden halkasını çıkarmıyor?",
    cevap: "Çünkü Jüpiter görünce kıskanıyor ve halkasını göstermek istiyor! 💍",
    emoji: "🪐",
  },
  {
    soru: "Uzaydaki müzisyen neden ünlü olamadı?",
    cevap: "Çünkü müziği kimseye ulaşmadı — uzayda ses yayılamaz! 🎵",
    emoji: "🎸",
  },
  {
    soru: "Plüton'da pizza sipariş etsem ne kadar sürer?",
    cevap: "Yaklaşık 5-6 saatlik ışık yolculuğu... Soğumuş gelir ama en azından dondurulmuş! 🍕",
    emoji: "🛸",
  },
  {
    soru: "Neden astronotlar her zaman sakin görünür?",
    cevap: "Çünkü uzayda çığlık atsalar kimse duymaz. Zaten denemediler mi ki? 😨",
    emoji: "😱",
  },
  {
    soru: "Uzayda neden WiFi çekmiyor?",
    cevap: "Çünkü sinyal şifresi çok uzun: 'buyıldızlarasisifre123!@#' yazmak zahmetli! 📶",
    emoji: "📡",
  },
  {
    soru: "Merkür neden herkesle çabuk biter?",
    cevap: "Çünkü yılı sadece 88 gün! Sabah dost akşam düşman! ☄️",
    emoji: "🌡️",
  },
  {
    soru: "Neptün neden üzgün görünür?",
    cevap: "Çünkü en uzakta oturuyor ve kimse ziyaretine gitmiyor. Sosyal izolasyon! 💙",
    emoji: "🔵",
  },
  {
    soru: "Jüpiter neden güvenlik görevlisi?",
    cevap: "Çünkü Güneş Sistemi'nin çöp toplayıcısı! Her meteoru üzerine çekip savunuyor! 🛡️",
    emoji: "🟠",
  },
  {
    soru: "Voyager 1 neden posta göndermez?",
    cevap: "Kargo ücreti astronomik... ha gerçekten astronomik! 📦",
    emoji: "🚀",
  },
];

const tekSatirSakalar = [
  "Evren genişliyor. Muhtemelen bizden kaçıyor. 🌌",
  "Işık hızında gidebilseydim trafik cezası alırdım çünkü fizik yasaları ihlali! ⚡",
  "Kara delikler çok tuhaf: Girenler çıkmıyor. Tam benim sosyal hayatım gibi. 🕳️",
  "Dünya dönüyor ama benim hayatım da döndüğü yerde duruyor. 🌍",
  "Astronot olmak isterdim ama asansör tutmasından bile bayılıyorum. 🛸",
  "Uzayda ağırlıksızlık var. Keşke yediklerimde de olsaydı. 🌮",
  "Güneş her gün doğuyor. Ben ise haftada 3 gün doğmayı başarıyorum. ☀️",
  "Plüton gezegen değil ama ben de çoğu zaman insan sayılmıyorum. 🪐",
  "5 milyar yıl sonra Güneş büyüyüp her şeyi yutacak. Ama önce sınavım var. 😔",
];

export default {
  data: new SlashCommandBuilder()
    .setName("saka")
    .setDescription("😄 Uzay temalı şakalar!")
    .addSubcommand((sub) =>
      sub.setName("klasik").setDescription("🎭 Soru-cevap şakası")
    )
    .addSubcommand((sub) =>
      sub.setName("tek-satir").setDescription("⚡ Tek satırlık şaka")
    )
    .addSubcommand((sub) =>
      sub.setName("random").setDescription("🎲 Rastgele şaka türü")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const tip = sub === "random"
      ? Math.random() > 0.5 ? "klasik" : "tek-satir"
      : sub;

    if (tip === "klasik") {
      const saka = uzaySakalari[Math.floor(Math.random() * uzaySakalari.length)];

      const embed = new EmbedBuilder()
        .setColor(0xf0e040)
        .setTitle(`${saka.emoji} Uzay Şakası`)
        .addFields(
          { name: "❓ Soru", value: saka.soru },
          { name: "💬 Cevap", value: saka.cevap }
        )
        .setFooter({ text: "✦ Plutonium Bot • Uzay Şakaları" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (tip === "tek-satir") {
      const saka = tekSatirSakalar[Math.floor(Math.random() * tekSatirSakalar.length)];

      const embed = new EmbedBuilder()
        .setColor(0xf0e040)
        .setTitle("⚡ Tek Satırlık Uzay Düşüncesi")
        .setDescription(`*"${saka}"*`)
        .setFooter({ text: "✦ Plutonium Bot • Uzay Şakaları" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
