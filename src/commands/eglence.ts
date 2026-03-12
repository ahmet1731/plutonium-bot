import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

const yazıTura = ["Yazı ✨", "Tura 🌙"];
const zarSayilari = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];

const uzayFikraları = [
  "Astronotlara neden sürpriz parti yapılmaz? Çünkü uzayda hava yok! 🎈",
  "Plüton neden üzgün? Çünkü gezegenler kulübüne alınmadı! 🪐",
  "Mars'taki barın adı ne? Curiosity! 🍺",
  "Güneş neden sosyal medyaya girmez? Çünkü zaten çok takipçisi var! ⭐",
  "Kara deliğin restoranına gitsen ne yer? Hiçbir şey, çünkü her şey içinde kayboluyor! 🕳️",
  "Uzaydaki müziği neden duyamazsın? Çünkü uzayda ses yayılamaz... ve kulaklığını unuttun! 🎵",
];

const tamamla8top = [
  "Kesinlikle! 🌟",
  "Yıldızlar bunu onaylar! ⭐",
  "Galaksi buna 'evet' diyor! 🌌",
  "Plüton'un büyüsüyle: EVET! 🪐",
  "Uzay sonsuz, bu da mümkün! ✨",
  "Hmm... sanmıyorum. ☄️",
  "Kara delik kadar karanlık bu fikir... 🕳️",
  "Çok şüpheli! Uzaydan işaret yok! 📡",
  "Gelecek belirsiz, tıpkı Kuiper Kuşağı gibi... 🔭",
  "Emin değilim, yıldızlara sor! 🌠",
];

export default {
  data: new SlashCommandBuilder()
    .setName("eglence")
    .setDescription("🎮 Eğlence komutları")
    .addSubcommand((sub) =>
      sub.setName("yazı-tura").setDescription("🪙 Yazı mı tura mı?")
    )
    .addSubcommand((sub) =>
      sub
        .setName("zar")
        .setDescription("🎲 Zar at!")
        .addIntegerOption((opt) =>
          opt
            .setName("kenar")
            .setDescription("Kaç kenarlı zar? (2-100)")
            .setMinValue(2)
            .setMaxValue(100)
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("fikra").setDescription("😄 Uzay temalı komik bir şey duyalım!")
    )
    .addSubcommand((sub) =>
      sub
        .setName("8top")
        .setDescription("🎱 Sihirli 8-Top'a sor!")
        .addStringOption((opt) =>
          opt.setName("soru").setDescription("Soruyu sor!").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("seç")
        .setDescription("🎯 Seçenekler arasından rastgele birini seç!")
        .addStringOption((opt) =>
          opt
            .setName("secenekler")
            .setDescription("Virgülle ayır: pizza, burger, sushi")
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "yazı-tura") {
      const sonuc = yazıTura[Math.floor(Math.random() * yazıTura.length)];
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("🪙 Yazı mı Tura mı?")
        .setDescription(`Sonuç: **${sonuc}**`)
        .setFooter({ text: "✦ Plutonium Bot • Eğlence" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "zar") {
      const kenar = interaction.options.getInteger("kenar") ?? 6;
      const sonuc = Math.floor(Math.random() * kenar) + 1;
      const emoji = kenar === 6 ? zarSayilari[sonuc - 1] : `**${sonuc}**`;
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`🎲 ${kenar} Kenarlı Zar Atıldı!`)
        .setDescription(`Sonuç: ${emoji}`)
        .setFooter({ text: "✦ Plutonium Bot • Eğlence" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "fikra") {
      const fikra = uzayFikraları[Math.floor(Math.random() * uzayFikraları.length)];
      const embed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle("😄 Uzay Fıkrası")
        .setDescription(fikra)
        .setFooter({ text: "✦ Plutonium Bot • Eğlence" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "8top") {
      const soru = interaction.options.getString("soru")!;
      const cevap = tamamla8top[Math.floor(Math.random() * tamamla8top.length)];
      const embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setTitle("🎱 Sihirli Uzay 8-Top")
        .addFields(
          { name: "❓ Soru", value: soru },
          { name: "🔮 Cevap", value: cevap }
        )
        .setFooter({ text: "✦ Plutonium Bot • Eğlence" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "seç") {
      const secenekler = interaction.options
        .getString("secenekler")!
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (secenekler.length < 2) {
        return interaction.reply({
          content: "❌ En az 2 seçenek gir! (Virgülle ayır)",
          ephemeral: true,
        });
      }

      const secim = secenekler[Math.floor(Math.random() * secenekler.length)];
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("🎯 Seçim Yapıldı!")
        .setDescription(
          `Seçenekler: ${secenekler.map((s) => `\`${s}\``).join(", ")}\n\n` +
          `✦ Seçilen: **${secim}** 🌟`
        )
        .setFooter({ text: "✦ Plutonium Bot • Eğlence" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  },
};
