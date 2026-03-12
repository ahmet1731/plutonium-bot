import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("mod")
    .setDescription("🛡️ Moderasyon komutları")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
      sub
        .setName("kick")
        .setDescription("👢 Kullanıcıyı sunucudan at")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("ban")
        .setDescription("🔨 Kullanıcıyı yasakla")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("unban")
        .setDescription("🔓 Kullanıcının yasağını kaldır")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Kullanıcı ID").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("timeout")
        .setDescription("⏰ Kullanıcıyı sustur")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("dakika")
            .setDescription("Kaç dakika? (1-40320)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(40320)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("temizle")
        .setDescription("🧹 Kanal mesajlarını temizle")
        .addIntegerOption((opt) =>
          opt
            .setName("miktar")
            .setDescription("Silinecek mesaj sayısı (1-100)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "kick") {
      const hedef = interaction.options.getMember("kullanici") as GuildMember;
      const sebep = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

      if (!hedef.kickable) {
        return interaction.reply({ content: "❌ Bu kullanıcıyı atamazsın!", ephemeral: true });
      }

      await hedef.kick(sebep);

      const embed = new EmbedBuilder()
        .setColor(0xff6b35)
        .setTitle("👢 Kullanıcı Atıldı")
        .addFields(
          { name: "Kullanıcı", value: `${hedef.user.tag}`, inline: true },
          { name: "Moderatör", value: `${interaction.user.tag}`, inline: true },
          { name: "Sebep", value: sebep }
        )
        .setFooter({ text: "✦ Plutonium Moderasyon" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "ban") {
      const hedef = interaction.options.getMember("kullanici") as GuildMember;
      const sebep = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

      if (!hedef.bannable) {
        return interaction.reply({ content: "❌ Bu kullanıcıyı yasaklayamazsın!", ephemeral: true });
      }

      await hedef.ban({ reason: sebep });

      const embed = new EmbedBuilder()
        .setColor(0xff2222)
        .setTitle("🔨 Kullanıcı Yasaklandı")
        .addFields(
          { name: "Kullanıcı", value: `${hedef.user.tag}`, inline: true },
          { name: "Moderatör", value: `${interaction.user.tag}`, inline: true },
          { name: "Sebep", value: sebep }
        )
        .setFooter({ text: "✦ Plutonium Moderasyon" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "unban") {
      const id = interaction.options.getString("id")!;
      try {
        await interaction.guild!.members.unban(id);
        const embed = new EmbedBuilder()
          .setColor(0x00ff88)
          .setTitle("🔓 Yasak Kaldırıldı")
          .setDescription(`ID: \`${id}\` olan kullanıcının yasağı kaldırıldı.`)
          .setFooter({ text: "✦ Plutonium Moderasyon" })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } catch {
        return interaction.reply({ content: "❌ Kullanıcı bulunamadı veya yasaklı değil!", ephemeral: true });
      }
    }

    if (sub === "timeout") {
      const hedef = interaction.options.getMember("kullanici") as GuildMember;
      const dakika = interaction.options.getInteger("dakika")!;
      const sebep = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

      if (!hedef.moderatable) {
        return interaction.reply({ content: "❌ Bu kullanıcıyı susturayamazsın!", ephemeral: true });
      }

      await hedef.timeout(dakika * 60 * 1000, sebep);

      const embed = new EmbedBuilder()
        .setColor(0xffaa00)
        .setTitle("⏰ Kullanıcı Susturuldu")
        .addFields(
          { name: "Kullanıcı", value: `${hedef.user.tag}`, inline: true },
          { name: "Süre", value: `${dakika} dakika`, inline: true },
          { name: "Moderatör", value: `${interaction.user.tag}`, inline: true },
          { name: "Sebep", value: sebep }
        )
        .setFooter({ text: "✦ Plutonium Moderasyon" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "temizle") {
      const miktar = interaction.options.getInteger("miktar")!;
      if (!interaction.channel || !interaction.channel.isTextBased()) return;

      const silinenler = await (interaction.channel as import("discord.js").TextChannel).bulkDelete(miktar, true);

      const embed = new EmbedBuilder()
        .setColor(0x00ccff)
        .setTitle("🧹 Mesajlar Temizlendi")
        .setDescription(`**${silinenler.size}** mesaj başarıyla silindi.`)
        .setFooter({ text: "✦ Plutonium Moderasyon" })
        .setTimestamp();

      const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }
  },
};
