import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  GuildMember,
} from "discord.js";
import { getGiveawayStore, saveGiveaway, getGiveaway, saveGiveawayStore, getActiveGiveaways, Giveaway } from "../data/storage.js";
import { randomUUID } from "crypto";

function parseTime(str: string): number | null {
  const match = str.match(/^(\d+)(s|dk|sa|g)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  switch (match[2].toLowerCase()) {
    case "s":  return val * 1000;
    case "dk": return val * 60_000;
    case "sa": return val * 3_600_000;
    case "g":  return val * 86_400_000;
    default:   return null;
  }
}

async function cekilisiBitir(giveaway: Giveaway, client: import("discord.js").Client) {
  const store = getGiveawayStore();
  giveaway.ended = true;
  const participants = [...new Set(giveaway.participants)];
  const winners: string[] = [];
  const havuz = [...participants];
  for (let i = 0; i < giveaway.winnerCount && havuz.length > 0; i++) {
    const idx = Math.floor(Math.random() * havuz.length);
    winners.push(havuz.splice(idx, 1)[0]);
  }
  giveaway.winners = winners;
  store[giveaway.id] = giveaway;
  saveGiveawayStore(store);

  try {
    const channel = await client.channels.fetch(giveaway.channelId) as TextChannel;
    const msg = await channel.messages.fetch(giveaway.messageId);
    const winnerStr = winners.length > 0
      ? winners.map(w => `<@${w}>`).join(", ")
      : "Katılımcı yok 😢";
    const embed = new EmbedBuilder()
      .setColor(0xff6b35)
      .setTitle("🎉 Çekiliş Sona Erdi!")
      .setDescription(`**Ödül:** ${giveaway.prize}\n\n🏆 **Kazananlar:** ${winnerStr}`)
      .addFields(
        { name: "👥 Katılımcı", value: `${participants.length} kişi`, inline: true },
        { name: "🎯 Kazanan Sayısı", value: `${winners.length}`, inline: true },
      )
      .setFooter({ text: `✦ Çekiliş ID: ${giveaway.id.slice(0,8)}` })
      .setTimestamp();
    await msg.edit({ embeds: [embed], components: [] });
    await channel.send({ content: winners.length > 0 ? `🎉 Tebrikler ${winnerStr}! **${giveaway.prize}** kazandınız!` : "😢 Geçerli katılımcı bulunamadı." });
  } catch {}
}

const activeTimers = new Map<string, NodeJS.Timeout>();

export async function initGiveawayTimers(client: import("discord.js").Client) {
  const store = getGiveawayStore();
  for (const g of Object.values(store)) {
    if (!g.ended) {
      const kalan = g.endsAt - Date.now();
      if (kalan <= 0) {
        await cekilisiBitir(g, client);
      } else {
        const timer = setTimeout(() => cekilisiBitir(g, client), kalan);
        activeTimers.set(g.id, timer);
      }
    }
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("cekilis")
    .setDescription("🎉 Çekiliş sistemi")
    .addSubcommand(s => s
      .setName("baslat")
      .setDescription("🎊 Yeni çekiliş başlat (Yönetici)")
      .addStringOption(o => o.setName("sure").setDescription("Süre: 30dk, 2sa, 1g").setRequired(true))
      .addStringOption(o => o.setName("odul").setDescription("Çekiliş ödülü").setRequired(true))
      .addIntegerOption(o => o.setName("kazanan").setDescription("Kazanan sayısı").setMinValue(1).setMaxValue(20))
    )
    .addSubcommand(s => s
      .setName("bitir")
      .setDescription("🛑 Çekilişi erken bitir (Yönetici)")
      .addStringOption(o => o.setName("id").setDescription("Çekiliş ID (ilk 8 karakter)").setRequired(true))
    )
    .addSubcommand(s => s
      .setName("liste")
      .setDescription("📋 Aktif çekilişleri listele")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild!.id;

    if (sub === "baslat") {
      if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: "❌ Sunucu Yönet yetkisi gerekli!", ephemeral: true });

      const sureStr = interaction.options.getString("sure")!;
      const odul = interaction.options.getString("odul")!;
      const kazananSayisi = interaction.options.getInteger("kazanan") ?? 1;
      const sureMs = parseTime(sureStr);
      if (!sureMs) return interaction.reply({ content: "❌ Geçersiz süre! (Örnek: 30dk, 2sa, 1g)", ephemeral: true });

      const bitis = Date.now() + sureMs;
      const embed = new EmbedBuilder()
        .setColor(0xf5c518)
        .setTitle("🎉 ÇEKİLİŞ BAŞLADI!")
        .setDescription(`**Ödül:** ${odul}\n\nKatılmak için butona tıkla! 👇`)
        .addFields(
          { name: "⏰ Bitiş", value: `<t:${Math.floor(bitis / 1000)}:R>`, inline: true },
          { name: "🏆 Kazanan", value: `${kazananSayisi} kişi`, inline: true },
          { name: "🎟️ Katılımcı", value: "0", inline: true },
          { name: "👑 Düzenleyen", value: `${interaction.user}`, inline: true },
        )
        .setFooter({ text: "✦ Plutonium Bot • Çekiliş Sistemi" })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("giveaway_join").setLabel("🎉 Katıl!").setStyle(ButtonStyle.Success)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      const msg = await interaction.fetchReply();

      const g: Giveaway = {
        id: randomUUID(),
        guildId,
        channelId: interaction.channelId,
        messageId: msg.id,
        prize: odul,
        winnerCount: kazananSayisi,
        endsAt: bitis,
        hostId: interaction.user.id,
        participants: [],
        ended: false,
        winners: [],
      };
      saveGiveaway(g);

      const timer = setTimeout(() => cekilisiBitir(g, interaction.client), sureMs);
      activeTimers.set(g.id, timer);
    }

    if (sub === "bitir") {
      if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: "❌ Sunucu Yönet yetkisi gerekli!", ephemeral: true });

      const prefix = interaction.options.getString("id")!;
      const store = getGiveawayStore();
      const g = Object.values(store).find(x => x.guildId === guildId && !x.ended && x.id.startsWith(prefix));
      if (!g) return interaction.reply({ content: "❌ Aktif çekiliş bulunamadı!", ephemeral: true });

      const t = activeTimers.get(g.id);
      if (t) clearTimeout(t);
      await interaction.reply({ content: "✅ Çekiliş sonlandırılıyor...", ephemeral: true });
      await cekilisiBitir(g, interaction.client);
    }

    if (sub === "liste") {
      const aktif = getActiveGiveaways(guildId);
      if (aktif.length === 0) return interaction.reply({ content: "📋 Aktif çekiliş yok!", ephemeral: true });
      const desc = aktif.map(g =>
        `🎉 **${g.prize}** — <t:${Math.floor(g.endsAt/1000)}:R> — ${g.participants.length} katılımcı\n\`ID: ${g.id.slice(0,8)}\``
      ).join("\n\n");
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xf5c518)
        .setTitle("🎊 Aktif Çekilişler").setDescription(desc)
        .setFooter({ text: "✦ Plutonium Bot • Çekiliş" }).setTimestamp()] });
    }
  },
};
