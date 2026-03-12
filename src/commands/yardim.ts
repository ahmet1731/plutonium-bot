import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("yardim")
    .setDescription("📜 Tüm komutları gör"),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(0x1a0533)
      .setTitle("🚀 Plutonium Bot — Komut Listesi")
      .setDescription(
        "✦ Uzay & Plüton temalı Discord botu!\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      )
      .addFields(
        {
          name: "💰 Ekonomi",
          value:
            "`/ekonomi bakiye [@kişi]` — Bakiyeni gör\n" +
            "`/ekonomi gunluk` — Günlük ödül al 🎁\n" +
            "`/ekonomi calis` — Çalış, para kazan ⛏️\n" +
            "`/ekonomi yatir <miktar>` — Bankaya para yatır\n" +
            "`/ekonomi cek <miktar>` — Bankadan çek\n" +
            "`/ekonomi gonder @kişi <miktar>` — Para gönder\n" +
            "`/ekonomi soy @kişi` — Cep soymaya çalış 🔫\n" +
            "`/ekonomi siralama` — Zenginler listesi 🏆",
          inline: false,
        },
        {
          name: "🎉 Çekiliş & Anket",
          value:
            "`/cekilis baslat <süre> <ödül>` — Çekiliş başlat *(Yönetici)*\n" +
            "`/cekilis bitir <id>` — Çekilişi bitir *(Yönetici)*\n" +
            "`/cekilis liste` — Aktif çekilişler\n" +
            "`/anket <soru> <seçenekler>` — Anket oluştur 📊",
          inline: false,
        },
        {
          name: "🌌 Uzay Komutları",
          value:
            "`/uzay` — Rastgele uzay bilgisi\n" +
            "`/pluton` — Plüton hakkında detaylı bilgi",
          inline: false,
        },
        {
          name: "😄 Şaka & Eğlence",
          value:
            "`/saka klasik` — Soru-cevap uzay şakası\n" +
            "`/saka tek-satir` — Tek satırlık düşünce\n" +
            "`/yapay-zeka <soru>` — Saçma ama güvenilir(!) cevaplar 🤖\n" +
            "`/fal burc|gunluk|ask` — Uzay falı 🔮\n" +
            "`/ship @kişi1 [@kişi2]` — Eşleştir 💘\n" +
            "`/evlen @kişi1 [@kişi2]` — Evlilik uyumluluk testi 💒\n" +
            "`/iq [@kişi]` — IQ ölçümü\n" +
            "`/hiz [@kişi]` — Uzaydaki hız\n" +
            "`/roast @kişi` — Yakıcı şaka\n" +
            "`/eglence yazı-tura|zar|fikra|8top|seç` — Mini oyunlar",
          inline: false,
        },
        {
          name: "🎖️ Ses Rütbe Sistemi",
          value:
            "`/rutbe bak [@kişi]` — Rütbeni gör\n" +
            "`/rutbe siralama` — Ses süresi sıralaması\n" +
            "`/rutbe rutbeler` — Tüm rütbeler\n" +
            "`/rutbe ver|al|sifirla` — Yönetici işlemleri",
          inline: false,
        },
        {
          name: "⭐ Yıldız Sistemi",
          value:
            "`/yildiz ver @kişi` — Birine yıldız ver\n" +
            "`/yildiz bak [@kişi]` — Yıldız sayısına bak\n" +
            "`/yildiz siralama` — Top 10 sıralaması",
          inline: false,
        },
        {
          name: "👤 Bilgi & Araçlar",
          value:
            "`/profil [@kişi]` — Kullanıcı profili\n" +
            "`/avatar [@kişi]` — Avatar gör 🖼️\n" +
            "`/sunucu` — Sunucu istatistikleri\n" +
            "`/afk [mesaj]` — AFK modunu aç/kapat 😴\n" +
            "`/hatirlatici <süre> <mesaj>` — Hatırlatıcı kur ⏰\n" +
            "`/ping` — Bot gecikmesi",
          inline: false,
        },
        {
          name: "⚙️ Sunucu Ayarları (Yönetici)",
          value:
            "`/ayarlar goster` — Mevcut ayarları gör\n" +
            "`/ayarlar hosgeldin-kanal #kanal` — Hoş geldin kanalı\n" +
            "`/ayarlar veda-kanal #kanal` — Veda kanalı\n" +
            "`/ayarlar log-kanal #kanal` — Log kanalı\n" +
            "`/ayarlar oto-rol @rol` — Yeni üye otomatik rolü\n" +
            "`/ayarlar sifirla` — Tüm ayarları sıfırla",
          inline: false,
        },
        {
          name: "🛡️ Moderasyon (Yetkili)",
          value:
            "`/mod kick @kişi` — At\n" +
            "`/mod ban @kişi` — Yasakla\n" +
            "`/mod unban <id>` — Yasağı kaldır\n" +
            "`/mod timeout @kişi <dakika>` — Sustur\n" +
            "`/mod temizle <miktar>` — Mesajları sil",
          inline: false,
        }
      )
      .setFooter({
        text: "✦ Plutonium Bot • Uzayın Derinliklerinden",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
