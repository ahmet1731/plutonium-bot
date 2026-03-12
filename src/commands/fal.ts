import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

const burcler = [
  { ad: "♈ Koç", tarih: "21 Mar – 19 Nis" },
  { ad: "♉ Boğa", tarih: "20 Nis – 20 May" },
  { ad: "♊ İkizler", tarih: "21 May – 20 Haz" },
  { ad: "♋ Yengeç", tarih: "21 Haz – 22 Tem" },
  { ad: "♌ Aslan", tarih: "23 Tem – 22 Ağu" },
  { ad: "♍ Başak", tarih: "23 Ağu – 22 Eyl" },
  { ad: "♎ Terazi", tarih: "23 Eyl – 22 Eki" },
  { ad: "♏ Akrep", tarih: "23 Eki – 21 Kas" },
  { ad: "♐ Yay", tarih: "22 Kas – 21 Ara" },
  { ad: "♑ Oğlak", tarih: "22 Ara – 19 Oca" },
  { ad: "♒ Kova", tarih: "20 Oca – 18 Şub" },
  { ad: "♓ Balık", tarih: "19 Şub – 20 Mar" },
];

const uzayFallari = [
  "Satürn halkaları bugün sana HAYIR diyor. Yarın dene.",
  "Mars saldırgan konumda. Bugün kimseyle tartışma, yenilirsin.",
  "Venüs aşk hayatına burnunu sokmuş. Dikkatli ol, garip mesajlar alabilirsin.",
  "Jüpiter büyüklük kompleksiyle sana yaklaşıyor. Ego yüksek olacak.",
  "Plüton resmi olarak gezegen olmadığı için falın da geçersiz sayılabilir.",
  "Merkür geriye gidiyor. Bilgisayarını yedekle, tüm dosyaların kaybolabilir.",
  "Güneş çok parlak bugün. Güneş gözlüğü tak veya kör olursun, ikisi de faldan çıktı.",
  "Ay dolunay konumunda. Seni sevenlerin aklı biraz gidecek. Daha da.",
  "Uranüs (ismine gülme, sen de gülüyorsun) olumlu açıda. Beklenmedik şeyler olacak.",
  "Neptün sis içinde, her şey muğlak. Bu yüzden falın da muğlak: Belki iyi, belki kötü.",
  "Kuyrukluyıldız geçişi: Atalarından mesaj var. İçeriği: 'Daha sık arayabilirsin.'",
  "Kara delik açısı sıfır — bu ne demek? Hiçbir şey. Aynen hayatın gibi.",
  "Kozmik enerji yüksek bugün. Ama WiFi yavaş, bu enerjiyi kullanamıyorsun.",
];

const gunlukMesajlar = [
  "Bugün bir yabancıyla tanışacaksın. Muhtemelen Discord'da.",
  "Para gelecek... gibi hissedeceksin. Gelmeyecek ama his güzeldir.",
  "Bugün çok uyuyacaksın. Veya hiç uyumayacaksın. Fal kesin konuşmuyor.",
  "Eski bir arkadaşın seni arayacak. Para istemek için.",
  "Çok önemli bir karar vereceksin. Pizza çeşidi seçmek bile sayılır.",
  "Bugün bir şey kaybedeceksin. Muhtemelen telefon şarjını.",
  "Yıldızlar seninle. Ama Plüton sana bakıyor ve hafifçe yargılıyor.",
  "Enerjin yüksek olacak ama kafan karışık. Normal bir gün yani.",
];

const aşkFallari = [
  "Aşk hayatın Plüton kadar uzak ve soğuk. Ama güzel! Güzel soğuk.",
  "Birisi seni gizlice seviyor. Sen ise pizza seçmekle meşgulsün.",
  "Venüs pozisyonu: Bugün flört denemelerin %94 başarısız olacak. %6 da yanıltıcı.",
  "Kalbin Satürn halkaları gibi: Etrafında çok şey dönüyor ama hiçbiri yaklaşamıyor.",
  "Sevgilini bulmak için daha 3.7 ışık yılı yolculuk gerekiyor. Çok yakın!",
];

