import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface Mesaj {
  role: "user" | "model";
  parts: { text: string }[];
}

const sohbetGecmisi = new Map<string, Mesaj[]>();

const SISTEM_TALIMATI = `Sen Plütonium adlı bir Discord botusun. Türkçe konuşuyorsun.
Kısa, esprili ve samimi cevaplar veriyorsun. Uzay temalı bir sunucu için çalışıyorsun.
Çok uzun cevaplar vermekten kaçın, Discord'a uygun ol. Gerektiğinde emoji kullan.`;

export default {
  data: new SlashCommandBuilder()
    .setName("yapay-zeka")
    .setDescription("🤖 Gemini yapay zekasıyla sohbet et")
    .addSubcommand(sub =>
      sub.setName("sor")
        .setDescription("🤖 Yapay zekaya bir şey sor")
        .addStringOption(opt =>
          opt.setName("mesaj")
            .setDescription("Ne sormak istiyorsun?")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName("sifirla")
        .setDescription("🔄 Sohbet geçmişini sıfırla")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (sub === "sifirla") {
      sohbetGecmisi.delete(userId);
      return interaction.reply({ content: "🔄 Sohbet geçmişin sıfırlandı!", ephemeral: true });
    }

    if (!ai) {
      return interaction.reply({
        content: "⚠️ Yapay zeka şu an aktif değil. GEMINI_API_KEY eksik.",
        ephemeral: true,
      });
    }

    const mesaj = interaction.options.getString("mesaj", true);
    await interaction.deferReply();

    const gecmis = sohbetGecmisi.get(userId) ?? [];
    gecmis.push({ role: "user", parts: [{ text: mesaj }] });
    if (gecmis.length > 20) gecmis.splice(0, 2);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: gecmis,
        config: {
          maxOutputTokens: 8192,
          systemInstruction: SISTEM_TALIMATI,
        },
      });

      const cevap = response.text ?? "Bir cevap üretemiyorum şu an. Tekrar dene!";
      gecmis.push({ role: "model", parts: [{ text: cevap }] });
      sohbetGecmisi.set(userId, gecmis);

      const kisaCevap = cevap.length > 1800 ? cevap.substring(0, 1800) + "..." : cevap;

      const embed = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle("🤖 Plütonium AI")
        .addFields(
          { name: "❓ Soru", value: `*"${mesaj.length > 200 ? mesaj.substring(0, 200) + "..." : mesaj}"*` },
          { name: "💡 Cevap", value: kisaCevap },
        )
        .setFooter({ text: `✦ Gemini 2.5 Flash • ${Math.floor(gecmis.length / 2)} mesaj | /yapay-zeka sifirla` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("Gemini hatası:", err);
      await interaction.editReply({ content: "⚠️ Yapay zeka şu an cevap veremiyor, biraz sonra tekrar dene!" });
    }
  },
};
