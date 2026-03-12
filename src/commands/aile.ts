import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  User,
} from "discord.js";
import {
  getMarriage,
  marry,
  divorce,
  adoptChild,
} from "../data/storage.js";

const TEKLIF_BEKLEYEN = new Map<string, { proposerId: string; targetId: string; guildId: string }>();

async function fetchUser(interaction: ChatInputCommandInteraction, id: string): Promise<User | null> {
  try { return await interaction.client.users.fetch(id); } catch { return null; }
}

export default {
  data: new SlashCommandBuilder()
    .setName("aile")
    .setDescription("💍 Evlilik & Aile sistemi")
    .addSubcommand(sub =>
      sub.setName("teklif")
        .setDescription("💍 Birine evlilik teklif et")
        .addUserOption(o => o.setName("kisi").setDescription("Evlenmek istediğin kişi").setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName("durum")
        .setDescription("💑 Evlilik durumunu görüntüle")
        .addUserOption(o => o.setName("kisi").setDescription("Kişi (boş = sen)").setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName("bosan")
        .setDescription("💔 Eşinden boşan (dram zamanı!)")
    )
    .addSubcommand(sub =>
      sub.setName("cocuk-edin")
        .setDescription("👶 Sunucu üyesini çocuk olarak edin (eşinle birlikte)")
        .addUserOption(o => o.setName("kisi").setDescription("Çocuk edinilecek kişi").setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName("soy-agaci")
        .setDescription("🌳 Aile soy ağacını görüntüle")
        .addUserOption(o => o.setName("kisi").setDescription("Kişi (boş = sen)").setRequired(false))
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;
    const userId = interaction.user.id;

    // ── EVLİLİK TEKLİFİ ────────────────────────────────────────────────────
    if (sub === "teklif") {
      const target = interaction.options.getUser("kisi", true);

      if (target.id === userId) {
        return interaction.reply({ content: "❌ Kendine teklif edemezsin, narsist!", ephemeral: true });
      }
      if (target.bot) {
        return interaction.reply({ content: "❌ Bota evlilik teklifi yapılmaz. (Benim kalbim yok.)", ephemeral: true });
      }

      const mevcutEvlilik = getMarriage(guildId, userId);
      if (mevcutEvlilik) {
        return interaction.reply({ content: "❌ Zaten evlisin! Önce `/aile bosan` dene.", ephemeral: true });
      }
      const hedefEvlilik = getMarriage(guildId, target.id);
      if (hedefEvlilik) {
        return interaction.reply({ content: `❌ ${target.username} zaten evli. Aile yıkıcılığı yasak!`, ephemeral: true });
      }

      const kabul = new ButtonBuilder()
        .setCustomId("marriage_accept")
        .setLabel("💍 Kabul Ediyorum!")
        .setStyle(ButtonStyle.Success);

      const red = new ButtonBuilder()
        .setCustomId("marriage_decline")
        .setLabel("💔 Hayır, teşekkürler")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(kabul, red);

      const embed = new EmbedBuilder()
        .setColor(0xff69b4)
        .setTitle("💍 Evlilik Teklifi!")
        .setDescription(
          `${interaction.user} sana evlilik teklif ediyor, ${target}! 💕\n\n` +
          `Bu teklifi kabul ediyor musun?\n*(60 saniye içinde cevap ver)*`
        )
        .setFooter({ text: "Plutonium Evlilik Dairesi™" })
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      const teklifKey = `${guildId}:${userId}:${target.id}`;
      TEKLIF_BEKLEYEN.set(teklifKey, { proposerId: userId, targetId: target.id, guildId });

      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000,
        filter: i => i.user.id === target.id,
      });

      collector.on("collect", async i => {
        TEKLIF_BEKLEYEN.delete(teklifKey);

        if (i.customId === "marriage_accept") {
          marry(guildId, userId, target.id);

          const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle("🎊 Evlilik Gerçekleşti!")
            .setDescription(
              `${interaction.user} ve ${target} artık evli! 💒\n\n` +
              `Tebrikler! Umarız bu evlilik Plüton'un yörüngesi kadar uzun sürer! 🪐`
            )
            .setFooter({ text: "Plutonium Evlilik Dairesi™ • Resmi Kayıt" })
            .setTimestamp();

          await i.update({ embeds: [embed], components: [] });
        } else {
          const embed = new EmbedBuilder()
            .setColor(0x888888)
            .setTitle("💔 Teklif Reddedildi")
            .setDescription(
              `${target} teklifi reddetti. ${interaction.user} için üzgünüm... 😢\n\n` +
              `Rus ruletine girmeyi dene, belki şansın düzelir.`
            )
            .setFooter({ text: "Plutonium Evlilik Dairesi™" });

          await i.update({ embeds: [embed], components: [] });
        }
        collector.stop();
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          TEKLIF_BEKLEYEN.delete(teklifKey);
          const embed = new EmbedBuilder()
            .setColor(0x888888)
            .setTitle("⏰ Teklif Zaman Aşımına Uğradı")
            .setDescription(`${target} cevap vermedi. Şansını başka biriyle dene! 😅`)
            .setFooter({ text: "Plutonium Evlilik Dairesi™" });
          await interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
        }
      });
    }

    // ── EVLİLİK DURUMU ──────────────────────────────────────────────────────
    else if (sub === "durum") {
      const hedef = interaction.options.getUser("kisi") ?? interaction.user;
      const evlilik = getMarriage(guildId, hedef.id);

      if (!evlilik) {
        const embed = new EmbedBuilder()
          .setColor(0x888888)
          .setTitle("💔 Bekâr")
          .setDescription(`${hedef} şu an bekâr. Kimse istemiyor olabilir... ya da çok seçici!`)
          .setFooter({ text: "Plutonium Medeni Hal Kayıt Sistemi" });
        return interaction.reply({ embeds: [embed] });
      }

      const es = await fetchUser(interaction, evlilik.spouseId);
      const sure = Math.floor((Date.now() - evlilik.since) / (1000 * 60 * 60 * 24));
      const cocuklar = evlilik.children.length > 0
        ? evlilik.children.map(id => `<@${id}>`).join(", ")
        : "Henüz çocuk yok";

      const embed = new EmbedBuilder()
        .setColor(0xff69b4)
        .setTitle("💑 Medeni Durum")
        .setDescription(`${hedef} evli! 💍`)
        .addFields(
          { name: "💍 Eş", value: es ? `${es}` : `<@${evlilik.spouseId}>`, inline: true },
          { name: "📅 Evlilik Süresi", value: `${sure} gün`, inline: true },
          { name: "👶 Çocuklar", value: cocuklar },
        )
        .setFooter({ text: "Plutonium Medeni Hal Kayıt Sistemi" })
        .setTimestamp(evlilik.since);

      return interaction.reply({ embeds: [embed] });
    }

    // ── BOŞANMA ─────────────────────────────────────────────────────────────
    else if (sub === "bosan") {
      const evlilik = getMarriage(guildId, userId);

      if (!evlilik) {
        return interaction.reply({ content: "❌ Zaten bekârsın! Önce biriyle evlen.", ephemeral: true });
      }

      const es = await fetchUser(interaction, evlilik.spouseId);
      const sure = Math.floor((Date.now() - evlilik.since) / (1000 * 60 * 60 * 24));

      const onayla = new ButtonBuilder()
        .setCustomId("divorce_confirm")
        .setLabel("💔 Evet, boşanıyoruz!")
        .setStyle(ButtonStyle.Danger);

      const iptal = new ButtonBuilder()
        .setCustomId("divorce_cancel")
        .setLabel("😅 Hayır, affettim")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(onayla, iptal);

      const embed = new EmbedBuilder()
        .setColor(0xff4444)
        .setTitle("💔 Boşanma İsteği")
        .setDescription(
          `${es ? es.username : "eşin"}den boşanmak istediğinden emin misin?\n\n` +
          `**${sure} günlük evlilik** çöp olacak... 😢`
        )
        .setFooter({ text: "Bu işlem geri alınamaz!" });

      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30_000,
        filter: i => i.user.id === userId,
      });

      collector.on("collect", async i => {
        if (i.customId === "divorce_confirm") {
          divorce(guildId, userId);

          const dramEmbed = new EmbedBuilder()
            .setColor(0x333333)
            .setTitle("📜 Boşanma Kararı Verildi")
            .setDescription(
              `${interaction.user} ve ${es ?? `<@${evlilik.spouseId}>`} resmen boşandı! 💔\n\n` +
              `${sure} günlük evlilik sona erdi. Avukatlar hazırlanıyor...`
            )
            .addFields({ name: "🎭 Son Söz", value: "Mutlu olmanızı dileriz. Ayrı ayrı." })
            .setFooter({ text: "Plutonium Boşanma Mahkemesi™" })
            .setTimestamp();

          await i.update({ embeds: [dramEmbed], components: [] });
        } else {
          await i.update({ content: "😅 Vazgeçtin! Evliliğin kurtarıldı.", embeds: [], components: [] });
        }
        collector.stop();
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          await interaction.editReply({ content: "⏰ Zaman doldu. Boşanma iptal.", embeds: [], components: [] }).catch(() => {});
        }
      });
    }

    // ── ÇOCUK EDİNME ────────────────────────────────────────────────────────
    else if (sub === "cocuk-edin") {
      const hedef = interaction.options.getUser("kisi", true);
      const evlilik = getMarriage(guildId, userId);

      if (!evlilik) {
        return interaction.reply({ content: "❌ Çocuk edinmek için önce evlenmen lazım!", ephemeral: true });
      }
      if (hedef.id === userId || hedef.id === evlilik.spouseId) {
        return interaction.reply({ content: "❌ Kendini veya eşini çocuk yapamassın!", ephemeral: true });
      }
      if (evlilik.children.includes(hedef.id)) {
        return interaction.reply({ content: `❌ ${hedef.username} zaten senin çocuğun!`, ephemeral: true });
      }
      if (evlilik.children.length >= 10) {
        return interaction.reply({ content: "❌ En fazla 10 çocuk edinebilirsin! (Sunucu nüfusu patlıyor.)", ephemeral: true });
      }

      adoptChild(guildId, userId, hedef.id);

      const es = await fetchUser(interaction, evlilik.spouseId);
      const embed = new EmbedBuilder()
        .setColor(0x00bfff)
        .setTitle("👶 Yeni Aile Üyesi!")
        .setDescription(
          `${interaction.user} ve ${es ?? `<@${evlilik.spouseId}>`} yeni bir çocuk edindi! 🎉\n\n` +
          `Hoş geldin, ${hedef}! Aileye dahil oldun! 🍼`
        )
        .setFooter({ text: "Plutonium Aile Hizmetleri™" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ── SOY AĞACI ───────────────────────────────────────────────────────────
    else if (sub === "soy-agaci") {
      const hedef = interaction.options.getUser("kisi") ?? interaction.user;
      const evlilik = getMarriage(guildId, hedef.id);

      if (!evlilik) {
        const embed = new EmbedBuilder()
          .setColor(0x888888)
          .setTitle("🌳 Aile Ağacı")
          .setDescription(`${hedef.username} bekâr. Ağaç daha filizlenmemiş. 🌱`)
          .setFooter({ text: "Plutonium Soy Ağacı Sistemi" });
        return interaction.reply({ embeds: [embed] });
      }

      const es = await fetchUser(interaction, evlilik.spouseId);
      const sure = Math.floor((Date.now() - evlilik.since) / (1000 * 60 * 60 * 24));

      let agac = `👑 **${hedef.username}** 💍 **${es?.username ?? "Bilinmiyor"}**\n`;
      agac += `┃  📅 ${sure} gündür evliler\n`;

      if (evlilik.children.length > 0) {
        agac += `┃\n`;
        for (let i = 0; i < evlilik.children.length; i++) {
          const isLast = i === evlilik.children.length - 1;
          agac += `${isLast ? "└" : "├"}── 👶 <@${evlilik.children[i]}>\n`;
        }
      } else {
        agac += `┗━ 🌱 Henüz çocuk yok`;
      }

      const embed = new EmbedBuilder()
        .setColor(0x228b22)
        .setTitle(`🌳 ${hedef.username}'in Aile Ağacı`)
        .setDescription(agac)
        .addFields(
          { name: "💍 Eş", value: es ? `${es}` : `<@${evlilik.spouseId}>`, inline: true },
          { name: "👶 Çocuk Sayısı", value: `${evlilik.children.length}`, inline: true },
          { name: "📅 Evlilik", value: `${sure} gün önce`, inline: true },
        )
        .setFooter({ text: "Plutonium Soy Ağacı Sistemi™" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