export default {
  data: new SlashCommandBuilder()
    .setName("fal")
    .setDescription("🔮 Uzay falına bak!")
    .addSubcommand((sub) =>
      sub
        .setName("burc")
        .setDescription("♈ Burç falı")
        .addStringOption((opt) =>
          opt
            .setName("burc")
            .setDescription("Burçunu seç")
            .setRequired(true)
            .addChoices(
              ...burcler.map((b) => ({ name: `${b.ad} (${b.tarih})`, value: b.ad }))
            )
        )
    )
    .addSubcommand((sub) =>
      sub.setName("gunluk").setDescription("📅 Günlük uzay falı")
    )
    .addSubcommand((sub) =>
      sub.setName("ask").setDescription("💕 Aşk falı")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();

    await interaction.deferReply();
    await new Promise((r) => setTimeout(r, 1500));

    if (sub === "burc") {
      const burc = interaction.options.getString("burc")!;
      const uzayFal = uzayFallari[Math.floor(Math.random() * uzayFallari.length)];
      const gunluk = gunlukMesajlar[Math.floor(Math.random() * gunlukMesajlar.length)];
      const skor = Math.floor(Math.random() * 40 + 30);
      const yildiz = "⭐".repeat(Math.floor(skor / 20)) + "☆".repeat(5 - Math.floor(skor / 20));

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle(`🔮 ${burc} — Uzay Burç Falı`)
        .addFields(
          { name: "🌌 Kozmik Mesaj", value: uzayFal },
          { name: "📅 Günün Özeti", value: gunluk },
          { name: "✨ Şans Skoru", value: `${yildiz} (${skor}/100)` },
          {
            name: "🍀 Şanslı Sayı",
            value: `${Math.floor(Math.random() * 100)} — Plüton'daki hesaplardan alındı`,
          },
          {
            name: "🎨 Şanslı Renk",
            value: ["Derin Mor", "Nebula Mavisi", "Pulsar Kırmızısı", "Kara Delik Siyahı", "Yıldız Sarısı"][Math.floor(Math.random() * 5)],
          }
        )
        .setFooter({ text: "✦ Uyarı: Bu fal bilimsel değildir. Zaten bilim de her şeyi açıklayamıyor." })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === "gunluk") {
      const mesaj1 = gunlukMesajlar[Math.floor(Math.random() * gunlukMesajlar.length)];
      const mesaj2 = uzayFallari[Math.floor(Math.random() * uzayFallari.length)];

      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle("📅 Günlük Uzay Falı")
        .setDescription("*Yıldızlar konuştu, Plüton not aldı...*")
        .addFields(
          { name: "🌟 Bugünün Mesajı", value: mesaj1 },
          { name: "🪐 Gezegen Etkisi", value: mesaj2 },
          {
            name: "🎯 Günün Tavsiyesi",
            value: [
              "Bugün kimseyle tartışma. Haklı olsan bile.",
              "Su iç. Gerisi ikincil.",
              "Telefonunu şarj et. Her şey bunun üzerine kurulu.",
              "Bugün bir şeylere 'hayır' demeyi dene. Çok zevkli.",
              "Uyumak istersen uyu. Yıldızlar da uyuyor bazen.",
            ][Math.floor(Math.random() * 5)],
          }
        )
        .setFooter({ text: "✦ Plutonium Bot • Uzay Falcısı" })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === "ask") {
      const falMetni = aşkFallari[Math.floor(Math.random() * aşkFallari.length)];
      const uyumluluk = Math.floor(Math.random() * 60 + 10);

      const embed = new EmbedBuilder()
        .setColor(0xe91e8c)
        .setTitle("💕 Uzay Aşk Falı")
        .setDescription("*Venüs konuştu, kalpler titredi...*")
        .addFields(
          { name: "💌 Aşk Mesajı", value: falMetni },
          {
            name: "❤️ Evrensel Aşk Skoru",
            value: `%${uyumluluk} — ${"❤️".repeat(Math.ceil(uyumluluk / 20))}${"🖤".repeat(5 - Math.ceil(uyumluluk / 20))}`,
          },
          {
            name: "💡 Tavsiye",
            value: [
              "Duygularını söyle. En kötü ihtimalle reddedilirsin, bu da bir cevap.",
              "Bekle. Evren 13.8 milyar yıl bekledi, sen de birkaç gün bekleyebilirsin.",
              "Flört mesajın için ChatGPT'ye sorma. Bana sor, daha kötü tavsiye veririm ama en azından dürüstüm.",
              "Aşk bulunmaz, aşk seçilir. Ama önce biri seni seçsin.",
            ][Math.floor(Math.random() * 4)],
          }
        )
        .setFooter({ text: "✦ Uyarı: Aşk falı garantili değildir. Para iadesi yapılmaz. Zaten ücretsiz." })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
