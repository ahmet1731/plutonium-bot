import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { getGuildSettings, updateGuildSettings } from "../data/storage.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ayarlar")
    .setDescription("⚙️ Sunucu bot ayarları (Yönetici)")
    .addSubcommand(s => s
      .setName("goster")
      .setDescription("📋 Mevcut ayarları göster")
    )
    .addSubcommand(s => s
      .setName("hosgeldin-kanal")
      .setDescription("👋 Hoş geldin mesaj kanalını ayarla")
      .addChannelOption(o => o.setName("kanal").setDescription("Kanal").setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(s => s
      .setName("veda-kanal")
      .setDescription("👋 Ayrılma mesaj kanalını ayarla")
      .addChannelOption(o => o.setName("kanal").setDescription("Kanal").setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(s => s
      .setName("log-kanal")
      .setDescription("📝 Log kanalını ayarla")
      .addChannelOption(o => o.setName("kanal").setDescription("Kanal").setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(s => s
      .setName("oto-rol")
      .setDescription("🎭 Yeni üyeye otomatik verilecek rolü ayarla")
      .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true))
    )
    .addSubcommand(s => s
      .setName("sifirla")
      .setDescription("🔄 Tüm ayarları sıfırla")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild!.id;

    if (sub !== "goster") {
      if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ content: "❌ Sunucu Yönet yetkisi gerekli!", ephemeral: true });
    }

    if (sub === "goster") {
      const s = getGuildSettings(guildId);
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`⚙️ ${interaction.guild!.name} — Bot Ayarları`)
        .addFields(
          { name: "👋 Hoş Geldin Kanalı", value: s.welcomeChannelId ? `<#${s.welcomeChannelId}>` : "Ayarlanmamış", inline: true },
          { name: "👋 Veda Kanalı", value: s.leaveChannelId ? `<#${s.leaveChannelId}>` : "Ayarlanmamış", inline: true },
          { name: "📝 Log Kanalı", value: s.logChannelId ? `<#${s.logChannelId}>` : "Ayarlanmamış", inline: true },
          { name: "🎭 Oto-Rol", value: s.autoRoleId ? `<@&${s.autoRoleId}>` : "Ayarlanmamış", inline: true },
        )
        .setFooter({ text: "✦ Plutonium Bot • Sunucu Ayarları" })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "hosgeldin-kanal") {
      const kanal = interaction.options.getChannel("kanal")!;
      updateGuildSettings(guildId, { welcomeChannelId: kanal.id });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff88)
        .setTitle("✅ Hoş Geldin Kanalı Ayarlandı")
        .setDescription(`Hoş geldin mesajları artık <#${kanal.id}> kanalına gönderilecek.`)
        .setFooter({ text: "✦ Plutonium Bot • Ayarlar" })] });
    }

    if (sub === "veda-kanal") {
      const kanal = interaction.options.getChannel("kanal")!;
      updateGuildSettings(guildId, { leaveChannelId: kanal.id });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff88)
        .setTitle("✅ Veda Kanalı Ayarlandı")
        .setDescription(`Ayrılma mesajları artık <#${kanal.id}> kanalına gönderilecek.`)
        .setFooter({ text: "✦ Plutonium Bot • Ayarlar" })] });
    }

    if (sub === "log-kanal") {
      const kanal = interaction.options.getChannel("kanal")!;
      updateGuildSettings(guildId, { logChannelId: kanal.id });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff88)
        .setTitle("✅ Log Kanalı Ayarlandı")
        .setDescription(`Log mesajları artık <#${kanal.id}> kanalına gönderilecek.`)
        .setFooter({ text: "✦ Plutonium Bot • Ayarlar" })] });
    }

    if (sub === "oto-rol") {
      const rol = interaction.options.getRole("rol")!;
      updateGuildSettings(guildId, { autoRoleId: rol.id });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff88)
        .setTitle("✅ Oto-Rol Ayarlandı")
        .setDescription(`Yeni üyeler otomatik olarak <@&${rol.id}> rolünü alacak.`)
        .setFooter({ text: "✦ Plutonium Bot • Ayarlar" })] });
    }

    if (sub === "sifirla") {
      updateGuildSettings(guildId, { welcomeChannelId: undefined, leaveChannelId: undefined, logChannelId: undefined, autoRoleId: undefined });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff4444)
        .setTitle("🔄 Ayarlar Sıfırlandı")
        .setDescription("Tüm bot ayarları sıfırlandı.")
        .setFooter({ text: "✦ Plutonium Bot • Ayarlar" })] });
    }
  },
};
