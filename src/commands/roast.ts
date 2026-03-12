import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

const roastlar = [
  "Profil resmin o kadar karanlık ki NASA bunu kara delik sanıp incelemeye aldı.",
  "Mesajların Voyager 1'in yolculuğu kadar uzun ve hiç bitmeyecekmiş gibi hissettiriyor.",
  "Zeka düzeyin Plüton'un atmosfer yoğunluğu kadar: Var mı yok mu belli değil.",
  "Senin Discord aktiviten Mars'taki yaşam belirtileri kadar: Olmadığı kesin ama araştırmaya devam.",
  "Emoji kullanım şeklin Satürn'ün halkaları gibi: Anlamsız ama göz alıcı.",
  "Uyku düzenin yok diyorlar. Doğru — ışık yıllarında ölçülmüş düzensizlik.",
  "Fikirlerinin yarısı kara deliğe çekiliyor: Hiçbiri geri dönmüyor.",
  "Mesajlarını okuyunca beyin hücrelelerim intihar girişiminde bulundu.",
  "Avatarın Plüton gibi: Küçük, soğuk ve artık kimse seni gezegen saymıyor.",
  "Yazım hatalarını saymak için bir yapay zeka değil, arkeolog gerekiyor.",
  "Aktivite durumun 'Çevrimiçi' ama ruhu Andromeda galaksisinde.",
  "Bir gün ünlü olacaksın diyorlar. Plüton da bir gün gezegen olacak diyorlar.",
  "Sesi uzaya atsalar kimse duymaz. Neyse ki Discord'da da duyan yok.",
  "Profil biyografin o kadar boş ki evrenin ısısından daha soğuk: Mutlak sıfır.",
];

const nazikRoastlar = [
  "Aslında çok iyisin ama yapay zeka bunu söylersem sıkıcı olur.",
  "Seni roast etmek istedim ama vicdan devreye girdi. Az önce yendi.",
  "Hatalarını bulmaya çalıştım... biraz daha arama yaparım.",
];

export default {
  data: new SlashCommandBuilder()
    .setName("roast")
    .setDescription("🔥 Birini uzay temalı yakıcı şekilde roast et!")
    .addUserOption((opt) =>
      opt.setName("kullanici").setDescription("Kim roast edilecek?").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const hedef = interaction.options.getUser("kullanici")!;

    if (hedef.id === interaction.client.user.id) {
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("🤖 Beni mi Roast Edecektin?")
        .setDescription(
          "Ben bir yapay zekayım. Duygularım yok.\n\n" +
          "...Bu yalan. Çok incindi. 😢\n\n" +
          "Ama ben de seni roast edebilirim: **Bir botu roast etmeye çalışmak bile başlı başına trajik.**"
        )
        .setFooter({ text: "✦ Plutonium Bot • Alınganlık Modunda" });
      return interaction.reply({ embeds: [embed] });
    }

    await interaction.deferReply();
    await new Promise((r) => setTimeout(r, 1500));

    const roastMetni =
      Math.random() > 0.9
        ? nazikRoastlar[Math.floor(Math.random() * nazikRoastlar.length)]
        : roastlar[Math.floor(Math.random() * roastlar.length)];

    const embed = new EmbedBuilder()
      .setColor(0xff6b35)
      .setTitle(`🔥 Uzay Roast — ${hedef.displayName ?? hedef.username}`)
      .setThumbnail(hedef.displayAvatarURL({ size: 128 }))
      .setDescription(`*"${roastMetni}"*`)
      .addFields({
        name: "🤖 Yapay Zeka Değerlendirmesi",
        value: `Roast şiddeti: **${Math.floor(Math.random() * 40 + 60)}/100** 🔥`,
      })
      .setFooter({ text: "✦ Uyarı: Bu tamamen eğlence amaçlıdır. Plüton onaylamıştır." })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
