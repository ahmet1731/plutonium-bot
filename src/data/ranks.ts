export interface Rank {
  name: string;
  emoji: string;
  minSeconds: number;
  color: number;
  description: string;
}

export const RANKS: Rank[] = [
  {
    name: "🌙 Ay Gezgini",
    emoji: "🌙",
    minSeconds: 30 * 60,          // 30 dakika
    color: 0xb0c4de,
    description: "Uzayın kapısında ilk adımını attın!",
  },
  {
    name: "⭐ Yıldız Kâşifi",
    emoji: "⭐",
    minSeconds: 2 * 60 * 60,      // 2 saat
    color: 0xffd700,
    description: "Yıldızların arasında kaybolmaya başladın.",
  },
  {
    name: "🪐 Gezegen Avcısı",
    emoji: "🪐",
    minSeconds: 5 * 60 * 60,      // 5 saat
    color: 0x9b59b6,
    description: "Güneş sistemi senin oyun alanın!",
  },
  {
    name: "☄️ Nebula Kâşifi",
    emoji: "☄️",
    minSeconds: 15 * 60 * 60,     // 15 saat
    color: 0xe74c3c,
    description: "Uzayın derinliklerine doğru ilerliyorsun.",
  },
  {
    name: "🌌 Galaksi Komutanı",
    emoji: "🌌",
    minSeconds: 30 * 60 * 60,     // 30 saat
    color: 0x1abc9c,
    description: "Galaksiler senin emrinde!",
  },
  {
    name: "🚀 Uzay Kaptanı",
    emoji: "🚀",
    minSeconds: 50 * 60 * 60,     // 50 saat
    color: 0x3498db,
    description: "Evrenin kaptanısın, gemi hazır!",
  },
  {
    name: "👑 Plüton Efendisi",
    emoji: "👑",
    minSeconds: 100 * 60 * 60,    // 100 saat
    color: 0xff6b35,
    description: "Plüton bile sana saygı duyuyor. Efsane.",
  },
];

export const ALL_RANK_NAMES = RANKS.map((r) => r.name);

export function getRankForSeconds(seconds: number): Rank | null {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (seconds >= RANKS[i].minSeconds) return RANKS[i];
  }
  return null;
}

export function getNextRank(seconds: number): Rank | null {
  for (const rank of RANKS) {
    if (seconds < rank.minSeconds) return rank;
  }
  return null;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h} saat ${m} dakika`;
  if (m > 0) return `${m} dakika ${s} saniye`;
  return `${s} saniye`;
}
