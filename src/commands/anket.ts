import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const EMOJILER = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

export default {
  data: new SlashCommandBuilder()
    .setName("anket")
    .setDescription("📊 Sunucuya anket oluştur")
    .addStringOption(o => o.setName("soru").setDescription("Anket sorusu").setRequired(true))
    .addStringOption(o => o.setName("secenekler").setDescription("Seçenekler — virgülle ayır: Evet, Hayır, Belki").setRequired(true))
    .addBooleanOption(o => o.setName("anonim").setDescription("Anonim anket mi? (varsayılan: hayır)"))
    .addIntegerOption(o => o.setName("sure").setDescription("Kaç dakika sürsün? (0 = süresiz)").setMinValue(0).setMaxValue(10080)),

  async execute(interaction: ChatInputCommandInteraction) {
    const soru = interaction.options.getString("soru")!;
    const seceneklerRaw = interaction.options.getString("secenekler")!;
    const anonim = interaction.options.getBoolean("anonim") ?? false;
    const sure = interaction.options.getInteger("sure") ?? 0;

    const secenekler = seceneklerRaw.split(",").map(s => s.trim()).filter(Boolean).slice(0, 10);
    if (secenekler.length < 2)
      return interaction.reply({ content: "❌ En az 2 seçenek gir! (virgülle ayır)", ephemeral: true });

    const bitis = sure > 0 ? Math.floor((Date.now() + sure * 60_000) / 1000) : null;

    const aciklama = secenekler
      .map((s, i) => `${EMOJILER[i]} **${s}**`)
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`📊 ${soru}`)
      .setDescription(aciklama)
      .addFields(
        { name: "🗳️ Nasıl Oy Kullanılır?", value: "Aşağıdaki emojilere tıkla!", inline: true },
        { name: "👤 Oluşturan", value: anonim ? "Gizli" : `${interaction.user}`, inline: true },
        ...(bitis ? [{ name: "⏰ Bitiş", value: `<t:${bitis}:R>`, inline: true }] : []),
      )
      .setFooter({ text: "✦ Plutonium Bot • Anket Sistemi" })
      .setTimestamp();

    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    const chunks = Math.ceil(secenekler.length / 5);
    for (let c = 0; c < chunks; c++) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const chunk = secenekler.slice(c * 5, c * 5 + 5);
      for (let i = 0; i < chunk.length; i++) {
        const globalIdx = c * 5 + i;
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`poll_${globalIdx}`)
            .setLabel(EMOJILER[globalIdx])
            .setStyle(ButtonStyle.Secondary)
        );
      }
      rows.push(row);
    }

    await interaction.reply({ embeds: [embed], components: rows });
  },
};
