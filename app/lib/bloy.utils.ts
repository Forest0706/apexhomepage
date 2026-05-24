export interface BloyVipTier {
  name: string;
  minPoints: number;
  color: string;
}

export const BLOY_CONFIG = {
  pointsPerYen: 0.01,
  signupBonus: 100,
  birthdayBonus: 100,
  referralBonus: 300,
  vipTiers: [
    {name: 'Bronze', minPoints: 0, color: '#cd7f32'},
    {name: 'Silver', minPoints: 500, color: '#a8a29e'},
    {name: 'Gold', minPoints: 2000, color: '#d4a843'},
    {name: 'Platinum', minPoints: 5000, color: '#78716c'},
    {name: 'Diamond', minPoints: 10000, color: '#5a31f4'},
  ] as BloyVipTier[],
} as const;

const VIP_TIERS: BloyVipTier[] = [...BLOY_CONFIG.vipTiers];

export function getVipTier(points: number): BloyVipTier {
  let tier = VIP_TIERS[0];
  for (const t of VIP_TIERS) {
    if (points >= t.minPoints) tier = t;
  }
  return tier;
}

export const POINTS_PER_YEN = BLOY_CONFIG.pointsPerYen;

export function calculateEarnPoints(priceAmount: string | number): number {
  return Math.floor(Number(priceAmount) * BLOY_CONFIG.pointsPerYen);
}
