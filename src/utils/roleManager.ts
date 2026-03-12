import { Guild, GuildMember, Role } from "discord.js";
import { RANKS, Rank, ALL_RANK_NAMES } from "../data/ranks.js";

export async function ensureRoleExists(guild: Guild, rank: Rank): Promise<Role> {
  let role = guild.roles.cache.find((r) => r.name === rank.name);
  if (!role) {
    role = await guild.roles.create({
      name: rank.name,
      color: rank.color,
      reason: "Plutonium Bot — Otomatik ses rütbesi",
      mentionable: false,
      hoist: true,
    });
    console.log(`✅ Rol oluşturuldu: ${rank.name}`);
  }
  return role;
}

export async function assignRankRole(member: GuildMember, rank: Rank): Promise<boolean> {
  try {
    const guild = member.guild;
    const targetRole = await ensureRoleExists(guild, rank);

    const currentRankRoles = member.roles.cache.filter((r) =>
      ALL_RANK_NAMES.includes(r.name)
    );

    if (currentRankRoles.some((r) => r.name === rank.name)) {
      return false;
    }

    const toRemove = currentRankRoles.map((r) => r.id);
    if (toRemove.length > 0) {
      await member.roles.remove(toRemove, "Plutonium Bot — Rütbe güncelleme");
    }

    await member.roles.add(targetRole, "Plutonium Bot — Rütbe kazanıldı");
    return true;
  } catch (err) {
    console.error(`❌ Rol atama hatası (${member.user.tag}):`, err);
    return false;
  }
}

export async function removeAllRankRoles(member: GuildMember): Promise<void> {
  const toRemove = member.roles.cache
    .filter((r) => ALL_RANK_NAMES.includes(r.name))
    .map((r) => r.id);
  if (toRemove.length > 0) {
    await member.roles.remove(toRemove, "Plutonium Bot — Rütbe sıfırlama");
  }
}

export function getCurrentRankRole(member: GuildMember): string | null {
  const found = member.roles.cache.find((r) => ALL_RANK_NAMES.includes(r.name));
  return found ? found.name : null;
}
