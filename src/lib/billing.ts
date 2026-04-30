import type { BillingTier } from "@/lib/types";

export const FREE_APPLICATION_LIMIT_MONTHLY = 10;
export const PRO_MONTHLY_PRICE_CENTS = 1900;

export const PLAN_BY_TIER: Record<BillingTier, { name: string; monthlyLimit: number | null }> = {
  free: {
    name: "Free",
    monthlyLimit: FREE_APPLICATION_LIMIT_MONTHLY,
  },
  pro: {
    name: "Pro",
    monthlyLimit: null,
  },
};

export function canQueueApplication(
  tier: BillingTier,
  currentMonthCount: number,
): { allowed: boolean; reason?: string } {
  const plan = PLAN_BY_TIER[tier];
  if (plan.monthlyLimit === null) return { allowed: true };
  if (currentMonthCount < plan.monthlyLimit) return { allowed: true };
  return {
    allowed: false,
    reason: `Free plan limit reached (${FREE_APPLICATION_LIMIT_MONTHLY}/month).`,
  };
}
