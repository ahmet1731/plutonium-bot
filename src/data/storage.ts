import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "..", "data");
const VOICE_FILE = join(DATA_DIR, "voice.json");
const MANUAL_RANKS_FILE = join(DATA_DIR, "manual_ranks.json");

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export interface UserVoiceData {
  totalSeconds: number;
  lastJoinedAt: number | null;
  guildId: string;
}

export interface VoiceStore {
  [userId: string]: UserVoiceData;
}

export interface ManualRankStore {
  [guildId: string]: {
    [userId: string]: string;
  };
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown): void {
  writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export function getVoiceStore(): VoiceStore {
  return readJson<VoiceStore>(VOICE_FILE, {});
}

export function saveVoiceStore(store: VoiceStore): void {
  writeJson(VOICE_FILE, store);
}

export function getUserVoiceData(userId: string, guildId: string): UserVoiceData {
  const store = getVoiceStore();
  return store[`${guildId}:${userId}`] ?? { totalSeconds: 0, lastJoinedAt: null, guildId };
}

export function setUserJoined(userId: string, guildId: string): void {
  const store = getVoiceStore();
  const key = `${guildId}:${userId}`;
  const current = store[key] ?? { totalSeconds: 0, lastJoinedAt: null, guildId };
  store[key] = { ...current, lastJoinedAt: Date.now() };
  saveVoiceStore(store);
}

export function setUserLeft(userId: string, guildId: string): number {
  const store = getVoiceStore();
  const key = `${guildId}:${userId}`;
  const current = store[key];
  if (!current || !current.lastJoinedAt) return 0;

  const secondsSpent = Math.floor((Date.now() - current.lastJoinedAt) / 1000);
  store[key] = {
    ...current,
    totalSeconds: current.totalSeconds + secondsSpent,
    lastJoinedAt: null,
  };
  saveVoiceStore(store);
  return secondsSpent;
}

export function getTopVoiceUsers(guildId: string, limit = 10): Array<{ userId: string; totalSeconds: number }> {
  const store = getVoiceStore();
  return Object.entries(store)
    .filter(([key]) => key.startsWith(`${guildId}:`))
    .map(([key, data]) => ({
      userId: key.replace(`${guildId}:`, ""),
      totalSeconds: data.totalSeconds,
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
    .slice(0, limit);
}

export function getManualRankStore(): ManualRankStore {
  return readJson<ManualRankStore>(MANUAL_RANKS_FILE, {});
}

export function setManualRank(guildId: string, userId: string, rankName: string): void {
  const store = getManualRankStore();
  if (!store[guildId]) store[guildId] = {};
  store[guildId][userId] = rankName;
  writeJson(MANUAL_RANKS_FILE, store);
}

export function clearManualRank(guildId: string, userId: string): void {
  const store = getManualRankStore();
  if (store[guildId]) {
    delete store[guildId][userId];
    writeJson(MANUAL_RANKS_FILE, store);
  }
}

// ─── EKONOMİ ───────────────────────────────────────────────────────────────
const ECONOMY_FILE = join(DATA_DIR, "economy.json");
export interface EconomyUser {
  balance: number;
  bank: number;
  lastDaily: number;
  lastWork: number;
  lastRob: number;
  dailyStreak: number;
}
export type EconomyStore = Record<string, Record<string, EconomyUser>>;

const defaultEco = (): EconomyUser => ({
  balance: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, dailyStreak: 0,
});

export function getEconomyStore(): EconomyStore {
  return readJson<EconomyStore>(ECONOMY_FILE, {});
}
export function saveEconomyStore(s: EconomyStore): void { writeJson(ECONOMY_FILE, s); }
export function getEcoUser(guildId: string, userId: string): EconomyUser {
  const s = getEconomyStore();
  return s[guildId]?.[userId] ?? defaultEco();
}
export function saveEcoUser(guildId: string, userId: string, data: EconomyUser): void {
  const s = getEconomyStore();
  if (!s[guildId]) s[guildId] = {};
  s[guildId][userId] = data;
  saveEconomyStore(s);
}
export function getTopEcoUsers(guildId: string, limit = 10) {
  const s = getEconomyStore();
  return Object.entries(s[guildId] ?? {})
    .map(([userId, d]) => ({ userId, total: d.balance + d.bank }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ─── AFK ───────────────────────────────────────────────────────────────────
const AFK_FILE = join(DATA_DIR, "afk.json");
export interface AfkEntry { message: string; since: number; }
export type AfkStore = Record<string, Record<string, AfkEntry>>;

export function getAfkStore(): AfkStore { return readJson<AfkStore>(AFK_FILE, {}); }
export function saveAfkStore(s: AfkStore): void { writeJson(AFK_FILE, s); }
export function getAfk(guildId: string, userId: string): AfkEntry | null {
  return getAfkStore()[guildId]?.[userId] ?? null;
}
export function setAfk(guildId: string, userId: string, message: string): void {
  const s = getAfkStore();
  if (!s[guildId]) s[guildId] = {};
  s[guildId][userId] = { message, since: Date.now() };
  saveAfkStore(s);
}
export function clearAfk(guildId: string, userId: string): void {
  const s = getAfkStore();
  if (s[guildId]) { delete s[guildId][userId]; saveAfkStore(s); }
}

// ─── SUNUCU AYARLARI ───────────────────────────────────────────────────────
const SETTINGS_FILE = join(DATA_DIR, "settings.json");
export interface GuildSettings {
  welcomeChannelId?: string;
  leaveChannelId?: string;
  logChannelId?: string;
  autoRoleId?: string;
  prefix?: string;
}
export type SettingsStore = Record<string, GuildSettings>;

export function getSettingsStore(): SettingsStore { return readJson<SettingsStore>(SETTINGS_FILE, {}); }
export function saveSettingsStore(s: SettingsStore): void { writeJson(SETTINGS_FILE, s); }
export function getGuildSettings(guildId: string): GuildSettings {
  return getSettingsStore()[guildId] ?? {};
}
export function updateGuildSettings(guildId: string, patch: Partial<GuildSettings>): void {
  const s = getSettingsStore();
  s[guildId] = { ...(s[guildId] ?? {}), ...patch };
  saveSettingsStore(s);
}

// ─── EVLİLİK SİSTEMİ ──────────────────────────────────────────────────────
const MARRIAGE_FILE = join(DATA_DIR, "marriages.json");

export interface MarriageEntry {
  spouseId: string;
  since: number;
  children: string[];
}
export type MarriageStore = Record<string, Record<string, MarriageEntry>>;

export function getMarriageStore(): MarriageStore {
  return readJson<MarriageStore>(MARRIAGE_FILE, {});
}
export function saveMarriageStore(s: MarriageStore): void { writeJson(MARRIAGE_FILE, s); }

export function getMarriage(guildId: string, userId: string): MarriageEntry | null {
  return getMarriageStore()[guildId]?.[userId] ?? null;
}

export function marry(guildId: string, userId1: string, userId2: string): void {
  const s = getMarriageStore();
  if (!s[guildId]) s[guildId] = {};
  const now = Date.now();
  s[guildId][userId1] = { spouseId: userId2, since: now, children: [] };
  s[guildId][userId2] = { spouseId: userId1, since: now, children: [] };
  saveMarriageStore(s);
}

export function divorce(guildId: string, userId: string): void {
  const s = getMarriageStore();
  const entry = s[guildId]?.[userId];
  if (!entry) return;
  delete s[guildId][entry.spouseId];
  delete s[guildId][userId];
  saveMarriageStore(s);
}

export function adoptChild(guildId: string, parentId: string, childId: string): void {
  const s = getMarriageStore();
  const entry = s[guildId]?.[parentId];
  if (!entry) return;
  if (!entry.children.includes(childId)) entry.children.push(childId);
  const spouseEntry = s[guildId]?.[entry.spouseId];
  if (spouseEntry && !spouseEntry.children.includes(childId)) spouseEntry.children.push(childId);
  saveMarriageStore(s);
}

// ─── ÇEKİLİŞ ──────────────────────────────────────────────────────────────
const GIVEAWAY_FILE = join(DATA_DIR, "giveaways.json");
export interface Giveaway {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  prize: string;
  winnerCount: number;
  endsAt: number;
  hostId: string;
  participants: string[];
  ended: boolean;
  winners: string[];
}
export type GiveawayStore = Record<string, Giveaway>;

export function getGiveawayStore(): GiveawayStore { return readJson<GiveawayStore>(GIVEAWAY_FILE, {}); }
export function saveGiveawayStore(s: GiveawayStore): void { writeJson(GIVEAWAY_FILE, s); }
export function getGiveaway(id: string): Giveaway | null { return getGiveawayStore()[id] ?? null; }
export function saveGiveaway(g: Giveaway): void {
  const s = getGiveawayStore();
  s[g.id] = g;
  saveGiveawayStore(s);
}
export function getActiveGiveaways(guildId: string): Giveaway[] {
  return Object.values(getGiveawayStore()).filter(g => g.guildId === guildId && !g.ended);
}
