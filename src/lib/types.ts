export type PassportCard = {
  firstName: string; stampsOnCard: number; totalStamps: number; cardsCompleted: number;
  stamps: { n: number; stampedAt: string }[];
  reward: { code: string; percent: number; expiresAt: string } | null;
  history: { date: string; stamps: number }[];
};
