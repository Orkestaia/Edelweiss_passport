import "server-only";
import type { PassportCard } from "./types";
export async function getPassport(token: string): Promise<PassportCard | null> {
  if (!/^[\w-]{43}$/.test(token)) return null;
  const base = process.env.PASSPORT_API_BASE_URL;
  const secret = process.env.PASSPORT_READ_SECRET;
  if (!base || !secret) throw new Error("Passport is temporarily unavailable");
  let response: Response;
  try { response = await fetch(`${base.replace(/\/$/, "")}/api/passport/card/${token}`, { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store", signal: AbortSignal.timeout(10000) }); }
  catch { throw new Error("Passport is temporarily unavailable"); }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Passport is temporarily unavailable");
  const body = await response.json();
  // Whitelist the server-to-client projection even if the upstream contract ever grows.
  return { firstName: body.firstName, stampsOnCard: body.stampsOnCard, totalStamps: body.totalStamps, cardsCompleted: body.cardsCompleted, stamps: body.stamps.map((s: PassportCard["stamps"][number]) => ({ n: s.n, stampedAt: s.stampedAt })), reward: body.reward ? { code: body.reward.code, percent: body.reward.percent, expiresAt: body.reward.expiresAt } : null, history: body.history.map((h: PassportCard["history"][number]) => ({ date: h.date, stamps: h.stamps })) };
}
