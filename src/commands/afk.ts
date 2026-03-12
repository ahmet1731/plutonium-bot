import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { getAfk, setAfk, clearAfk } from "../data/storage.js";

export default {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("😴 AFK modunu aç veya kapat")
    .addStringOption(o =>
      o.setName("mesaj").setDescription("AFK mesajı (boş = varsayılan)").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild!.id;
    const userId = interaction.user.id;
    const mevcut = getAfk(guildId, userId);

    if (mevcut) {
      clearAfk(guildId, userId);
      const sure = Math.floor((Date.now() - mevcut.since) / 1000);
      const dk = Math.floor(sure / 60);
      const sa = Math.floor(dk / 60);
      const embed = new EmbedBuilder()
        .setColor(0x00ff88)
        .setTitle("✅ AFK Modu Kapatıldı")
        .setDescription(`Hoş geldin! **${sa > 0 ? `${sa} saat ` : ""}${dk % 60} dakika** boyunca AFK'daydın.`)
        .setFooter({ text: "✦ Plutonium Bot • AFK Sistemi" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const mesajlar = [
      "🌌 Galakside kayboldu...",
      "🪐 Plüton'a gitti, sinyali kesildi.",
      "🛸 Uzay yürüyüşünde...",
      "😴 Kara delikte uyuyor...",
      "📡 Sinyal kaybı — Lütfen bekleyin.",
    ];
    const mesaj = interaction.options.getString("mesaj")
      ?? mesajlar[Math.floor(Math.random() * mesajlar.length)];

    setAfk(guildId, userId, mesaj);
    const embed = new EmbedBuilder()
      .setColor(0xffaa00)
      .setTitle("😴 AFK Modu Açıldı")
      .setDescription(`**Mesaj:** ${mesaj}\n\nBiri seni mention ederse mesajın gösterilecek.`)
      .setFooter({ text: "✦ Plutonium Bot • AFK Sistemi" })
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  },
};
